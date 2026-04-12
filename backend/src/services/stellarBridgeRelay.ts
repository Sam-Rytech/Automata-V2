// stellarBridgeRelay.ts
// Polls Circle attestation API after a CCTP burn on Base.
// Once attested, builds and submits the Stellar mint transaction autonomously
// using the backend relayer keypair. The user never needs to sign a second time.

import {
  TransactionBuilder,
  Operation,
  Contract,
  Networks,
  Keypair,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
} from '@stellar/stellar-sdk';
import { horizonServer, sorobanServer, STELLAR_NETWORK_PASSPHRASE } from '../utils/rpc';

// ---------------------------------------------------------------------------
// Circle CCTP Stellar contract addresses (mainnet)
// Verify these at https://developers.circle.com/stablecoins/cctp-protocol-contract
// ---------------------------------------------------------------------------
const MESSAGE_TRANSMITTER_CONTRACT =
  process.env.CCTP_STELLAR_MESSAGE_TRANSMITTER ?? 'CCTP_MESSAGE_TRANSMITTER_PLACEHOLDER';

const CIRCLE_ATTESTATION_API = 'https://iris-api.circle.com/attestations';

const POLL_INTERVAL_MS  = 5_000;   // poll every 5 seconds
const MAX_POLL_ATTEMPTS = 60;      // give up after 5 minutes

// ---------------------------------------------------------------------------
// Poll Circle for attestation
// ---------------------------------------------------------------------------

async function pollAttestation(messageHash: string): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    try {
      const res  = await fetch(`${CIRCLE_ATTESTATION_API}/${messageHash}`);
      const json = await res.json() as any;

      if (json?.status === 'complete' && json?.attestation) {
        console.log(`[Bridge Relay] Attestation received for ${messageHash}`);
        return json.attestation as string;
      }

      console.log(`[Bridge Relay] Waiting for attestation (attempt ${attempt + 1})...`);
    } catch (err) {
      console.error('[Bridge Relay] Attestation poll error:', err);
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  console.error(`[Bridge Relay] Attestation timed out for ${messageHash}`);
  return null;
}

// ---------------------------------------------------------------------------
// Build and submit the Stellar mint transaction
// ---------------------------------------------------------------------------

async function submitStellarMint(
  message: string,
  attestation: string,
  relayerKeypair: Keypair
): Promise<string> {
  const relayerAccount = await horizonServer.loadAccount(relayerKeypair.publicKey());
  const contract       = new Contract(MESSAGE_TRANSMITTER_CONTRACT);

  // receiveMessage(message: bytes, attestation: bytes)
  const operation = contract.call(
    'receive_message',
    nativeToScVal(Buffer.from(message.replace('0x', ''), 'hex'), { type: 'bytes' }),
    nativeToScVal(Buffer.from(attestation.replace('0x', ''), 'hex'), { type: 'bytes' })
  );

  const tx = new TransactionBuilder(relayerAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate first to get resource fees
  const simResult = await sorobanServer.simulateTransaction(tx);
  if ('error' in simResult) {
    throw new Error(`Soroban simulation failed: ${(simResult as any).error}`);
  }

  const preparedTx = await sorobanServer.prepareTransaction(tx);
  (preparedTx as any).sign(relayerKeypair);

  const submitted = await horizonServer.submitTransaction(preparedTx as any);
  return submitted.hash;
}

// ---------------------------------------------------------------------------
// Main entry point — call this after the user signs the burn tx
// ---------------------------------------------------------------------------

export async function startBridgeRelay(params: {
  messageHash:      string;
  message:          string;
  recipientAddress: string;
  amount:           string;
  onSuccess?: (txHash: string) => void;
  onError?:  (err: Error)     => void;
}): Promise<void> {
  const relayerSecret = process.env.STELLAR_RELAYER_SECRET;
  if (!relayerSecret) {
    console.error('[Bridge Relay] STELLAR_RELAYER_SECRET not set — cannot relay mint');
    params.onError?.(new Error('Relayer not configured'));
    return;
  }

  const relayerKeypair = Keypair.fromSecret(relayerSecret);

  // Run entirely in the background — never awaited by the HTTP handler
  (async () => {
    try {
      console.log(`[Bridge Relay] Starting relay for message ${params.messageHash}`);

      const attestation = await pollAttestation(params.messageHash);
      if (!attestation) {
        throw new Error('Attestation polling timed out');
      }

      const txHash = await submitStellarMint(params.message, attestation, relayerKeypair);
      console.log(`[Bridge Relay] Stellar mint submitted: ${txHash}`);
      params.onSuccess?.(txHash);

    } catch (err: any) {
      console.error('[Bridge Relay] Relay failed:', err);
      params.onError?.(err);
    }
  })();
}
