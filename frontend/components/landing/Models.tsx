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

        {/* Right Side: Muted Metallic Logos */}
        <div className="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-10 sm:gap-16">

          {/* OpenAI / GPT- */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-[#10A37F] hover:drop-shadow-[0_0_15px_rgba(16,163,127,0.4)]"
          >
            {/* shrink-0 prevents flexbox from morphing the SVG */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 shrink-0">
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829a.0757.0757 0 0 1-.0379-.052V2.7483a4.504 4.504 0 0 1 5.8682 1.6464 4.485 4.485 0 0 1 .5346 3.0137l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685v-2.3324a.0804.0804 0 0 1 .0332-.0615l4.172-2.41a4.4992 4.4992 0 0 1 5.3572 7.1188zm-5.6106-2.5834l-2.02-1.1686a.071.071 0 0 1-.038-.052V2.3148a4.504 4.504 0 0 1 4.4945-4.4944 4.4755 4.4755 0 0 1 2.8764 1.0408l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369zM16.1419 6.2252a4.485 4.485 0 0 1-2.3655 1.9728V2.5182a.7664.7664 0 0 0-.3879-.6765L7.5741-1.5126l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7865A4.504 4.504 0 0 1 16.1419 6.2252zM9.919 14.8698l-3.2386-1.87v-3.7397l3.2386-1.87 3.2386 1.87v3.7397l-3.2386 1.87z" />
            </svg>
            <span className="font-syne font-bold text-lg tracking-wider">GPT-</span>
          </motion.div>

          {/* Anthropic / CLAUDE */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                       hover:text-[#D97757] hover:drop-shadow-[0_0_15px_rgba(217,119,87,0.4)]"
          >
            {/* Clean, perfectly square geometric 'A' replacing the stretched path */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 shrink-0">
              <path d="M12.2 2.2c-.2-.3-.5-.3-.7 0L2 21h3l7-12 7 12h3L12.2 2.2zM12 15l-3 5h6l-3-5z" />
            </svg>
            <span className="font-syne font-bold text-lg tracking-wider">CLAUDE</span>
          </motion.div>

          {/* Google Gemini / GEMINI- */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 group cursor-pointer transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0 transition-all duration-300">
              <defs>
                <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4285F4" />
                  <stop offset="50%" stopColor="#9B72F4" />
                  <stop offset="100%" stopColor="#EA4335" />
                </linearGradient>
              </defs>
              <path
                fill="currentColor"
                className="text-white/30 transition-all duration-300 group-hover:text-white"
                style={{ fill: 'var(--gemini-fill, currentColor)' }}
                d="M12 2.5C12 2.5 12 10 19.5 10C12 10 12 17.5 12 17.5C12 17.5 12 10 4.5 10C12 10 12 2.5 12 2.5Z"
              />
              <path
                className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                fill="url(#gemini-gradient)"
                d="M12 2.5C12 2.5 12 10 19.5 10C12 10 12 17.5 12 17.5C12 17.5 12 10 4.5 10C12 10 12 2.5 12 2.5Z"
              />
            </svg>
            <span className="font-syne font-bold text-lg tracking-wider text-white/30 group-hover:text-white transition-all duration-300 
                             group-hover:drop-shadow-[0_0_15px_rgba(155,114,244,0.4)]">
              GEMINI-
            </span>
          </motion.div>

        </div>
      </div>
    </section>
  );
}