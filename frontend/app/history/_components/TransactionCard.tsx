'use client';

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export const TYPE_COLORS: Record<string, string> = {
  FLOW: '#E91E8C',   // Flow executions
  SWAP: '#8B5CF6',
  BRIDGE: '#6A0DAD',
  STAKE: '#22C55E',
  SEND: '#0EA5E9',
  TRANSFER: '#0EA5E9',
};

export const STATUS_COLORS: Record<string, string> = {
  SUCCESS: '#22C55E',
  PENDING: '#F59E0B',
  FAILED: '#EF4444',
};

export interface Transaction {
  id: string;
  type: string;
  date: string;
  title: string;
  fromNetwork: string;
  toNetwork: string;
  status: string;
  hash: string;
}

interface TransactionCardProps {
  tx: Transaction;
  index: number;
}

export function TransactionCard({ tx, index }: TransactionCardProps) {
  const typeColor = TYPE_COLORS[tx.type] || '#E91E8C';
  const statusColor = STATUS_COLORS[tx.status] || '#22C55E';

  // Format hash for display (0x1234...5678)
  const shortHash = tx.hash.length > 10
    ? `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`
    : tx.hash;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-[#12121A]/80 backdrop-blur-sm border border-white/5 border-l-2 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#1A1A2E] transition-colors"
      style={{ borderLeftColor: typeColor }}
    >
      {/* Left: type badge, date, title, networks */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-[9px] px-2 py-0.5 border uppercase tracking-widest font-bold"
            style={{
              borderColor: `${typeColor}40`,
              color: typeColor,
              backgroundColor: `${typeColor}10`,
            }}
          >
            {tx.type}
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest">
            {tx.date}
          </span>
        </div>

        <h3 className="font-syne text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-4">
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

      {/* Right: status, hash link */}
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
        <div
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold"
          style={{ color: statusColor }}
        >
          <span
            className="w-2 h-2 rounded-none"
            style={{ backgroundColor: statusColor }}
          />
          {tx.status}
        </div>
        <a
          href={`https://etherscan.io/tx/${tx.hash}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-colors tracking-widest"
        >
          {shortHash} <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}