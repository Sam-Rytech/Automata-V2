import { Transaction, Keypair } from '@stellar/stellar-sdk';
import { horizonServer, STELLAR_NETWORK_PASSPHRASE } from '../utils/rpc';

export async function signAndSubmitStellarXdr(
  walletId: string,
  xdr: string
): Promise<string> {
  // 1. Parse the unsigned XDR
  const tx = new Transaction(xdr, STELLAR_NETWORK_PASSPHRASE);

  // 2. Hash the transaction
  const txHash = tx.hash();
  const hashHex = '0x' + txHash.toString('hex');

  // 3. Call Privy rawSign via HTTP — no SDK, no ESM conflict
  const appId = process.env.PRIVY_APP_ID!;
  const appSecret = process.env.PRIVY_APP_SECRET!;
  const credential = Buffer.from(`${appId}:${appSecret}`).toString('base64');

  const privyRes = await fetch(
    `https://auth.privy.io/api/v1/wallets/${walletId}/rpc`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': appId,
        'Authorization': `Basic ${credential}`,
      },
      body: JSON.stringify({
        method: 'secp256k1_sign',
        params: { hash: hashHex },
      }),
    }
  );

  if (!privyRes.ok) {
    const errText = await privyRes.text();
    throw new Error(`Privy rawSign failed (${privyRes.status}): ${errText}`);
  }

  const privyData = await privyRes.json() as { data: { signature: string } };
  const signature = privyData.data.signature; // "0x<hex>"

  // 4. Attach signature to the transaction
  const keypair = Keypair.fromPublicKey(tx.source);
  const signatureBytes = Buffer.from(signature.slice(2), 'hex');
  tx.addSignature(keypair.publicKey(), signatureBytes.toString('base64'));

  // 5. Submit to Horizon
  const result = await horizonServer.submitTransaction(tx);
  return result.hash;
}