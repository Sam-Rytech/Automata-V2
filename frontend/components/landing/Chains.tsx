'use client';
import { motion } from 'framer-motion';

export function Chains() {
  return (
    <section id="chains" className="py-24 border-y border-[var(--border-subtle)] bg-[#0F0F1A]/80 backdrop-blur-md relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="font-mono text-white/50 text-[0.65rem] tracking-widest mb-3 uppercase">
            04 —— INFRASTRUCTURE
          </div>
          <h2 className="font-syne text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
            Supported Networks
          </h2>
        </div>

        {/* Logos Row */}
        <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">

          {/* BASE (Blue - #0052FF) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-[#0052FF] hover:drop-shadow-[0_0_15px_rgba(0,82,255,0.4)] group"
          >
            {/* Base Logo: Solid circle with hollow center */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 shrink-0">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z" />
            </svg>
            <span className="font-syne font-bold text-xl tracking-widest">BASE</span>
          </motion.div>

          {/* CELO (Yellow/Gold - #FCFF52) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-[#FCFF52] hover:drop-shadow-[0_0_15px_rgba(252,255,82,0.3)] group"
          >
            {/* Celo Logo: Interlocking rings */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-9 h-9 shrink-0">
              <circle cx="8" cy="12" r="6" />
              <circle cx="16" cy="12" r="6" />
            </svg>
            <span className="font-syne font-bold text-xl tracking-widest">CELO</span>
          </motion.div>

          {/* ETHEREUM (Blue/Grey - #627EEA) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-[#627EEA] hover:drop-shadow-[0_0_15px_rgba(98,126,234,0.4)] group"
          >
            {/* Ethereum Logo: Classic Octahedron */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 shrink-0">
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
            </svg>
            <span className="font-syne font-bold text-xl tracking-widest">ETHEREUM</span>
          </motion.div>

          {/* STELLAR (White/Bright - #FFFFFF) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] group"
          >
            {/* Stellar Logo: Minimalist planetary ring representation */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 shrink-0">
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8zm4.5-9.5H7.5v-1h9z" />
              <path d="M15.536 14.464a.5.5 0 0 0-.707 0L12 17.293l-2.828-2.829a.5.5 0 1 0-.707.707L12 18.707l3.536-3.536a.5.5 0 0 0 0-.707z" />
            </svg>
            <span className="font-syne font-bold text-xl tracking-widest">STELLAR</span>
          </motion.div>

          {/* SOLANA (Green - #14F195) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-[#14F195] hover:drop-shadow-[0_0_15px_rgba(20,241,149,0.4)] group"
          >
            {/* Solana Logo: The three stacked, angled bars */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 shrink-0">
              <path d="M3.7 4.5h16.6l-3.7 4H0l3.7-4zm16.6 6.5l-3.7 4H0l3.7-4h16.6zM0 15.5l3.7-4h16.6l-3.7 4H0z" />
            </svg>
            <span className="font-syne font-bold text-xl tracking-widest">SOLANA</span>
          </motion.div>

        </div>
      </div>
    </section>
  );
}