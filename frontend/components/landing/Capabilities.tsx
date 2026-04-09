'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, ArrowsRightLeftIcon, GlobeAltIcon, ChartBarIcon } from "@heroicons/react/24/solid";

export function Capabilities() {
  // SWAP Card Live Ticker State
  const [swapState, setSwapState] = useState(0);
  const swaps = [
    { from: "USDC", to: "XLM", fromVal: "1,000.00", toVal: "8,420.50", color: "#22C55E" },
    { from: "ETH", to: "cUSD", fromVal: "0.50", toVal: "1,450.20", color: "#E91E8C" },
    { from: "USDC", to: "SOL", fromVal: "500.00", toVal: "3.42", color: "#6A0DAD" }
  ];

  useEffect(() => {
    const swapInterval = setInterval(() => {
      setSwapState((prev) => (prev + 1) % swaps.length);
    }, 3000);
    return () => clearInterval(swapInterval);
  }, []);

  return (
    <section id="capabilities" className="py-32 px-4 max-w-7xl mx-auto border-t border-[var(--border-subtle)] relative z-10">
      <div className="mb-20 text-center md:text-left">
        <div className="font-mono text-white/50 text-[0.65rem] tracking-widest mb-6 uppercase">
          02 —— CAPABILITIES
        </div>
        <h2 className="font-syne text-[3.5rem] md:text-[5rem] font-bold text-white leading-none uppercase tracking-tighter">
          Everything your<br />money needs.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* CARD 1: SEND (Pink - #E91E8C) */}
        <div className="p-8 relative overflow-hidden group transition-all duration-500 rounded-none border border-[#E91E8C]/40 bg-[#E91E8C]/[0.04] hover:bg-[#E91E8C]/[0.08] hover:border-[#E91E8C]/80 hover:shadow-[0_0_30px_rgba(233,30,140,0.15)]">
          {/* Filled Heroicon Watermark */}
          <PaperAirplaneIcon
            className="absolute -bottom-8 -right-8 w-64 h-64 text-[#E91E8C] opacity-[0.05] -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.1] group-hover:-rotate-6 pointer-events-none z-0"
          />

          <div className="relative z-10">
            <h3 className="font-syne text-2xl font-bold text-[#E91E8C] mb-4 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(233,30,140,0.4)]">SEND</h3>
            <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
              Transfer USDC to any wallet on any network. Pay network costs directly in USDC.
            </p>

            <div className="bg-[#0F0F1A]/80 p-4 border border-[#E91E8C]/20 flex flex-col gap-3 backdrop-blur-md rounded-none">
              <div className="h-10 bg-[#0F0F1A] border border-white/10 px-3 flex items-center font-mono text-xs text-white/40 overflow-hidden relative rounded-none">
                <motion.span
                  animate={{ opacity: [0, 1, 1, 0], x: [-10, 0, 0, 10] }}
                  transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1] }}
                >
                  0x71C...976F
                </motion.span>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-[#0F0F1A] border border-white/10 px-3 flex items-center font-mono text-xs text-white flex-1 relative overflow-hidden rounded-none">
                  <span className="text-white/40 mr-2">$</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.15, 0.8, 1] }}
                  >
                    1,000.00
                  </motion.span>
                </div>
                <motion.button
                  animate={{
                    backgroundColor: ['rgba(233,30,140,0.1)', 'rgba(233,30,140,1)', 'rgba(15,15,26,1)', 'rgba(233,30,140,0.1)'],
                    color: ['#E91E8C', '#FFF', '#888', '#E91E8C']
                  }}
                  transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 1] }}
                  className="px-4 h-10 border border-[#E91E8C]/50 tech-button font-mono text-xs uppercase tracking-widest bg-transparent rounded-none"
                >
                  <span className="tech-corners-extra" />
                  Send
                </motion.button>
              </div>
              <motion.div
                animate={{ height: ['0%', '0%', '2px', '0%'], opacity: [0, 0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.6, 1] }}
                className="absolute bottom-0 left-0 w-full bg-[#E91E8C]"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: SWAP (Purple - #6A0DAD) */}
        <div className="p-8 relative overflow-hidden group transition-all duration-500 rounded-none border border-[#6A0DAD]/40 bg-[#6A0DAD]/[0.04] hover:bg-[#6A0DAD]/[0.08] hover:border-[#6A0DAD]/80 hover:shadow-[0_0_30px_rgba(106,13,173,0.15)]">
          {/* Filled Heroicon Watermark */}
          <ArrowsRightLeftIcon
            className="absolute -bottom-8 -right-8 w-64 h-64 text-[#6A0DAD] opacity-[0.05] -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.1] pointer-events-none z-0"
          />

          <div className="relative z-10">
            <h3 className="font-syne text-2xl font-bold text-[#6A0DAD] mb-4 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(106,13,173,0.4)]">SWAP</h3>
            <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
              Exchange tokens at the best rate, automatically. Liquidity sourced across all markets.
            </p>

            <div className="bg-[#0F0F1A]/80 p-4 border border-[#6A0DAD]/20 flex flex-col gap-1 relative h-[104px] backdrop-blur-md rounded-none">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`swap-${swapState}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 p-4 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center py-2 border-b border-white/5 font-mono text-sm">
                    <span className="text-white font-bold">{swaps[swapState].from}</span>
                    <span className="text-white/50">{swaps[swapState].fromVal}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 font-mono text-sm pt-4">
                    <span className="text-white font-bold">{swaps[swapState].to}</span>
                    <span style={{ color: swaps[swapState].color }}>{swaps[swapState].toVal}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#6A0DAD] text-xs bg-[#0F0F1A] w-6 h-6 rounded-none flex items-center justify-center border border-[#6A0DAD]/50 z-20 shadow-[0_0_10px_rgba(106,13,173,0.3)]"
              >
                ↓
              </motion.div>
            </div>
          </div>
        </div>

        {/* CARD 3: BRIDGE (Orange - #F59E0B) */}
        <div className="p-8 relative overflow-hidden group transition-all duration-500 rounded-none border border-[#F59E0B]/40 bg-[#F59E0B]/[0.04] hover:bg-[#F59E0B]/[0.08] hover:border-[#F59E0B]/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          {/* Filled Heroicon Watermark */}
          <GlobeAltIcon
            className="absolute -bottom-8 -right-8 w-64 h-64 text-[#F59E0B] opacity-[0.05] transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.1] pointer-events-none z-0"
          />

          <div className="relative z-10">
            <h3 className="font-syne text-2xl font-bold text-[#F59E0B] mb-4 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">BRIDGE</h3>
            <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
              Move assets across Base, Celo, Ethereum, Stellar. Powered by automated routing.
            </p>

            <div className="bg-[#0F0F1A]/80 p-4 border border-[#F59E0B]/20 flex items-center justify-between backdrop-blur-md rounded-none">
              <div className="bg-[#0F0F1A] border border-white/10 px-4 py-2 font-mono text-xs text-white z-10 rounded-none">BASE</div>

              <div className="flex-1 h-[1px] border-t border-dashed border-[#F59E0B]/40 mx-4 relative flex items-center">
                <motion.div
                  animate={{ left: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-2 h-2 rounded-none bg-[#F59E0B] shadow-[0_0_15px_#F59E0B]"
                  style={{ transform: 'translateX(-50%)' }}
                />
              </div>

              <div className="bg-[#0F0F1A] border border-white/10 px-4 py-2 font-mono text-xs text-white z-10 rounded-none">STELLAR</div>
            </div>
          </div>
        </div>

        {/* CARD 4: EARN (Green - #22C55E) */}
        <div className="p-8 relative overflow-hidden group transition-all duration-500 rounded-none border border-[#22C55E]/40 bg-[#22C55E]/[0.04] hover:bg-[#22C55E]/[0.08] hover:border-[#22C55E]/80 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          {/* Filled Heroicon Watermark */}
          <ChartBarIcon
            className="absolute -bottom-8 -right-8 w-64 h-64 text-[#22C55E] opacity-[0.05] transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.1] pointer-events-none z-0"
          />

          <div className="relative z-10">
            <h3 className="font-syne text-2xl font-bold text-[#22C55E] mb-4 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">EARN</h3>
            <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
              Deposit into yield protocols. Your money works for you while you sleep.
            </p>

            <div className="bg-[#0F0F1A]/80 p-4 border border-[#22C55E]/20 flex items-end justify-between h-24 backdrop-blur-md rounded-none">
              <div className="font-mono text-sm h-full flex flex-col justify-end">
                <div className="text-white/50 text-[10px] tracking-widest mb-1 uppercase">USDC on Aave</div>
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7], textShadow: ["0px 0px 0px transparent", "0px 0px 15px #22C55E", "0px 0px 0px transparent"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-[#22C55E] font-bold text-lg"
                >
                  APY 4.2%
                </motion.div>
              </div>
              <div className="flex items-end gap-1.5 h-full pt-4">
                {[0.3, 0.5, 0.7, 0.9].map((baseHeight, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${baseHeight * 100}%`, `${(baseHeight + 0.1) * 100}%`, `${baseHeight * 100}%`] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    className="w-4 bg-[#22C55E] rounded-none shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    style={{ opacity: baseHeight + 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}