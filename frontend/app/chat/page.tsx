'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusPanel } from '@/components/StatusPanel';
import { PlanReview } from '@/components/PlanReview';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useExecutionMode } from '@/hooks/useExecutionMode';
import { useAgentChat } from '@/hooks/useAgentChat';

function ChatPageContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { executionMode, setExecutionMode } = useExecutionMode();
  const { freighterAddress, privyStellarWallet, connectFreighter, signAndSubmitStellar } = useStellarWallet();
  const {
    messages,
    input,
    setInput,
    status,
    activePlan,
    pendingTxs,
    scrollRef,
    handleSend,
    executePlan,
    handleCancelPlan,
  } = useAgentChat(executionMode, signAndSubmitStellar);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, status, activePlan]);

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden relative">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden absolute top-6 left-6 z-50 p-2 bg-[#1A1A2E] border border-white/10">
        {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[260px] bg-[#0F0F1A] z-50 lg:hidden">
              <Sidebar activeMode="chat" executionMode={executionMode} setExecutionMode={setExecutionMode} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:block shrink-0 z-40">
        <Sidebar activeMode="chat" executionMode={executionMode} setExecutionMode={setExecutionMode} />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* ── Stellar wallet status bar ── */}
        <div className="border-b border-white/5 px-6 py-2 flex items-center justify-between bg-[#0F0F1A]">
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
            Stellar:{' '}
            {freighterAddress
              ? <span className="text-green-400">Freighter {freighterAddress.slice(0, 6)}...{freighterAddress.slice(-4)}</span>
              : privyStellarWallet
                ? <span className="text-blue-400">Embedded Wallet Active</span>
                : <span className="text-white/20">No Wallet</span>
            }
          </span>
          {!freighterAddress && (
            <button onClick={connectFreighter} className="font-mono text-[9px] uppercase tracking-widest text-[#E91E8C] hover:text-white transition-colors">
              Connect Freighter
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10 pb-10">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 md:mt-0">
                <h2 className="font-syne text-[2.5rem] sm:text-[3.5rem] font-black uppercase leading-none mb-12 tracking-tighter">What do you want to do?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: '01', title: 'QUERY', desc: 'Check USDC balance across all active chains.' },
                    { id: '02', title: 'BRIDGE', desc: 'Bridge 50 USDC from Base to Celo via Wormhole.' }
                  ].map((s) => (
                    <button key={s.id} onClick={() => handleSend(s.desc)} className="text-left bg-[#1A1A2E]/40 border border-white/5 p-6 hover:border-[#E91E8C]/40 transition-all group rounded-none">
                      <div className="font-mono text-[9px] text-[#E91E8C] tracking-[0.3em] mb-3 uppercase font-bold">{s.title} — {s.id}</div>
                      <p className="font-mono text-xs text-white/60 group-hover:text-white transition-colors">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-10">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="font-mono text-[9px] text-white/30 font-bold uppercase mb-2 tracking-[0.2em]">{m.role === 'user' ? 'Operator' : 'Automata Oracle'}</div>
                  <div className={`p-5 sm:p-6 max-w-[95%] sm:max-w-[80%] font-mono text-xs sm:text-sm shadow-xl rounded-none ${m.role === 'user' ? 'bg-[#E91E8C]/[0.06] border border-[#E91E8C]/40 text-white shadow-[0_0_20px_rgba(233,30,140,0.1)]' : 'bg-[#1A1A2E] border border-white/5 text-white/90'}`}>{m.content}</div>
                </div>
              ))}

              {status === 'thinking' && (
                <div className="flex flex-col items-start gap-4">
                  <div className="font-mono text-[10px] text-[#E91E8C] font-black uppercase flex items-center gap-2"><span className="w-2 h-2 bg-[#E91E8C] animate-pulse" /> Automata Oracle — Thinking</div>
                  <div className="font-mono text-xs text-white/40 space-y-1"><p>{`> Transmitting intent to LLM Core...`}</p><p>{`> Awaiting Agent compilation...`}</p></div>
                </div>
              )}

              <div className="max-w-full sm:max-w-[90%]">
                {status === 'executing' && <StatusPanel status={status} step={1} totalSteps={pendingTxs.length || 1} txHash="Pending Signature..." chainId={pendingTxs[0]?.chainId || 'VARIOUS'} />}
                {status === 'awaiting_approval' && activePlan && <PlanReview plan={activePlan} onApprove={() => executePlan()} onCancel={handleCancelPlan} />}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-4 sm:p-8 md:p-12 border-t border-white/5 bg-[#0F0F1A]">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1A1A2E]/95 border border-white/10 p-1 flex items-center shadow-2xl rounded-none focus-within:border-[#E91E8C]/50 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={status !== 'idle'}
                placeholder={status === 'idle' ? "Ask Automata..." : "Agent is busy..."}
                className="flex-1 bg-transparent border-none outline-none px-4 sm:px-6 font-mono text-xs sm:text-sm text-white placeholder:text-white/20 disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={status !== 'idle' || !input.trim()}
                className="bg-[#E91E8C] text-white px-6 sm:px-10 py-3 sm:py-4 font-syne font-bold uppercase text-[10px] sm:text-xs tracking-[0.3em] hover:bg-[#E91E8C]/80 transition-colors rounded-none disabled:opacity-50"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatPageContent />
    </AuthGuard>
  );
}
