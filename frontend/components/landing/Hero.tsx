'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import DarkVeil from '../ui/DarkVeil';

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[95vh] px-6 pt-32 pb-24 text-center w-full bg-[var(--bg-primary)] overflow-hidden">

      {/* Layer 1: Dot Grid Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none z-0" />

      {/* Layer 2: DarkVeil WebGL positioned at the bottom half */}
      <div className="absolute bottom-0 left-0 w-full h-[70vh] pointer-events-none z-0">
        {/* The maskImage fades the hard top edge of the canvas smoothly into the background */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          <DarkVeil
            hueShift={291}
            noiseIntensity={0}
            scanlineIntensity={0.25}
            speed={0.7}
            scanlineFrequency={0}
            warpAmount={0.8}
          />
        </div>
      </div>

      {/* Layer 3: Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Cross-Chain AI Agent Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-4 py-1.5 border border-[var(--border-subtle)] bg-[#0F0F1A]/50 backdrop-blur-sm text-[0.75rem] font-bold tracking-widest text-[var(--accent-pink)] uppercase rounded-none"
        >
          Cross-Chain AI Agent — V1.0
        </motion.div>

        {/* Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[3rem] sm:text-[5rem] md:text-[7rem] font-black leading-[0.9] tracking-tighter mb-8 uppercase text-white"
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
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
        >
          <Link href="/chat" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 py-4 bg-[var(--accent-pink)] text-white rounded-none font-bold text-[0.9rem] uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98] tech-button border border-transparent">
              <span className="tech-corners-extra" />
              Start Chatting
            </button>
          </Link>
          <Link href="/build" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 py-4 bg-[#0F0F1A]/50 backdrop-blur-md border border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-none font-bold text-[0.9rem] uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] tech-button">
              <span className="tech-corners-extra" />
              Build a Flow
            </button>
          </Link>
        </motion.div>
      </div>

    </section>
  );
} cd