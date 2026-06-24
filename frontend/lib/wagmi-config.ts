import { createConfig } from '@privy-io/wagmi'
import { base, celo, mainnet } from 'viem/chains'
import { http } from 'wagmi'

const createTransport = (chain: any) => http()

export const wagmiConfig = createConfig({
  chains: [mainnet, base, celo],
  transports: {
    [mainnet.id]: createTransport(mainnet),
    [base.id]: createTransport(base),
    [celo.id]: createTransport(celo),
  },
})
