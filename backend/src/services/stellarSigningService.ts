import { PrivyClient } from '@privy-io/node';
import { Transaction, Networks, Keypair } from '@stellar/stellar-sdk';
import { horizonServer, STELLAR_NETWORK_PASSPHRASE } from '../utils/rpc';

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function signAndSubmitStellarXdr(
  walletId: string,
  xdr: string
): Promise<string> {
  // 1. Parse the unsigned transaction
  const tx = new Transaction(xdr, STELLAR_NETWORK_PASSPHRASE);

  // 2. Get the transaction hash (the 32-byte payload to sign)
  const txHash = tx.hash();
  const hashHex = '0x' + txHash.toString('hex');

  // 3. Call Privy rawSign
  const signatureResponse = await (privy.wallets() as any).rawSign(walletId, {
    params: { hash: hashHex }
  });
  const signature = signatureResponse as unknown as string;

  // 4. Attach signature to the transaction
  const keypair = Keypair.fromPublicKey(tx.source);
  const signatureBytes = Buffer.from(signature.slice(2), 'hex');
  tx.addSignature(keypair.publicKey(), signatureBytes.toString('base64'));

  // 5. Submit to Horizon
  const result = await horizonServer.submitTransaction(tx);
  return result.hash;
}
