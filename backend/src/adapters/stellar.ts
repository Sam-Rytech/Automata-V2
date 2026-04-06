import StellarSdk from '@stellar/stellar-sdk';

const server = new StellarSdk.Horizon.Server(
  process.env.STELLAR_HORIZON_URL ?? 'https://horizon.stellar.org'
);

export const STELLAR_USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

export async function getStellarBalances(publicKey: string): Promise<Record<string, string>> {
  try {
    const account = await server.loadAccount(publicKey);
    const balances: Record<string, string> = {};
    for (const balance of account.balances) {
      if (balance.asset_type === 'native') {
        balances['XLM'] = balance.balance;
      } else if (
        balance.asset_type === 'credit_alphanum4' &&
        (balance as any).asset_code === 'USDC' &&
        (balance as any).asset_issuer === STELLAR_USDC_ISSUER
      ) {
        balances['USDC'] = balance.balance;
      }
    }
    return balances;
  } catch (error) {
    console.error('Stellar balance fetch error:', error);
    return {};
  }
}
