'use client';
import { motion } from 'framer-motion';

export function Models() {
  return (
    <section id="models" className="py-12 border-y border-[var(--border-subtle)] bg-[#0F0F1A]/50 backdrop-blur-md relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">

        {/* Left Side: Context Text */}
        <div className="flex-1 md:pr-12 md:border-r border-[var(--border-subtle)]">
          <div className="font-mono text-white/50 text-[0.65rem] tracking-widest mb-3 uppercase">
            01 —— INTELLIGENCE ENGINE
          </div>
          <h2 className="font-syne text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-2">
            Bring your own key.
          </h2>
          <p className="font-mono text-white/40 text-xs max-w-sm leading-relaxed">
            Automata never stores your credentials. Enter your key once in Settings; it never leaves your device. Choose the model you trust for cross-chain execution.
          </p>
        </div>

        {/* Right Side: Muted Metallic Logos (Illuminating on Hover) */}
        <div className="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-10 sm:gap-16">

          {/* OpenAI / GPT- */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            {/* Using mask-image because the SVG is black; this allows us to "tint" it any color */}
            <div
              className="w-7 h-7 shrink-0 transition-all duration-500 bg-white/30 group-hover:bg-[#10A37F] filter brightness-75 contrast-125 group-hover:filter-none"
              style={{
                maskImage: 'url("/openai-2.svg")',
                WebkitMaskImage: 'url("/openai-2.svg")',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center'
              }}
            />
            <span className="hidden sm:block font-syne font-bold text-lg tracking-wider text-white/30 transition-all duration-500 group-hover:text-[#10A37F] group-hover:drop-shadow-[0_0_15px_rgba(16,163,127,0.4)]">
              GPT
            </span>
          </motion.div>

          {/* Anthropic / CLAUDE */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src="/claude-logo.svg"
              alt="Claude"
              className="w-8 h-8 shrink-0 transition-all duration-500 filter grayscale brightness-75 contrast-125 group-hover:filter-none"
            />
            <span className="hidden sm:block font-syne font-bold text-lg tracking-wider text-white/30 transition-all duration-500 group-hover:text-[#D97757] group-hover:drop-shadow-[0_0_15px_rgba(217,119,87,0.4)]">
              CLAUDE
            </span>
          </motion.div>

          {/* Google Gemini / GEMINI- */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src="/gemini-icon-logo.svg"
              alt="Gemini"
              className="w-7 h-7 shrink-0 transition-all duration-500 filter grayscale brightness-75 contrast-125 group-hover:filter-none"
            />
            <span className="hidden sm:block font-syne font-bold text-lg tracking-wider text-white/30 transition-all duration-500 group-hover:text-[#5684D1] group-hover:drop-shadow-[0_0_15px_rgba(86,132,209,0.4)]">
              GEMINI
            </span>
          </motion.div>

        </div>
      </div>
    </section>
  );
}