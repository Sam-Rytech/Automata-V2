import { createConfig } from '@privy-io/wagmi';
import { base, celo, mainnet } from 'viem/chains';
import { http } from 'wagmi';

const createTransports = (chains: any[]) => {
  return chains.reduce((acc, chain) => ({ ...acc, [chain.id]: http() }), {});
};

export const wagmiConfig = createConfig({
  chains: [mainnet, base, celo],
  transports: createTransports([mainnet, base, celo]),
});