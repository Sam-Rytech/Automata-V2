'use client';
import { motion } from 'framer-motion';
import { ArrowsRightLeftIcon, ArrowUpRightIcon, ChartBarIcon, TrashIcon } from '@heroicons/react/24/solid';

export type ActionType = 'swap' | 'bridge' | 'stake' | 'transfer';

interface ActionNodeProps {
  id: string;
  type: ActionType;
  chain: string;
  asset: string;
  amount: string;
  onDelete?: () => void;
  index: number;
}

export function ActionNode({ type, chain, asset, amount, onDelete, index }: ActionNodeProps) {
  const icons = {
    swap: ArrowsRightLeftIcon,
    bridge: ArrowUpRightIcon,
    stake: ChartBarIcon,
    transfer: ArrowUpRightIcon,
  };
  const Icon = icons[type];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative group"
    >
      {/* Connector Line */}
      <div className="absolute -left-[31px] top-0 bottom-0 w-[2px] bg-white/5 group-last:bottom-1/2" />
      
      <div className="bg-[#1A1A2E]/60 border border-white/5 p-5 rounded-none hover:border-[#E91E8C]/40 transition-all flex items-center gap-6">
        <div className="w-10 h-10 bg-[#E91E8C]/10 border border-[#E91E8C]/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#E91E8C]" />
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Action</div>
            <div className="font-mono text-xs text-white uppercase font-bold">{type}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Network</div>
            <div className="font-mono text-xs text-white uppercase font-bold">{chain}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Asset</div>
            <div className="font-mono text-xs text-white uppercase font-bold">{amount} {asset}</div>
          </div>
          <div className="flex justify-end items-center">
            <button onClick={onDelete} className="p-2 text-white/20 hover:text-[#EF4444] transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
