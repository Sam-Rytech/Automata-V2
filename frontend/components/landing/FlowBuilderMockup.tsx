'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const ALL_NODES = {
    bridge: { id: 'bridge', type: 'BRIDGE', label: 'Base → Celo', color: '#6A0DAD' },
    swap: { id: 'swap', type: 'SWAP', label: 'USDC → cUSD', color: '#E91E8C' },
    stake: { id: 'stake', type: 'STAKE', label: 'cUSD → Aave', color: '#22C55E' },
    transfer: { id: 'transfer', type: 'SEND', label: 'ETH → 0x8a...', color: '#F59E0B' }
};

const FLOWS = [
    [ALL_NODES.bridge, ALL_NODES.swap, ALL_NODES.stake],     // Standard
    [ALL_NODES.swap, ALL_NODES.bridge, ALL_NODES.stake],     // Swap translates to front
    [ALL_NODES.transfer, ALL_NODES.swap, ALL_NODES.bridge],  // New transfer node rotates in
];

export function FlowBuilderMockup() {
    const [flowIdx, setFlowIdx] = useState(0);
    const [activeNodeIdx, setActiveNodeIdx] = useState(0);

    useEffect(() => {
        // Cycle the execution highlight rapidly
        const nodeInterval = setInterval(() => {
            setActiveNodeIdx((prev) => (prev >= FLOWS[flowIdx].length ? 0 : prev + 1));
        }, 1200);

        // Physically swap the flow nodes every 5 seconds
        const flowInterval = setInterval(() => {
            setFlowIdx((prev) => (prev + 1) % FLOWS.length);
            setActiveNodeIdx(0); // Reset highlight on flow change
        }, 5000);

        return () => {
            clearInterval(nodeInterval);
            clearInterval(flowInterval);
        };
    }, [flowIdx]);

    const currentNodes = FLOWS[flowIdx];

    return (
        <div className="glassmorphism rounded-xl relative overflow-hidden flex flex-col h-[600px] border-[var(--accent-purple)]/20 border-t-[var(--accent-purple)]/40">
            <div className="h-12 border-b border-white/10 flex items-center px-4 font-mono text-xs text-white/50 tracking-wider bg-[#0F0F1A]/80 z-10">
                AUTOMATA — Flow Builder
            </div>

            <div className="flex-1 bg-dot-grid p-8 flex items-center justify-center relative overflow-hidden">

                {/* Nodes Container */}
                <div className="flex items-center gap-4 sm:gap-8 w-full max-w-lg relative z-10 justify-center">
                    <AnimatePresence mode="popLayout">
                        {currentNodes.map((node, idx) => (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{
                                    opacity: activeNodeIdx >= idx ? 1 : 0.5,
                                    scale: activeNodeIdx === idx ? 1.05 : 1,
                                    y: activeNodeIdx === idx ? -10 : 0,
                                }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="flex-1 bg-[#1A1A2E] border border-white/10 p-4 relative crosshair-corners min-w-[120px]"
                                style={{ borderTop: `2px solid ${node.color}` }}
                            >
                                {/* Active glow */}
                                {activeNodeIdx === idx && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute inset-0 blur-xl opacity-20 -z-10"
                                        style={{ backgroundColor: node.color }}
                                    />
                                )}
                                <div className="font-mono text-[10px] text-white/50 tracking-wider mb-2">{node.type}</div>
                                <div className="font-syne text-[0.8rem] text-white font-bold">{node.label}</div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Animated execution line under the nodes */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0 overflow-hidden opacity-30">
                    <div className="w-full h-full border-t border-dashed border-white/50" />
                    <motion.div
                        className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--accent-purple)] to-transparent"
                        animate={{ x: ["-100%", "300%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>

            <div className="h-20 border-t border-white/10 bg-[#0F0F1A]/80 px-6 flex items-center justify-between z-10">
                <div className="font-mono text-xs text-white/50">
                    <span className="text-white">Auto-Routing Active</span> · Dynamic Node Swap
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