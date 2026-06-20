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

// Further optimization can be done by using ARRAY METHODS to create the transports object in one line.
// Here is the optimized version:
import { createConfig } from '@privy-io/wagmi'
import { base, celo, mainnet } from 'viem/chains'
import { http } from 'wagmi'

const createTransport = (chain: any) => http()

export const wagmiConfig = createConfig({
  chains: [mainnet, base, celo],
  transports: [mainnet, base, celo].reduce((acc, chain) => ({ ...acc, [chain.id]: createTransport(chain) }), {}),
})