'use client';

import { motion } from 'framer-motion';
import DarkVeil from '../DarkVeil';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export function Hero() {
  const router = useRouter();
  const { login, authenticated, ready } = usePrivy();

  const handleAction = (destination: string) => {
    if (!ready) return;
    if (authenticated) {
      router.push(destination);
    } else {
      localStorage.setItem('postLoginRedirect', destination);
      login();
    }
  };
  return (
    <section className="relative min-h-[95vh] w-full bg-[var(--bg-primary)] overflow-hidden flex flex-col justify-center">

      {/* --- BACKGROUND LAYERS --- */}

      {/* 1. Dot Grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-80 pointer-events-none z-0" />

      {/* 2. DarkVeil Aurora */}
      <div className="absolute bottom-0 left-0 w-full h-[70vh] pointer-events-none z-0">
        {/* Fixed Mask: Transparent at the very top, fading to solid black (visible) for the rest of the height */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)'
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

      {/* --- FOREGROUND CONTENT --- */}

      <div className="relative z-10 px-6 pt-32 pb-24 text-center max-w-7xl mx-auto w-full flex flex-col items-center">

        {/* 2D CSS Glowing Orb (Restored!) */}
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
          className="mb-12 flex items-center justify-center gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-white/40 uppercase"
        >
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-[2px] h-4 bg-[var(--accent-pink)]"
          />
          <span>·</span>
          <span>Automata Protocol & Cross-Chain Agent Operating System</span>
        </motion.div>

        {/* Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[3rem] sm:text-[5rem] md:text-[7rem] font-black leading-[0.9] tracking-tighter mb-8 uppercase text-white drop-shadow-xl"
        >
          One Message.<br />
          Every Chain.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[1.1rem] sm:text-[1.25rem] text-white/70 max-w-[650px] mb-12 font-medium leading-relaxed"
        >
          Deploy intent-based agents that bridge, swap, and stake across EVM and non-EVM ecosystems with a single natural language prompt.
        </motion.p>

        {/* CTAs with Tech Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
        >
          <div className="w-full sm:w-auto block">
            <button onClick={() => handleAction('/chat')} className="w-full sm:w-auto px-10 py-4 bg-[var(--accent-pink)] text-white rounded-none font-bold text-[0.9rem] uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98] tech-button border border-transparent flex items-center justify-center">
              <span className="tech-corners-extra" />
              Start Chatting
            </button>
          </div>
          <div className="w-full sm:w-auto block">
            <button onClick={() => handleAction('/build')} className="w-full sm:w-auto px-10 py-4 bg-[#0F0F1A]/50 backdrop-blur-md border border-[var(--border-subtle)] text-white hover:border-[var(--text-muted)] rounded-none font-bold text-[0.9rem] uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98] tech-button flex items-center justify-center">
              <span className="tech-corners-extra" />
              Build a Flow
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}