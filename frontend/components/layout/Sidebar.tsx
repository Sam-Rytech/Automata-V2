'use client'
import Link from 'next/link'
import {
  WalletIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  SquaresPlusIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useStellar } from '../../app/StellarProvider'
import { useBalances } from '../../hooks/useBalances'

interface SidebarProps {
  activeMode: 'chat' | 'build' | 'history' | 'settings'
  executionMode?: 'assisted' | 'autonomous'
  setExecutionMode?: (mode: 'assisted' | 'autonomous') => void
}

export function Sidebar({
  activeMode,
  executionMode = 'assisted',
  setExecutionMode,
}: SidebarProps) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { stellarAddress, connectStellar, disconnectStellar } = useStellar()

  // useWallets() returns all wallets Privy has provisioned for the user
  const walletAddress = wallets[0]?.address ?? null
  const { data: balances, isLoading: isBalancesLoading } = useBalances(walletAddress, stellarAddress)
  const truncatedPrivy = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '—'

  const truncatedStellar = stellarAddress
    ? `${stellarAddress.slice(0, 6)}...${stellarAddress.slice(-4)}`
    : null

  const navItems = [
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/chat', id: 'chat' },
    { name: 'Builder', icon: SquaresPlusIcon, href: '/build', id: 'build' },
    { name: 'History', icon: ClockIcon, href: '/history', id: 'history' },
    {
      name: 'Settings',
      icon: Cog6ToothIcon,
      href: '/settings',
      id: 'settings',
    },
  ]

  return (
    <aside className="w-[260px] h-full bg-[#0F0F1A] border-r border-white/5 flex flex-col p-6 overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="mb-8 mt-4 md:mt-0">
        <Link href="/">
          <h1 className="font-mono text-2xl font-black text-white tracking-tighter uppercase mb-6 flex items-center gap-2 hover:text-white/80 transition-colors">
            Automata
            <span className="bg-[#E91E8C] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-none">
              V1.0
            </span>
          </h1>
        </Link>

        {/* Connected Wallet 1 — EVM (Privy) */}
        <div className="bg-[#1A1A2E] p-3 flex items-center gap-3 border-l-2 border-[#E91E8C] mb-2">
          <div className="w-8 h-8 bg-[#E91E8C] flex items-center justify-center shrink-0">
            <WalletIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[9px] text-[#22C55E] tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${authenticated ? 'bg-[#22C55E] animate-pulse' : 'bg-white/30'}`} />
              {authenticated ? 'EVM Ready' : 'EVM Offline'}
            </div>
            <div className="font-mono text-[11px] text-white font-bold uppercase truncate">
              {truncatedPrivy}
            </div>
          </div>
        </div>

        {/* Connected Wallet 2 — Stellar (Multi-Wallet) */}
        <div className="bg-[#1A1A2E] p-3 flex items-center gap-3 border-l-2 border-[#6A0DAD]">
          <div className="w-8 h-8 bg-[#6A0DAD] flex items-center justify-center shrink-0">
            <WalletIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1 text-[#22C55E]">
              <span className={`w-1.5 h-1.5 rounded-full ${stellarAddress ? 'bg-[#22C55E] animate-pulse' : 'bg-white/30'}`} />
              {stellarAddress ? 'Stellar Ready' : 'Stellar Offline'}
            </div>
            {stellarAddress ? (
              <div 
                className="font-mono text-[11px] text-white font-bold uppercase truncate cursor-pointer hover:text-white/70"
                onClick={disconnectStellar}
                title="Click to disconnect"
              >
                {truncatedStellar}
              </div>
            ) : (
              <button
                onClick={connectStellar}
                className="font-mono text-[10px] font-bold text-white/60 hover:text-white uppercase transition-colors text-left"
              >
                Connect Stellar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- DYNAMIC CHAT SECTION --- */}
      {activeMode === 'chat' && (
        <div className="mb-8 space-y-8">
          <div>
            <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">
              02 —— Networks
            </div>
            <div className="flex flex-wrap gap-2">
              {['BASE', 'CELO', 'ETH', 'XLM'].map((n) => (
                <div
                  key={n}
                  className="px-2 py-1 border border-white/10 font-mono text-[9px] text-white/60"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">
              03 —— Balances
            </div>
            <div className="space-y-3">
              {[
                { t: 'USDC (Base)', v: balances?.baseUSDC || '0.00' },
                { t: 'ETH (Base)', v: balances?.baseETH || '0.00' },
                { t: 'USDC (Celo)', v: balances?.celoUSDC || '0.00' },
                { t: 'CELO (Celo)', v: balances?.celoNative || '0.00' },
                { t: 'XLM (Stellar)', v: balances?.stellarXLM || '0.00' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex justify-between font-mono text-[11px] uppercase items-center"
                >
                  <span className="text-white/40">{b.t}</span>
                  {isBalancesLoading ? (
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                  ) : (
                    <span className="text-white font-bold">{b.v}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {setExecutionMode && (
            <div>
              <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">
                04 —— Execution
              </div>
              <div className="flex border border-white/10 p-1">
                <button
                  onClick={() => setExecutionMode('assisted')}
                  className={`flex-1 py-2 font-mono text-[10px] font-bold uppercase transition-all
                    ${
                      executionMode === 'assisted'
                        ? 'bg-[#E91E8C]/10 border border-[#E91E8C]/40 text-[#E91E8C]'
                        : 'text-white/30'
                    }`}
                >
                  Assisted
                </button>
                <button
                  onClick={() => setExecutionMode('autonomous')}
                  className={`flex-1 py-2 font-mono text-[10px] font-bold uppercase transition-all
                    ${
                      executionMode === 'autonomous'
                        ? 'bg-[#E91E8C]/10 border border-[#E91E8C]/40 text-[#E91E8C]'
                        : 'text-white/30'
                    }`}
                >
                  Autonomous
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Navigation */}
      <nav className="space-y-2 mb-10 mt-auto">
        {navItems.map((item) => {
          const isActive = activeMode === item.id
          return (
            <Link key={item.name} href={item.href}>
              <button
                className={`w-full flex items-center gap-4 px-4 py-3 font-syne text-[13px] uppercase font-bold transition-all ${
                  isActive
                    ? 'bg-[#E91E8C]/10 text-[#E91E8C] border-l-2 border-[#E91E8C]'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-6">
        {activeMode === 'build' && (
          <button className="w-full bg-[#E91E8C] text-white py-4 font-syne font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-colors">
            Launch Agent
          </button>
        )}

        <div className="space-y-3 pt-6 border-t border-white/5">
          <button className="flex items-center gap-3 text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors w-full">
            <QuestionMarkCircleIcon className="w-4 h-4" /> Support
          </button>
          <button className="flex items-center gap-3 text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors w-full">
            <DocumentTextIcon className="w-4 h-4" /> Documentation
          </button>
        </div>
      </div>
    </aside>
  )
}
