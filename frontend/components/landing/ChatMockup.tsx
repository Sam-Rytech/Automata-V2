'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ChatMockup() {
    const [step, setStep] = useState(0);
    const fullText = "Bridge 100 USDC from Base to Stellar and swap to XLM";
    const [typedText, setTypedText] = useState("");

    // Animation sequence loop
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const runSequence = async () => {
            setStep(0);
            setTypedText("");

            // 1. Typing effect
            for (let i = 0; i <= fullText.length; i++) {
                await new Promise(r => setTimeout(r, 40));
                setTypedText(fullText.substring(0, i));
            }

            // 2. User sends message
            await new Promise(r => setTimeout(r, 500));
            setStep(1);

            // 3. Agent replies
            await new Promise(r => setTimeout(r, 1200));
            setStep(2);

            // 4. Confirmed
            await new Promise(r => setTimeout(r, 2000));
            setStep(3);

            // 5. Reset loop
            timeout = setTimeout(runSequence, 3000);
        };

        runSequence();
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="glassmorphism rounded-xl relative overflow-hidden flex flex-col h-[600px] border-[var(--accent-pink)]/20 border-t-[var(--accent-pink)]/40">
            <div className="h-12 border-b border-white/10 flex items-center px-4 font-mono text-xs text-white/50 tracking-wider bg-[#0F0F1A]/80 z-10">
                AUTOMATA — Chat
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative z-0">
                <AnimatePresence>
                    {/* User Message */}
                    {step >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="self-end bg-[var(--accent-pink)] text-white p-4 max-w-[80%] shadow-lg rounded-sm"
                        >
                            <span className="font-mono text-sm leading-relaxed">{fullText}</span>
                        </motion.div>
                    )}

                    {/* Agent Reply */}
                    {step >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                            className="self-start glassmorphism p-4 max-w-[90%] mt-4 rounded-sm border border-white/5"
                        >
                            <div className="font-mono text-sm text-white/80 leading-relaxed mb-4">
                                On it. Found the best route via Circle CCTP V2.<br />
                                <span className="text-[var(--accent-pink)]">Transfer fee: $0.42 · Est. time: 45 sec</span>
                            </div>
                            <div className="bg-[#0F0F1A] border-l-2 border-[var(--accent-pink)] p-4 mb-4">
                                <div className="font-mono text-xs text-white/50 mb-3 tracking-widest">TRANSACTION PLAN</div>
                                <ul className="font-mono text-sm text-white/70 space-y-2">
                                    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>Step 1: Burn USDC on Base</motion.li>
                                    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>Step 2: Attest via Circle</motion.li>
                                    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Step 3: Mint on Stellar</motion.li>
                                    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Step 4: Swap to XLM via Horizon</motion.li>
                                </ul>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" size="sm" className={`text-white border-white/20 tech-button bg-transparent transition-all ${step >= 3 ? 'bg-[var(--accent-pink)] border-[var(--accent-pink)]' : ''}`}>
                                    <span className="tech-corners-extra" />
                                    {step >= 3 ? 'Signed' : 'Confirm & Sign'}
                                </Button>
                                <Button variant="outline" size="sm" className="text-white/50 border-white/10 tech-button bg-transparent">
                                    <span className="tech-corners-extra" />
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Confirmation */}
                    {step >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="self-end bg-[var(--accent-pink)] text-white p-4 max-w-[80%] mt-4 rounded-sm shadow-lg"
                        >
                            <span className="font-mono text-sm">Confirmed. Executing...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="h-16 border-t border-white/10 bg-[#0F0F1A]/80 px-4 flex items-center z-10">
                <div className="flex-1 font-mono text-sm text-white/80 truncate pr-4">
                    {step === 0 ? typedText : ''}
                    {step === 0 && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>}
                </div>
                <Button variant="outline" size="icon" className="text-[var(--accent-pink)] border-[var(--accent-pink)]/50 tech-button bg-transparent">
                    <span className="tech-corners-extra" />↑
                </Button>
            </div>
        </div>
    );
}