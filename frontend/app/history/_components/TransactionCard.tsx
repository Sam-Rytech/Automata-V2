import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Transaction, TYPE_COLORS, STATUS_COLORS } from '../data';

interface TransactionCardProps {
  tx: Transaction;
  index: number;
}

export function TransactionCard({ tx, index }: TransactionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-[#12121A]/80 backdrop-blur-sm border border-white/5 border-l-2 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#1A1A2E] transition-colors"
      style={{ borderLeftColor: TYPE_COLORS[tx.type] }}
    >
      {/* Left: type badge, date, title, networks */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-[9px] px-2 py-0.5 border uppercase tracking-widest font-bold"
            style={{
              borderColor: `${TYPE_COLORS[tx.type]}40`,
              color: TYPE_COLORS[tx.type],
              backgroundColor: `${TYPE_COLORS[tx.type]}10`,
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
          style={{ color: STATUS_COLORS[tx.status] }}
        >
          <span
            className="w-2 h-2 rounded-none"
            style={{ backgroundColor: STATUS_COLORS[tx.status] }}
          />
          {tx.status}
        </div>
        <a
          href="#"
          className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-colors tracking-widest"
        >
          {tx.hash} <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
