import { createConfig } from '@privy-io/wagmi'
import { base, celo, mainnet } from 'viem/chains'
import { http } from 'wagmi'

const createTransports = (chains: any[]) => {
  const transports: any = {}
  chains.forEach((chain: any) => {
    transports[chain.id] = http()
  })
  return transports
}

export const wagmiConfig = createConfig({
  chains: [mainnet, base, celo],
  transports: createTransports([mainnet, base, celo]),
})