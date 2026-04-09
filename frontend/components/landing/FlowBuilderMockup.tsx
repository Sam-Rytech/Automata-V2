'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function FlowBuilderMockup() {
    const [activeNode, setActiveNode] = useState(0);

    // Cycle through nodes to simulate execution flow
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNode((prev) => (prev >= 3 ? 0 : prev + 1));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const nodes = [
        { type: 'BRIDGE', label: 'USDC · Base → Celo', color: '#6A0DAD' },
        { type: 'SWAP', label: 'USDC → cUSD', color: '#E91E8C' },
        { type: 'STAKE', label: 'cUSD → Aave', color: '#22C55E' }
    ];

    return (
        <div className="glassmorphism rounded-xl relative overflow-hidden flex flex-col h-[600px] border-[var(--accent-purple)]/20 border-t-[var(--accent-purple)]/40">
            <div className="h-12 border-b border-white/10 flex items-center px-4 font-mono text-xs text-white/50 tracking-wider bg-[#0F0F1A]/80 z-10">
                AUTOMATA — Flow Builder
            </div>

            <div className="flex-1 bg-dot-grid p-8 flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-4 sm:gap-12 w-full max-w-lg relative z-10">
                    {nodes.map((node, idx) => (
                        <motion.div
                            key={idx}
                            layout // This allows fluid movement if order changes
                            animate={{
                                scale: activeNode === idx ? 1.05 : activeNode > idx ? 0.95 : 1,
                                opacity: activeNode >= idx ? 1 : 0.5,
                                y: activeNode === idx ? -10 : 0,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex-1 bg-[#1A1A2E] border border-white/10 p-4 relative crosshair-corners"
                            style={{ borderTop: `2px solid ${node.color}` }}
                        >
                            {/* Active glow */}
                            {activeNode === idx && (
                                <motion.div
                                    layoutId="activeGlow"
                                    className="absolute inset-0 blur-xl opacity-20 -z-10"
                                    style={{ backgroundColor: node.color }}
                                />
                            )}
                            <div className="font-mono text-[10px] text-white/50 tracking-wider mb-2">{node.type}</div>
                            <div className="font-syne text-sm text-white font-bold">{node.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Animated execution line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0 overflow-hidden opacity-30">
                    <div className="w-full h-full border-t border-dashed border-white/50" />
                    <motion.div
                        className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--accent-pink)] to-transparent"
                        animate={{ x: ["-100%", "300%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>

            <div className="h-20 border-t border-white/10 bg-[#0F0F1A]/80 px-6 flex items-center justify-between z-10">
                <div className="font-mono text-xs text-white/50">
                    <span className="text-white">Executing flow...</span> · Est. fee $1.20
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-white border-white/20 tech-button bg-transparent hover:bg-white/5">
                        <span className="tech-corners-extra" />Simulate
                    </Button>
                    <Button variant="outline" className="text-[var(--accent-pink)] border-[var(--accent-pink)]/50 tech-button bg-[var(--accent-pink)]/10 w-32 relative overflow-hidden">
                        <span className="tech-corners-extra" />
                        <motion.div
                            className="absolute inset-0 bg-[var(--accent-pink)]/20"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <span className="relative z-10">Running</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}