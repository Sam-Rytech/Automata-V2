import { parseUnits, formatUnits, erc20Abi } from 'viem';
import { baseClient, celoClient, ethClient } from '../utils/rpc';

// ---------------------------------------------------------------------------
// EVM adapter — shared utilities for Base, Celo, and Ethereum.
//
// All three chains are EVM-compatible, so the same logic works everywhere.
// The only chain-specific detail is the USDC contract address, which differs
// per network. Those are listed in USDC_ADDRESSES below.
//
// USDC always uses 6 decimal places on EVM chains.
// Native tokens (ETH, CELO) use 18 decimal places.
// ---------------------------------------------------------------------------

// Official Circle-issued USDC addresses (mainnet).
// Testnet equivalents are different — see Circle's developer docs.
export const USDC_ADDRESSES: Record<string, `0x${string}`> = {
  base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
};

/**
 * Returns the viem public client for the given chain name.
 * Throws if the chain is not supported so callers get a clear error message
 * rather than a silent undefined.
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

/**
 * Reads the ERC-20 token balance for a given wallet address on a given chain.
 *
 * @param chain         - 'base' | 'celo' | 'ethereum'
 * @param tokenAddress  - The ERC-20 contract address (0x...)
 * @param walletAddress - The wallet to query (0x...)
 * @returns             - Balance as a human-readable decimal string (e.g. "42.50")
 *
 * Uses a raw `balanceOf` call — no subgraph, no API, direct on-chain read.
 * The result is formatted with 6 decimals because USDC (our primary token)
 * uses 6 decimals on all EVM chains. If you ever add a token with different
 * decimals, pass the decimals as a parameter instead.
 */
export async function getERC20Balance(
  chain: string,
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
): Promise<string> {
  const client = getEvmClient(chain);

  const rawBalance = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress],
  });

  // USDC has 6 decimals on every EVM chain.
  return formatUnits(rawBalance as bigint, 6);
}

/**
 * Reads the native token balance (ETH on Base/Ethereum, CELO on Celo) for a
 * wallet address.
 *
 * @param chain         - 'base' | 'celo' | 'ethereum'
 * @param walletAddress - The wallet to query (0x...)
 * @returns             - Balance as a human-readable decimal string (e.g. "0.0412")
 *
 * All three chains use 18 decimals for their native token.
 */
export async function getNativeBalance(
  chain: string,
  walletAddress: `0x${string}`
): Promise<string> {
  const client = getEvmClient(chain);

  const rawBalance = await client.getBalance({ address: walletAddress });

  return formatUnits(rawBalance, 18);
}