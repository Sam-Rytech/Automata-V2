use client
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { celo } from 'viem/chains'
import { usePrivy } from '@privy-io/react-auth'
import { detectMiniPay } from '@/lib/minipay'

interface MiniPayContextType {
  isMiniPay: boolean
}

const MiniPayContext = createContext<MiniPayContextType>({ isMiniPay: false })

export const useMiniPay = () => useContext(MiniPayContext)

export function MiniPayProvider({ children }: { children: React.ReactNode }) {
  const [isMiniPay, setIsMiniPay] = useState(false)
  const { ready, authenticated, login } = usePrivy()
  const { chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const triggered = useRef(false)

  // Detect on mount — always false on server, real value on client
  useEffect(() => {
    setIsMiniPay(detectMiniPay())
  }, [])

  // Auto-trigger Privy login once when MiniPay is detected
  useEffect(() => {
    if (!isMiniPay) return
    if (!ready) return
    if (authenticated) return
    if (triggered.current) return
    triggered.current = true
    login()
  }, [isMiniPay, ready, authenticated, login])

  // After Privy auth resolves, enforce Celo — MiniPay only supports Celo
  useEffect(() => {
    if (!isMiniPay) return
    if (!authenticated) return
    if (chainId === celo.id) return
    switchChain({ chainId: celo.id })
  }, [isMiniPay, authenticated, chainId, switchChain])

  return (
    <MiniPayContext.Provider value={{ isMiniPay }}>
      {children}
    </MiniPayContext.Provider>
  )
}