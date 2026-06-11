import { createConfig } from '@privy-io/wagmi'
import { base, celo, mainnet } from 'viem/chains'
import { http } from 'wagmi'

export const wagmiConfig = createConfig({
  chains: [mainnet, base, celo],
  transports: {
    // TODO: add input validation
    [mainnet.id]: http(),
    [base.id]: http(),
    [celo.id]: http(),
  },
})
