'use client';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const SCENARIOS = [
  {
    command: "Bridge 100 USDC from Base to Stellar and swap to XLM",
    reply: "Found the best route via Circle CCTP V2. Transfer fee: $0.42",
    plan: ["Burn USDC on Base", "Attest via Circle", "Mint on Stellar", "Swap to XLM via Horizon"]
  },
  {
    command: "Stake 5 ETH on Lido and wrap to wstETH",
    reply: "Current Lido APY is 3.8%. Preparing staking transaction.",
    plan: ["Route to Ethereum Mainnet", "Deposit ETH to Lido", "Receive stETH", "Wrap to wstETH"]
  },
  {
    command: "Send 500 cUSD to 0x4a... on Celo",
    reply: "Recipient verified on Celo network. Gas fee: <$0.01",
    plan: ["Verify recipient address", "Check cUSD balance", "Approve transfer", "Execute send"]
  }
];

export function ChatMockup() {
  const [messages, setMessages] = useState<any[]>([]);
  const [typedText, setTypedText] = useState("");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    
    const runScenario = async () => {
      const s = SCENARIOS[scenarioIdx];
      setTypedText("");
      
      // 1. Type command
      for (let i = 0; i <= s.command.length; i++) {
        if (isCancelled) return;
        setTypedText(s.command.substring(0, i));
        await new Promise(r => setTimeout(r, 30));
      }
      await new Promise(r => setTimeout(r, 400));
      if (isCancelled) return;

      // 2. Send User Message
      setTypedText("");
      const userMsgId = Date.now();
      setMessages(prev => [...prev, { id: userMsgId, type: 'user', text: s.command }]);
      
      // 3. Agent Reply
      await new Promise(r => setTimeout(r, 600));
      if (isCancelled) return;
      const agentMsgId = Date.now() + 1;
      setMessages(prev => [...prev, { id: agentMsgId, type: 'agent', text: s.reply, plan: s.plan, status: 'pending' }]);

      // 4. Confirm
      await new Promise(r => setTimeout(r, 1500));
      if (isCancelled) return;
      setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, status: 'confirmed' } : m));
      const confirmMsgId = Date.now() + 2;
      setMessages(prev => [...prev, { id: confirmMsgId, type: 'user', text: "Confirmed. Executing..." }]);

      // 5. Wait before next scenario
      await new Promise(r => setTimeout(r, 2000));
      if (isCancelled) return;
      setScenarioIdx(prev => (prev + 1) % SCENARIOS.length);
    };

    runScenario();
    return () => { isCancelled = true; };
  }, [scenarioIdx]);

  // Keep chat scrolled to bottom safely
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="glassmorphism rounded-xl relative overflow-hidden flex flex-col h-[600px] border-[var(--accent-pink)]/20 border-t-[var(--accent-pink)]/40">
      <div className="h-12 border-b border-white/10 flex items-center px-4 font-mono text-xs text-white/50 tracking-wider bg-[#0F0F1A]/80 z-10 absolute top-0 w-full">
        AUTOMATA — Chat
      </div>

      <div 
        ref={containerRef}
        className="flex-1 p-6 flex flex-col gap-6 overflow-hidden pt-16 pb-20 relative z-0 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* We use a flex container that justifies to the end, pushing old messages up and out of view */}
        <div className="flex flex-col justify-end min-h-full gap-6">
          <AnimatePresence initial={false}>
            {messages.slice(-6).map((msg) => (
              <motion.div 
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[90%] rounded-sm ${msg.type === 'user' ? 'self-end bg-[var(--accent-pink)] text-white p-4 shadow-lg' : 'self-start glassmorphism p-4 border border-white/5'}`}
              >
                {msg.type === 'user' ? (
                  <span className="font-mono text-sm leading-relaxed">{msg.text}</span>
                ) : (
                  <>
                    <div className="font-mono text-sm text-white/80 leading-relaxed mb-4">
                      {msg.text}
                    </div>
                    <div className="bg-[#0F0F1A] border-l-2 border-[var(--accent-pink)] p-4 mb-4">
                      <div className="font-mono text-xs text-white/50 mb-3 tracking-widest">TRANSACTION PLAN</div>
                      <ul className="font-mono text-sm text-white/70 space-y-2">
                        {msg.plan.map((step: string, i: number) => (
                          <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 }}>
                            Step {i + 1}: {step}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm" className={`text-white border-white/20 tech-button bg-transparent transition-all duration-300 ${msg.status === 'confirmed' ? 'bg-[var(--accent-pink)] border-[var(--accent-pink)]' : ''}`}>
                        <span className="tech-corners-extra" />
                        {msg.status === 'confirmed' ? 'Signed' : 'Confirm & Sign'}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-16 border-t border-white/10 bg-[#0F0F1A]/80 px-4 flex items-center z-10 absolute bottom-0 w-full">
        <div className="flex-1 font-mono text-sm text-white/80 truncate pr-4">
          {typedText}
          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>
        </div>
        <Button variant="outline" size="icon" className="text-[var(--accent-pink)] border-[var(--accent-pink)]/50 tech-button bg-transparent hover:bg-[var(--accent-pink)]/10">
          <span className="tech-corners-extra" />↑
        </Button>
      </div>
    </div>
  );
}