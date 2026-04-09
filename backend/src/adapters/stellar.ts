import {
  Horizon,
  SorobanRpc,
  Networks,
  Asset,
  Operation,
  TransactionBuilder,
  Transaction,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { horizonServer, sorobanServer, STELLAR_NETWORK_PASSPHRASE } from '../utils/rpc';

// ---------------------------------------------------------------------------
// stellar.ts — Stellar adapter.
//
// Covers everything the Automata agent needs on Stellar:
//   1. Known asset registry     (XLM, USDC, cKES, yXLM, EURC — verified issuers)
//   2. Account state            (balances, trustlines, sequence number)
//   3. Classic payment XDR      (simple send — XLM or any trustline asset)
//   4. Path payment XDR         (on-chain DEX swap + optional cross-asset send)
//   5. Trustline management XDR (open a trustline so an account can hold an asset)
//   6. Soroban simulation       (pre-flight any Soroban invocation before signing)
//   7. Fee-bumped XDR           (wrap a signed tx in a fee-bump for gasless UX)
//
// All "build" functions return unsigned XDR strings.
// The frontend signs them with the user's Stellar wallet via Privy.
// This backend never sees a private key.
// ---------------------------------------------------------------------------

// ── 1. Known asset registry ──────────────────────────────────────────────────

export const STELLAR_ASSETS: Record<string, { code: string; issuer: string | null }> = {
  XLM:  { code: 'XLM',  issuer: null },
  USDC: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
  EURC: { code: 'EURC', issuer: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP' },
  cKES: { code: 'cKES', issuer: 'GBHQNZT5HFMM5QXBKIVBX5CQGKXTZFB3K4BYHXM4FMXBCHKUYJ5BIQR' },
  yXLM: { code: 'yXLM', issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55' },
};

/** Returns a stellar-sdk Asset for a known symbol, or throws. */
export function getStellarAsset(symbol: string): Asset {
  const entry = STELLAR_ASSETS[symbol];
  if (!entry) {
    throw new Error(
      `Unknown Stellar asset: "${symbol}". Known: ${Object.keys(STELLAR_ASSETS).join(', ')}`
    );
  }
  return entry.issuer === null
    ? Asset.native()
    : new Asset(entry.code, entry.issuer);
}

// ── 2. Account state ─────────────────────────────────────────────────────────

export interface StellarAccountInfo {
  balances: Record<string, string>;
  trustlines: string[];
  sequence: string;
}

/**
 * Loads an account from Horizon and returns balances + trustline metadata.
 * Returns null if the account has never been funded (no ledger entry).
 */
export async function getStellarAccountInfo(
  publicKey: string
): Promise<StellarAccountInfo | null> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const balances: Record<string, string> = {};
    const trustlines: string[] = [];

    for (const b of account.balances) {
      if (b.asset_type === 'native') {
        balances['XLM'] = b.balance;
      } else {
        const code   = (b as any).asset_code   as string;
        const issuer = (b as any).asset_issuer as string;
        const known  = Object.entries(STELLAR_ASSETS).find(
          ([, v]) => v.code === code && v.issuer === issuer
        );
        const label = known ? known[0] : `${code}:${issuer.slice(0, 8)}`;
        balances[label] = b.balance;
        trustlines.push(label);
      }
    }

    return { balances, trustlines, sequence: account.sequenceNumber() };
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    console.error('Stellar account load error:', error);
    throw error;
  }
}

/** Convenience alias used by balanceService */
export async function getStellarBalances(
  publicKey: string
): Promise<Record<string, string>> {
  const info = await getStellarAccountInfo(publicKey);
  return info?.balances ?? {};
}

// ── 3. Classic payment XDR ───────────────────────────────────────────────────

export async function buildStellarTransfer(
  fromPublicKey: string,
  toPublicKey: string,
  assetSymbol: string,
  amount: string
): Promise<string> {
  const sourceAccount = await horizonServer.loadAccount(fromPublicKey);
  const asset = getStellarAsset(assetSymbol);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.payment({ destination: toPublicKey, asset, amount }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

// ── 4. Path payment XDR (on-chain DEX swap) ──────────────────────────────────

export async function buildStellarPathPayment(
  fromPublicKey: string,
  toPublicKey: string,
  sendAsset: string,
  sendAmount: string,
  destAsset: string,
  minDestAmount: string,
  path: string[] = []
): Promise<string> {
  const sourceAccount = await horizonServer.loadAccount(fromPublicKey);
  const stellarPath = path.map(getStellarAsset);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset:   getStellarAsset(sendAsset),
        sendAmount,
        destination: toPublicKey,
        destAsset:   getStellarAsset(destAsset),
        destMin:     minDestAmount,
        path:        stellarPath,
      })
    )
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

// ── 5. Trustline management XDR ──────────────────────────────────────────────

export async function buildOpenTrustline(
  accountPublicKey: string,
  assetSymbol: string,
  limit?: string
): Promise<string> {
  const account = await horizonServer.loadAccount(accountPublicKey);
  const asset = getStellarAsset(assetSymbol);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
        ...(limit !== undefined && { limit }),
      })
    )
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function hasTrustline(
  publicKey: string,
  assetSymbol: string
): Promise<boolean> {
  if (assetSymbol === 'XLM') return true;
  const info = await getStellarAccountInfo(publicKey);
  return info?.trustlines.includes(assetSymbol) ?? false;
}

// ── 6. Soroban simulation ─────────────────────────────────────────────────────

export async function simulateSorobanTx(
  transaction: Transaction
): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
  return sorobanServer.simulateTransaction(transaction);
}

// ── 7. Fee-bumped XDR ────────────────────────────────────────────────────────

export function buildFeeBumpTx(
  innerXdr: string,
  feeSourcePublicKey: string,
  baseFeeStroops: number = 200
): string {
  const innerTx = new Transaction(innerXdr, STELLAR_NETWORK_PASSPHRASE);

  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    feeSourcePublicKey,
    String(baseFeeStroops),
    innerTx,
    STELLAR_NETWORK_PASSPHRASE
  );

  return feeBumpTx.toXDR();
}