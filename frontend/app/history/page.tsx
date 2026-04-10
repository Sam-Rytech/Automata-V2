'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { TransactionCard, Transaction } from './_components/TransactionCard'
import { Bars3Icon } from '@heroicons/react/24/solid'

const FILTER_OPTIONS = ['ALL', 'FLOW', 'BRIDGE', 'SWAP', 'STAKE', 'SEND']

function HistoryPageContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Added Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    try {
      const rawHistory = localStorage.getItem('automata_history');
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);

        const mappedTxs: Transaction[] = parsed.map((record: any) => ({
          id: record.id,
          type: record.type === 'FLOW_EXECUTION' ? 'FLOW' : record.type || 'FLOW',
          date: new Date(record.timestamp).toLocaleString(),
          title: record.description || 'Automata Execution',
          fromNetwork: 'VARIOUS',
          toNetwork: 'VARIOUS',
          status: record.status || 'SUCCESS',
          hash: record.txHash || '0x0000000000000000000000000000000000000000'
        }));

        setTransactions(mappedTxs);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load transaction history.');
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  }, [])

  const filtered =
    filter === 'ALL'
      ? transactions
      : transactions.filter((tx) => tx.type === filter)

  return (
    <div className="flex h-screen bg-[#0A0A12] text-white overflow-hidden relative">
      <div className="hidden lg:block shrink-0 z-40 bg-[#0F0F1A] border-r border-white/5">
        <Sidebar activeMode="history" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[260px] bg-[#0F0F1A] z-50 lg:hidden">
              <Sidebar activeMode="history" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 relative bg-dot-grid">

        {/* Mobile Header with Hamburger */}
        <header className="h-16 border-b border-white/5 flex items-center px-4 sm:px-6 bg-[#0F0F1A] shrink-0 z-20 lg:hidden gap-4">
          <button className="p-2 -ml-2 text-white/60 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="text-[10px] text-[#E91E8C] tracking-[0.3em] uppercase font-bold">
            04 —— History
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-12 pb-32 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <div className="hidden lg:block text-[10px] text-[#E91E8C] tracking-[0.3em] uppercase mb-4 font-bold font-mono">
                04 —— Transaction History
              </div>
              <h2 className="font-syne text-[2rem] sm:text-[3rem] lg:text-[4rem] font-black uppercase leading-none tracking-tighter mb-8 text-white scale-y-110 origin-left">
                Activity Log
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none border font-mono ${filter === f ? 'bg-[#E91E8C] border-[#E91E8C] text-white' : 'bg-transparent border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[120px] bg-[#12121A]/60 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}

              {!isLoading && error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center border border-dashed border-[#EF4444]/30 text-[#EF4444] text-xs uppercase tracking-widest font-mono">
                  {error}
                </motion.div>
              )}

              {!isLoading && !error && (
                <AnimatePresence mode="popLayout">
                  {filtered.map((tx, i) => (
                    <TransactionCard key={tx.id} tx={tx} index={i} />
                  ))}
                  {filtered.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center border border-dashed border-white/10 text-white/30 text-[10px] uppercase tracking-widest font-mono">
                      No transactions found for {filter}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 pointer-events-none flex justify-between items-end z-0">
          <div className="font-mono text-[8px] sm:text-[9px] text-white/20 uppercase tracking-[0.3em] space-y-1">
            <p>{`> FETCHING TRANSACTION_LAYER_04`}</p>
            <p>{`> BUFFERING BLOCKCHAIN_DATA...`}</p>
            <p>{`> STATUS: SYNCHRONIZED`}</p>
          </div>
          <div className="font-syne font-black text-4xl sm:text-7xl lg:text-[9rem] text-white/[0.02] uppercase tracking-tighter leading-none select-none">
            HISTORY.LOG
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryPageContent />
    </AuthGuard>
  )
}