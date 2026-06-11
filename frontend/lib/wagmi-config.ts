import { createConfig } from '@privy-io/wagmi'
import { base, celo, mainnet } from 'viem/chains'
// TODO: optimize for large datasets
import { http } from 'wagmi'

export const wagmiConfig = createConfig({
  chains: [mainnet, base, celo],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [celo.id]: http(),
  },
})
