import { createPublicClient, http } from 'viem';
import { base, celo, mainnet } from 'viem/chains';
import * as StellarSdk from '@stellar/stellar-sdk';

// ---------------------------------------------------------------------------
// rpc.ts — connection singletons for every supported chain.
//
// EVM chains  → viem PublicClient (HTTP JSON-RPC)
// Stellar     → Horizon server  (REST API for accounts, balances, tx submission)
//               Soroban RPC     (JSON-RPC 2.0 for smart contract simulation/submission)
//
// This project targets MAINNET. All default URLs point to mainnet endpoints.
//
// Required env vars (backend/.env):
//   BASE_RPC_URL          e.g. https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
//   CELO_RPC_URL          e.g. https://celo-mainnet.g.alchemy.com/v2/YOUR_KEY
//   ETH_RPC_URL           e.g. https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
//   STELLAR_HORIZON_URL   https://horizon.stellar.org        (default — mainnet)
//   STELLAR_SOROBAN_URL   https://soroban-rpc.stellar.org   (default — mainnet)
// ---------------------------------------------------------------------------

// ── EVM clients ──────────────────────────────────────────────────────────────

export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

export const celoClient = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_RPC_URL),
});

export const ethClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_RPC_URL),
});

/**
 * Returns the viem PublicClient for a given EVM chain name.
 * Return type is intentionally inferred — each chain client carries
 * chain-specific generics (Base has deposit tx types, Celo has extra fields)
 * that don't unify under a single PublicClient annotation.
 */
export function getEvmClient(chain: string) {
  switch (chain) {
    case 'base':     return baseClient;
    case 'celo':     return celoClient;
    case 'ethereum': return ethClient;
    default:
      throw new Error(
        `Unsupported EVM chain: "${chain}". Supported values: base, celo, ethereum`
      );
  }
}

// ── Stellar: Horizon ─────────────────────────────────────────────────────────

export const horizonServer = new StellarSdk.Horizon.Server(
  process.env.STELLAR_HORIZON_URL ?? 'https://horizon.stellar.org'
);

// ── Stellar: Soroban RPC ─────────────────────────────────────────────────────

export const sorobanServer = new StellarSdk.SorobanRpc.Server(
  process.env.STELLAR_SOROBAN_URL ?? 'https://soroban-rpc.stellar.org'
);

// ── Stellar: network passphrase ──────────────────────────────────────────────
//
// MAINNET — this is the live network. All transactions here use real funds.
// Import this constant everywhere. Never hard-code the passphrase string.

export const STELLAR_NETWORK_PASSPHRASE: string = StellarSdk.Networks.PUBLIC;