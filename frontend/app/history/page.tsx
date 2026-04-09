'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type ActionType = 'ALL' | 'BRIDGE' | 'SWAP' | 'STAKE' | 'SEND';
type TxStatus = 'CONFIRMED' | 'PENDING' | 'FAILED';

interface Transaction {
  id: string;
  type: ActionType;
  date: string;
  title: string;
  fromNetwork: string;
  toNetwork: string;
  status: TxStatus;
  hash: string;
}

// Color mapping matching your aesthetic
const TYPE_COLORS: Record<string, string> = {
  BRIDGE: '#E91E8C', // Pink
  SWAP: '#8B5CF6',   // Purple
  STAKE: '#22C55E',  // Green
  SEND: '#F59E0B',   // Orange
};

const STATUS_COLORS: Record<TxStatus, string> = {
  CONFIRMED: '#22C55E',
  PENDING: '#F59E0B',
  FAILED: '#EF4444',
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'BRIDGE',
    date: 'OCT 24, 2026 • 14:22 UTC',
    title: '100 USDC • Base → Stellar',
    fromNetwork: 'BASE',
    toNetwork: 'STELLAR',
    status: 'CONFIRMED',
    hash: '0x4a...d9e2'
  },
  {
    id: 'tx-2',
    type: 'SWAP',
    date: 'OCT 23, 2026 • 09:15 UTC',
    title: '0.5 ETH • WETH → XLM',
    fromNetwork: 'ETHEREUM',
    toNetwork: 'ETHEREUM',
    status: 'PENDING',
    hash: '0x9b...1f4c'
  },
  {
    id: 'tx-3',
    type: 'STAKE',
    date: 'OCT 22, 2026 • 22:45 UTC',
    title: '5,000 MATIC • Polygon Stake',
    fromNetwork: 'POLYGON',
    toNetwork: 'STAKING_POOL',
    status: 'CONFIRMED',
    hash: '0x2c...e8a1'
  },
  {
    id: 'tx-4',
    type: 'SEND',
    date: 'OCT 20, 2026 • 11:04 UTC',
    title: '2.0 SOL • Devnet → Mainnet',
    fromNetwork: 'SOLANA',
    toNetwork: 'EXTERNAL',
    status: 'FAILED',
    hash: '0xf5...c3b9'
  }
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<ActionType>('ALL');

  const filteredTxs = filter === 'ALL' 
    ? MOCK_TRANSACTIONS 
    : MOCK_TRANSACTIONS.filter(tx => tx.type === filter);

  return (
    <div className="flex h-screen bg-[#0A0A12] text-white overflow-hidden font-mono relative">
      
      {/* Sidebar */}
      <div className="hidden lg:block shrink-0 z-40">
        <Sidebar activeMode="history" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-dot-grid">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-12 pb-32">
          <div className="max-w-5xl mx-auto">
            
            {/* Header Section */}
            <div className="mb-12">
              <div className="text-[10px] text-[#E91E8C] tracking-[0.3em] uppercase mb-4 font-bold">
                04 —— Transaction History
              </div>
              <h2 className="font-syne text-[3rem] sm:text-[5rem] lg:text-[7rem] font-black uppercase leading-none tracking-tighter mb-8 text-white scale-y-110 origin-left">
                Activity Log
              </h2>

              {/* Filter Bar */}
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {(['ALL', 'BRIDGE', 'SWAP', 'STAKE', 'SEND'] as ActionType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none border
                      ${filter === f 
                        ? 'bg-[#E91E8C] border-[#E91E8C] text-white' 
                        : 'bg-transparent border-white/10 text-white/40 hover:text-white hover:border-white/30'}
                    `}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTxs.map((tx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={tx.id}
                    className="bg-[#12121A]/80 backdrop-blur-sm border border-white/5 border-l-2 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#1A1A2E] transition-colors"
                    style={{ borderLeftColor: TYPE_COLORS[tx.type] }}
                  >
                    
                    {/* Left Data */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span 
                          className="text-[9px] px-2 py-0.5 border uppercase tracking-widest font-bold"
                          style={{ borderColor: `${TYPE_COLORS[tx.type]}40`, color: TYPE_COLORS[tx.type], backgroundColor: `${TYPE_COLORS[tx.type]}10` }}
                        >
                          {tx.type}
                        </span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">
                          {tx.date}
                        </span>
                      </div>
                      
                      <h3 className="font-syne text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-4">
                        {tx.title}
                      </h3>
                      
                      <div className="flex items-center gap-3">
                        <div className="border border-white/10 bg-[#0A0A12] px-3 py-1.5 text-[9px] text-white/60 uppercase tracking-widest">
                          {tx.fromNetwork}
                        </div>
                        <span className="text-white/30">⟶</span>
                        <div className="border border-white/10 bg-[#0A0A12] px-3 py-1.5 text-[9px] text-white/60 uppercase tracking-widest">
                          {tx.toNetwork}
                        </div>
                      </div>
                    </div>

                    {/* Right Status */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: STATUS_COLORS[tx.status] }}>
                        <span className="w-2 h-2 rounded-none" style={{ backgroundColor: STATUS_COLORS[tx.status] }} />
                        {tx.status}
                      </div>
                      <a href="#" className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-colors tracking-widest">
                        {tx.hash} <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </a>
                    </div>

                  </motion.div>
                ))}
                
                {filteredTxs.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-12 text-center border border-dashed border-white/10 text-white/30 text-xs uppercase tracking-widest"
                  >
                    No transactions found for {filter}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Decorative Footer Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 pointer-events-none flex justify-between items-end">
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
  );
}
