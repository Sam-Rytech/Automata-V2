import { PrivyClient } from '@privy-io/node';
import { Transaction, Keypair } from '@stellar/stellar-sdk';
import { horizonServer, STELLAR_NETWORK_PASSPHRASE } from '../utils/rpc';

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

export async function signAndSubmitStellarXdr(
  walletId: string,
  xdr: string
): Promise<string> {
  const tx = new Transaction(xdr, STELLAR_NETWORK_PASSPHRASE);

  const txHash = tx.hash();
  const hashHex = '0x' + txHash.toString('hex');

  const signatureResponse = await (privy.wallets() as any).rawSign(walletId, {
    params: { hash: hashHex }
  });
  const signature = signatureResponse as unknown as string;

  const keypair = Keypair.fromPublicKey(tx.source);
  const signatureBytes = Buffer.from(signature.slice(2), 'hex');
  tx.addSignature(keypair.publicKey(), signatureBytes.toString('base64'));

  const result = await horizonServer.submitTransaction(tx);
  return result.hash;
}
