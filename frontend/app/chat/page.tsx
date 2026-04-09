'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { StatusPanel } from '@/components/StatusPanel';
import { PlanReview } from '@/components/PlanReview';
import { StatusState, AgentPlan } from '@/types/status';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

type Message = {
  id: string;
  role: 'user' | 'agent';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<StatusState>('idle');
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [executionMode, setExecutionMode] = useState<'assisted' | 'autonomous'>('assisted');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic: Scrolls to the absolute bottom of the content whenever it changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, status, activePlan]);

  const handleSend = async (customInput?: string) => {
    const text = customInput || input;
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus('thinking');

    setTimeout(() => {
      if (executionMode === 'assisted') {
        setStatus('awaiting_approval');
        const mockPlan: AgentPlan = {
          steps: [
            { stepNumber: 1, description: 'Bridge 100 USDC from Base to Celo', estimatedFeeUSD: '$0.42', estimatedTimeSeconds: 30 },
            { stepNumber: 2, description: 'Swap USDC to cUSD on Celo', estimatedFeeUSD: '$0.05', estimatedTimeSeconds: 12 }
          ],
          totalEstimatedFeeUSD: '$0.47',
          estimatedTimeSeconds: 42,
          warnings: []
        };
        setActivePlan(mockPlan);
      } else {
        executePlan();
      }
    }, 2500);
  };

  const executePlan = () => {
    setActivePlan(null);
    setStatus('executing');
    
    setTimeout(() => {
      setStatus('success');
      const agentMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'agent', 
        content: 'Sequence completed. 100 USDC has been successfully bridged and swapped. Verification hash: 0x74a...82f' 
      };
      setMessages(prev => [...prev, agentMsg]);
      setTimeout(() => setStatus('idle'), 4000);
    }, 3500);
  };

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden relative">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-6 left-6 z-50 p-2 bg-[#1A1A2E] border border-white/10"
      >
        {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <ChatSidebar 
          executionMode={executionMode} 
          setExecutionMode={setExecutionMode} 
        />
      </div>

      {/* Main Container - FLEX COL is key here */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* CHAT AREA: flex-1 ensures it takes all space ABOVE the input bar */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10 pb-10">
            
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 md:mt-0">
                <h2 className="font-syne text-[2.5rem] sm:text-[3.5rem] font-black uppercase leading-none mb-12 tracking-tighter">
                  What do you want to do?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: '01', title: 'QUERY', desc: 'Check USDC balance across all active chains.' },
                    { id: '02', title: 'BRIDGE', desc: 'Bridge 50 USDC from Base to Celo via Wormhole.' }
                  ].map((s) => (
                    <button key={s.id} onClick={() => handleSend(s.desc)} className="text-left bg-[#1A1A2E]/40 border border-white/5 p-6 hover:border-[#E91E8C]/40 transition-all group rounded-none">
                      <div className="font-mono text-[9px] text-[#E91E8C] tracking-[0.3em] mb-3 uppercase font-bold">{s.title} —— {s.id}</div>
                      <p className="font-mono text-xs text-white/60 group-hover:text-white transition-colors">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-10">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="font-mono text-[9px] text-white/30 font-bold uppercase mb-2 tracking-[0.2em]">
                    {m.role === 'user' ? 'Operator' : 'Automata Oracle'}
                  </div>
                  <div className={`
                    p-5 sm:p-6 max-w-[95%] sm:max-w-[80%] font-mono text-xs sm:text-sm shadow-xl rounded-none
                    ${m.role === 'user' 
                      ? 'bg-[#E91E8C]/[0.06] border border-[#E91E8C]/40 text-white shadow-[0_0_20px_rgba(233,30,140,0.1)]' 
                      : 'bg-[#1A1A2E] border border-white/5 text-white/90'}
                  `}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Oracle Thinking Process */}
              {status === 'thinking' && (
                <div className="flex flex-col items-start gap-4">
                  <div className="font-mono text-[10px] text-[#E91E8C] font-black uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E91E8C] animate-pulse" /> Automata Oracle —— Thinking
                  </div>
                  <div className="font-mono text-xs text-white/40 space-y-1">
                    <p>{`> Analyzing liquidity pools...`}</p>
                    <p>{`> Fetching protocol quotes...`}</p>
                  </div>
                </div>
              )}

              {/* Interaction Components */}
              <div className="max-w-full sm:max-w-[90%]">
                {status !== 'idle' && (
                  <StatusPanel status={status} step={1} totalSteps={2} txHash="0x..." chainId="base" />
                )}
                {status === 'awaiting_approval' && activePlan && (
                  <PlanReview plan={activePlan} onApprove={executePlan} onCancel={() => setStatus('idle')} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INPUT BAR: Now part of the flex flow at the bottom, not absolute */}
        <div className="w-full p-4 sm:p-8 md:p-12 border-t border-white/5 bg-[#0F0F1A]">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1A1A2E]/95 border border-white/10 p-1 flex items-center shadow-2xl rounded-none">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Automata..."
                className="flex-1 bg-transparent border-none outline-none px-4 sm:px-6 font-mono text-xs sm:text-sm text-white placeholder:text-white/20"
              />
              <button 
                onClick={() => handleSend()} 
                className="bg-[#E91E8C] text-white px-6 sm:px-10 py-3 sm:py-4 font-syne font-bold uppercase text-[10px] sm:text-xs tracking-[0.3em] hover:bg-[#E91E8C]/80 transition-colors rounded-none"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
