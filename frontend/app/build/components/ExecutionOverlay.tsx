'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function ExecutionOverlay({ isProcessing, terminalLogs }: { isProcessing: boolean, terminalLogs: string[] }) {
  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="absolute inset-x-4 sm:inset-x-12 bottom-12 top-24 bg-[#050508]/95 backdrop-blur-xl border border-[#22C55E]/30 z-50 p-8 font-mono text-[#22C55E] overflow-y-auto shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col"
        >
          <div className="text-[10px] tracking-[0.3em] uppercase border-b border-[#22C55E]/20 pb-4 mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#22C55E] animate-pulse" /> Automata Terminal Environment
          </div>
          <div className="space-y-4 flex-1">
            {terminalLogs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs sm:text-sm tracking-wider">
                {log}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
