'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Loader2 } from 'lucide-react';
import { StatusPanelProps } from '@/types/status';

const EXPLORER_BASE: Record<string, string> = {
  base: 'https://basescan.org/tx/',
  celo: 'https://celoscan.io/tx/',
  ethereum: 'https://etherscan.io/tx/',
  stellar: 'https://stellar.expert/explorer/public/tx/',
};

export function StatusPanel({ status, message, step, totalSteps, txHash, chainId }: StatusPanelProps) {
  if (status === 'idle') return null;

  const stateStyles: Record<string, { border: string; bg: string; text: string }> = {
    thinking: { border: '#E91E8C', bg: 'rgba(233, 30, 140, 0.05)', text: '#FFF' },
    executing: { border: '#6A0DAD', bg: 'rgba(106, 13, 173, 0.05)', text: '#FFF' },
    awaiting_approval: { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.05)', text: '#F59E0B' },
    success: { border: '#22C55E', bg: 'rgba(34, 197, 94, 0.05)', text: '#22C55E' },
    error: { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.05)', text: '#EF4444' },
  };

  const style = stateStyles[status] || stateStyles.thinking;
  const defaultMessages: Record<string, string> = {
    thinking: 'AUTOMATA ORACLE —— CALCULATING OPTIMAL ROUTE...',
    executing: step && totalSteps ? `PROTOCOL —— EXECUTING STEP ${step}/${totalSteps}...` : 'EXECUTING...',
    awaiting_approval: 'OPERATOR —— REVIEW REQUIRED',
    success: 'SEQUENCE COMPLETE —— ASSETS MOVED',
    error: 'SYSTEM HALTED —— EXECUTION ERROR',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-4 px-5 py-4 border rounded-none font-mono text-[10px] tracking-[0.2em] uppercase mt-4"
        style={{ borderColor: style.border, backgroundColor: style.bg }}
      >
        {status === 'thinking' && <Loader2 size={14} className="animate-spin text-[#E91E8C]" />}
        {status === 'executing' && <Loader2 size={14} className="animate-spin text-[#6A0DAD]" />}
        {status === 'awaiting_approval' && <ClockIcon className="w-4 h-4 text-[#F59E0B]" />}
        {status === 'success' && <CheckCircleIcon className="w-4 h-4 text-[#22C55E]" />}
        {status === 'error' && <XCircleIcon className="w-4 h-4 text-[#EF4444]" />}

        <span style={{ color: style.text }} className="flex-1 font-bold">
          {message || defaultMessages[status]}
        </span>

        {status === 'success' && txHash && (
          <a href={`${EXPLORER_BASE[chainId || 'base']}${txHash}`} target="_blank" rel="noopener noreferrer" className="text-[#E91E8C] hover:underline">
            VIEW TX →
          </a>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
