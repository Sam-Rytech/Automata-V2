'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[95vh] px-6 pt-32 pb-24 text-center max-w-7xl mx-auto w-full">

      {/* 2D CSS Glowing Orb (Mobile Safe, No WebGL) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full h-[200px] sm:h-[250px] mb-12 flex items-center justify-center pointer-events-none"
      >
        {/* Core Agent Orb */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 40px 10px rgba(233, 30, 140, 0.3)",
              "0 0 80px 20px rgba(106, 13, 173, 0.4)",
              "0 0 40px 10px rgba(233, 30, 140, 0.3)"
            ],
            y: [-10, 10, -10]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)] blur-[2px]"
        />
        {/* Outer subtle glow matching Stitch's wide background effect */}
        <div className="absolute inset-0 bg-[var(--accent-glow)] rounded-[100%] blur-[120px] opacity-40 transform scale-150 -z-10" />
      </motion.div>

      {/* Minimalist Proprietary Badge Aesthetic */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12 flex items-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-white/40 uppercase"
      >
        <motion.div 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-[2px] h-4 bg-white"
        />
        <span>·</span>
        <span>Automata Protocol & Cross-Chain Agent Operating System</span>
      </motion.div>

      {/* Typography matching the uploaded design brief */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[3rem] sm:text-[5rem] md:text-[7rem] font-black leading-[0.9] tracking-tighter mb-8 uppercase"
      >
        One Message.<br />
        Every Chain.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[1.1rem] sm:text-[1.25rem] text-[var(--text-muted)] max-w-[650px] mb-12 font-medium leading-relaxed"
      >
        Deploy intent-based agents that bridge, swap, and stake across EVM and non-EVM ecosystems with a single natural language prompt.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
      >
        <Link href="/chat" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-10 py-4 bg-[var(--accent-pink)] text-white rounded-md font-bold text-[0.9rem] uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98]">
            Start Chatting
          </button>
        </Link>
        <Link href="/build" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-10 py-4 bg-transparent border border-[var(--border-subtle)] text-white hover:border-[var(--text-muted)] rounded-md font-bold text-[0.9rem] uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98]">
            Build a Flow
          </button>
        </Link>
      </motion.div>

    </section>
  );
}