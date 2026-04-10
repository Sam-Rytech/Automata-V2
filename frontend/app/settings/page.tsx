'use client'
import { AuthGuard } from '@/components/AuthGuard'
import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { motion } from 'framer-motion'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import { usePrivy, useWallets } from '@privy-io/react-auth'

const SECTIONS = [
  { id: 'ai-model', num: '01', title: 'AI Model' },
  { id: 'wallet', num: '02', title: 'Wallet' },
  { id: 'execution', num: '03', title: 'Execution' },
  { id: 'appearance', num: '04', title: 'Appearance' },
]

function SettingsPageContent() {
  const { logout } = usePrivy()
  const { wallets } = useWallets()

  const walletAddress = wallets[0]?.address ?? null
  const displayAddress = walletAddress ?? 'No wallet connected'

  const [activeSection, setActiveSection] = useState('ai-model')
  const [selectedModel, setSelectedModel] = useState('gemini')
  const [executionMode, setExecutionMode] = useState('assisted')
  const [apiKey, setApiKey] = useState('')
  const [hudEnabled, setHudEnabled] = useState(true)

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex h-screen bg-[#0A0A12] text-white overflow-hidden font-mono relative">
      <div className="hidden lg:block shrink-0 z-40 bg-[#0F0F1A] border-r border-white/5">
        <Sidebar activeMode="settings" />
      </div>
      <main className="flex-1 flex flex-col min-w-0 relative bg-dot-grid overflow-y-auto custom-scrollbar scroll-smooth">
        <div className="max-w-6xl mx-auto w-full p-6 sm:p-12 pb-32">
          <div className="mb-12 sm:mb-16">
            <div className="text-[10px] text-[#E91E8C] tracking-[0.3em] uppercase mb-4 font-bold">
              05 —— Control Panel
            </div>
            <h2 className="font-syne text-[3rem] sm:text-[5rem] lg:text-[6rem] font-black uppercase leading-none tracking-tighter mb-6 text-white scale-y-110 origin-left">
              Settings
            </h2>
            <div className="font-mono text-[10px] text-[#22C55E] tracking-[0.2em] uppercase flex items-center gap-4">
              <span>// NODE: AKURE-01</span>
              <span className="hidden sm:inline">■</span>
              <span className="hidden sm:inline">
                LAT: 7.2507° N, LON: 5.2069° E
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
            <div className="lg:w-48 shrink-0">
              <div className="sticky top-12 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`flex items-center gap-4 px-4 lg:px-6 py-4 text-left transition-all border-l-2 shrink-0
                      ${activeSection === section.id ? 'bg-[#1A1A2E] border-[#E91E8C] text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="text-[9px] font-bold tracking-widest">
                      {section.num}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {section.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-16 lg:space-y-24">
              {/* 01: AI MODEL */}
              <section id="ai-model" className="scroll-mt-12">
                <div className="relative bg-[#12121A]/80 backdrop-blur-md border border-white/5 p-6 sm:p-10">
                  <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[#E91E8C]" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-[#E91E8C]" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h3 className="font-syne text-2xl font-black uppercase tracking-widest mb-2">
                        AI Model Configuration
                      </h3>
                      <p className="text-[9px] text-white/40 uppercase tracking-[0.2em]">
                        Select the intelligence layer for your agents
                      </p>
                    </div>
                    <div className="px-3 py-1.5 border border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-bold tracking-widest uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />{' '}
                      Connected
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                      {
                        id: 'gemini',
                        name: 'Gemini 1.5',
                        provider: 'Google Deepmind',
                      },
                      { id: 'gpt4', name: 'GPT-4O', provider: 'OpenAI' },
                      {
                        id: 'claude',
                        name: 'Claude 3.5',
                        provider: 'Anthropic',
                      },
                    ].map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-5 border cursor-pointer transition-all relative group
                          ${selectedModel === model.id ? 'border-[#E91E8C] bg-[#E91E8C]/5' : 'border-white/10 hover:border-white/20 bg-[#0A0A12]'}`}
                      >
                        {selectedModel === model.id && (
                          <div className="text-[8px] text-[#E91E8C] font-bold uppercase tracking-widest mb-3">
                            Selected
                          </div>
                        )}
                        <div className="font-syne text-lg font-bold uppercase tracking-widest mb-1">
                          {model.name}
                        </div>
                        <div className="text-[9px] text-white/40 uppercase tracking-widest">
                          {model.provider}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[9px] text-white/40 tracking-[0.2em] uppercase mb-3">
                      Google Gemini API Key
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API key"
                        className="flex-1 bg-[#0A0A12] border border-white/10 px-5 py-4 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#E91E8C]/50 transition-colors"
                      />
                      <button className="bg-[#E91E8C] text-white px-10 py-4 font-syne font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-colors whitespace-nowrap">
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 02: ACTIVE WALLET — real address from Privy */}
              <section id="wallet" className="scroll-mt-12">
                <div className="relative bg-[#12121A]/80 backdrop-blur-md border border-white/5 p-6 sm:p-10">
                  <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-white/20" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-white/20" />
                  <h3 className="font-syne text-2xl font-black uppercase tracking-widest mb-8">
                    Active Wallet
                  </h3>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border border-white/5 bg-[#0A0A12] p-5">
                    <div>
                      <div className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-2">
                        Current Address
                      </div>
                      <div className="text-sm sm:text-base font-bold uppercase tracking-widest text-white/90 break-all">
                        {displayAddress}
                      </div>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="border border-white/10 px-6 py-3 text-[9px] font-bold tracking-widest uppercase hover:bg-white/5 hover:border-[#EF4444]/40 hover:text-[#EF4444] transition-colors shrink-0"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-4">
                      Supported Infrastructure
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'BASE_MAINNET',
                        'ETH_MAINNET',
                        'CELO_MAINNET',
                        'STELLAR_MAINNET',
                      ].map((net) => (
                        <div
                          key={net}
                          className="px-3 py-1.5 border border-white/10 bg-[#0A0A12] text-[9px] text-white/60 uppercase tracking-widest"
                        >
                          {net}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-12">
                {/* 03: EXECUTION MODE */}
                <section id="execution" className="scroll-mt-12">
                  <div className="relative bg-[#12121A]/80 backdrop-blur-md border border-white/5 p-6 sm:p-10 h-full">
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-white/20" />
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-white/20" />
                    <h3 className="font-syne text-xl font-black uppercase tracking-widest mb-8">
                      Execution Mode
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          id: 'assisted',
                          label: 'Assisted',
                          sub: 'Requires User Approval',
                        },
                        {
                          id: 'autonomous',
                          label: 'Autonomous',
                          sub: 'Full Agent Agency',
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setExecutionMode(opt.id)}
                          className={`p-6 border cursor-pointer transition-all flex justify-between items-center
                            ${executionMode === opt.id ? 'border-[#E91E8C] bg-[#E91E8C]/5' : 'border-white/10 hover:border-white/20 bg-[#0A0A12]'}`}
                        >
                          <div>
                            <div className="font-syne text-base font-bold uppercase tracking-widest mb-1">
                              {opt.label}
                            </div>
                            <div className="text-[9px] text-white/40 uppercase tracking-[0.2em]">
                              {opt.sub}
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${executionMode === opt.id ? 'border-[#E91E8C]' : 'border-white/20'}`}
                          >
                            {executionMode === opt.id && (
                              <div className="w-2 h-2 bg-[#E91E8C] rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 04: APPEARANCE */}
                <section id="appearance" className="scroll-mt-12">
                  <div className="relative bg-[#12121A]/80 backdrop-blur-md border border-white/5 p-6 sm:p-10 h-full flex flex-col">
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-white/20" />
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-white/20" />
                    <h3 className="font-syne text-xl font-black uppercase tracking-widest mb-8">
                      Appearance
                    </h3>
                    <div className="space-y-6 flex-1">
                      <div>
                        <div className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-4">
                          Theme Selection
                        </div>
                        <div className="border border-[#22C55E]/40 bg-[#0A0A12] p-5 flex justify-between items-center mb-3">
                          <div className="font-syne text-sm font-bold uppercase tracking-widest text-[#22C55E]">
                            Night Protocol
                          </div>
                          <div className="text-[9px] text-[#22C55E]/60 uppercase tracking-[0.2em] flex items-center gap-2">
                            <LockClosedIcon className="w-3 h-3" /> System Locked
                          </div>
                        </div>
                        <div className="border border-white/5 bg-[#0A0A12]/50 p-5 flex justify-between items-center opacity-50 cursor-not-allowed">
                          <div className="font-syne text-sm font-bold uppercase tracking-widest text-white/40">
                            Day Protocol
                          </div>
                          <div className="text-[9px] text-white/20 uppercase tracking-[0.2em]">
                            Unavailable in Alpha
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                      <div className="text-[9px] text-white/40 tracking-[0.2em] uppercase">
                        Interface HUD
                      </div>
                      <button
                        onClick={() => setHudEnabled(!hudEnabled)}
                        className="flex items-center"
                      >
                        <div
                          className={`text-[10px] font-bold tracking-widest uppercase mr-3 ${hudEnabled ? 'text-[#E91E8C]' : 'text-white/40'}`}
                        >
                          {hudEnabled ? 'ON' : 'OFF'}
                        </div>
                        <div className="w-10 h-1 bg-[#1A1A2E] relative">
                          <motion.div
                            animate={{ x: hudEnabled ? 24 : 0 }}
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 shadow-lg ${hudEnabled ? 'bg-[#E91E8C]' : 'bg-white/40'}`}
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsPageContent />
    </AuthGuard>
  )
}
