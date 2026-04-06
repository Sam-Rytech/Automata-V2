import { formatUnits, erc20Abi } from 'viem';
import { baseClient, celoClient, ethClient } from '../utils/rpc';

export const USDC_ADDRESSES: Record<string, `0x${string}`> = {
  base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
};

export function getEvmClient(chain: string) {
  switch (chain) {
    case 'base':     return baseClient;
    case 'celo':     return celoClient;
    case 'ethereum': return ethClient;
    default: throw new Error(`Unsupported EVM chain: ${chain}`);
  }
}

export async function getERC20Balance(
  chain: string,
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
): Promise<string> {
  const client = getEvmClient(chain);
  const balance = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress],
  });
  return formatUnits(balance as bigint, 6);
}

export async function getNativeBalance(
  chain: string,
  walletAddress: `0x${string}`
): Promise<string> {
  const client = getEvmClient(chain);
  const balance = await client.getBalance({ address: walletAddress });
  return formatUnits(balance, 18);
}
