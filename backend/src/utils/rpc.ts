import { createPublicClient, http } from 'viem';
import { base, celo, mainnet } from 'viem/chains';

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
