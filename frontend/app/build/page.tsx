'use client';
import { useState } from 'react';
import { BuildSidebar } from '@/components/build/BuildSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AdjustmentsHorizontalIcon, 
  ChevronDownIcon, 
  TrashIcon, 
  CodeBracketIcon, 
  Squares2X2Icon,
  QueueListIcon
} from '@heroicons/react/24/solid';

type ActionType = 'BRIDGE' | 'SWAP' | 'STAKE' | 'SEND';

interface Node {
  id: string;
  type: ActionType;
  chain: string;
  asset: string;
  amount: string;
  color: string;
}

export default function BuildPage() {
  // Desktop vs Mobile View Management
  const [view, setView] = useState<'visual' | 'terminal'>('visual');
  const [mobileView, setMobileView] = useState<'palette' | 'canvas' | 'config'>('canvas');
  
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'node-1', type: 'BRIDGE', chain: 'BASE', asset: 'USDC', amount: '100', color: '#F59E0B' },
    { id: 'node-2', type: 'SWAP', chain: 'CELO', asset: 'cUSD', amount: '100', color: '#6A0DAD' }
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-2');

  // The Exact Capabilities Aesthetic
  const palette = [
    { type: 'SEND' as ActionType, desc: 'Transfer to wallet', color: '#E91E8C' },    // Pink
    { type: 'SWAP' as ActionType, desc: 'Execute asset trade', color: '#6A0DAD' },   // Purple
    { type: 'BRIDGE' as ActionType, desc: 'Cross-chain transfer', color: '#F59E0B' }, // Orange
    { type: 'STAKE' as ActionType, desc: 'Deposit for yield', color: '#22C55E' }     // Green
  ];

  const addNode = (type: ActionType, color: string) => {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type,
      chain: 'SELECT...',
      asset: '...',
      amount: '0',
      color
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newId);
    // Auto-switch to canvas on mobile after adding
    if (window.innerWidth < 1024) setMobileView('canvas'); 
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden font-mono">
      {/* Sidebar hidden on mobile for canvas focus, visible on lg */}
      <div className="hidden lg:block w-[260px] shrink-0 z-40">
        <BuildSidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A12]">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0F0F1A] shrink-0">
          <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
            03 —— Build Mode
          </div>
          <div className="flex bg-[#1A1A2E] p-1 border border-white/5">
            <button 
              onClick={() => setView('visual')}
              className={`px-4 sm:px-6 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all ${view === 'visual' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Squares2X2Icon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Visual</span>
            </button>
            <button 
              onClick={() => setView('terminal')}
              className={`px-4 sm:px-6 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all ${view === 'terminal' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}
            >
              <CodeBracketIcon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Terminal</span>
            </button>
          </div>
        </header>

        {/* Mobile View Toggle Bar (Only visible < lg) */}
        <div className="lg:hidden flex bg-[#0F0F1A] border-b border-white/5 shrink-0">
          {[
            { id: 'palette', label: 'Nodes', icon: QueueListIcon },
            { id: 'canvas', label: 'Canvas', icon: Squares2X2Icon },
            { id: 'config', label: 'Config', icon: AdjustmentsHorizontalIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileView(tab.id as any)}
              className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 flex justify-center items-center gap-2 transition-all
                ${mobileView === tab.id ? 'border-[#E91E8C] text-[#E91E8C] bg-[#E91E8C]/5' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              <tab.icon className="w-3 h-3" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* PANE 1: Node Palette (Hidden on mobile unless selected) */}
          <div className={`
            w-full lg:w-[280px] bg-[#12121A] border-r border-white/5 flex-col
            ${mobileView === 'palette' ? 'flex' : 'hidden lg:flex'}
          `}>
            <div className="p-4 border-b border-white/5 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">
              Available Nodes
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {palette.map((n) => (
                <motion.div 
                  key={n.type}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: `0 0 20px ${n.color}25`,
                    borderColor: `${n.color}60`,
                    backgroundColor: `${n.color}05`
                  }}
                  onClick={() => addNode(n.type, n.color)}
                  className="bg-[#1A1A2E]/40 border border-white/5 p-5 cursor-grab active:cursor-grabbing group transition-all relative rounded-none"
                  style={{ borderTop: `2px solid ${n.color}` }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase text-white tracking-widest group-hover:text-white transition-colors" style={{ textShadow: `0 0 10px ${n.color}00` }}>{n.type}</span>
                    <span className="text-[10px] opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: n.color }}>⋮⋮</span>
                  </div>
                  <span className="text-[10px] text-white/50">{n.desc}</span>
                </motion.div>
              ))}
              <div className="mt-8 p-4 border border-dashed border-white/10 text-center">
                <p className="text-[9px] text-white/30 uppercase leading-relaxed tracking-widest">
                  Tap or Drag a node<br/>to extend your flow
                </p>
              </div>
            </div>
          </div>

          {/* PANE 2: The Canvas / Terminal (Hidden on mobile unless selected) */}
          <div className={`
            flex-1 relative overflow-hidden flex-col bg-[#0A0A12]
            ${mobileView === 'canvas' ? 'flex' : 'hidden lg:flex'}
          `}>
            <AnimatePresence mode="wait">
              {view === 'visual' ? (
                <motion.div 
                  key="visual"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 bg-dot-grid p-6 sm:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center gap-8 sm:gap-12"
                >
                  {/* Start Trigger */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center font-bold text-[10px] text-white/40">START</div>
                    <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-white/10 to-[#E91E8C]/40" />
                  </div>

                  {nodes.map((node, i) => (
                    <div key={node.id} className="flex flex-col items-center w-full">
                      <motion.div 
                        layoutId={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          if (window.innerWidth < 1024) setMobileView('config');
                        }}
                        className={`relative z-10 bg-[#12121A] border p-5 sm:p-6 w-full max-w-[320px] cursor-pointer transition-all
                          ${selectedNodeId === node.id ? 'border-[#E91E8C] shadow-[0_0_30px_rgba(233,30,140,0.15)]' : 'border-white/10 hover:border-white/20'}
                        `}
                      >
                        <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2" style={{ borderColor: node.color }} />
                        <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2" style={{ borderColor: node.color }} />
                        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: node.color }} />
                        
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase">0{i+1} —— {node.type}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-white/10 hover:text-[#EF4444] transition-colors">
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-base sm:text-lg font-black uppercase tracking-widest text-white">
                          {node.chain} <span style={{ color: node.color }}>→</span> {node.asset}
                        </div>
                      </motion.div>
                      {i < nodes.length - 1 && <div className="w-[1px] h-8 sm:h-12 bg-white/5" />}
                    </div>
                  ))}
                  
                  {nodes.length === 0 && (
                    <div className="text-white/20 uppercase text-xs tracking-widest mt-20">Canvas Empty</div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="terminal"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 bg-[#050508] p-4 sm:p-8 font-mono text-xs text-[#22C55E] overflow-y-auto"
                >
                  <pre className="leading-relaxed whitespace-pre-wrap">
                    {`// AUTOMATA INTENT MANIFEST V1.0\n`}
                    {`// EXPORTED FLOW: ${new Date().toISOString()}\n\n`}
                    {JSON.stringify({ flow: nodes }, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PANE 3: Config Panel (Hidden on mobile unless selected) */}
          <div className={`
            w-full lg:w-[320px] bg-[#12121A] border-l border-white/5 flex-col
            ${mobileView === 'config' ? 'flex' : 'hidden lg:flex'}
          `}>
            <div className="p-4 border-b border-white/5 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold flex justify-between items-center">
              Node Parameters <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              {selectedNode ? (
                <>
                  {/* Module 3 target: These will become interactive dropdowns */}
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Target Chain</label>
                    <div className="bg-[#0F0F1A] border border-white/10 p-3 flex justify-between items-center hover:border-[#E91E8C]/50 transition-colors cursor-pointer">
                      <span className="text-sm font-bold">{selectedNode.chain}</span>
                      <ChevronDownIcon className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Asset / Token</label>
                    <div className="bg-[#0F0F1A] border border-white/10 p-3 flex justify-between items-center cursor-pointer hover:border-[#E91E8C]/50 transition-colors">
                      <span className="text-sm font-bold">{selectedNode.asset}</span>
                      <ChevronDownIcon className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Execution Amount</label>
                    <div className="bg-[#0F0F1A] border border-white/10 p-3 flex items-center focus-within:border-white/40 transition-colors">
                      <input type="text" defaultValue={selectedNode.amount} className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-[9px] text-white/20 uppercase tracking-widest p-8 leading-loose">
                  Select a node on the<br/>canvas to modify its<br/>parameters
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Command Footer */}
        <footer className="h-16 sm:h-20 bg-[#0F0F1A] border-t border-white/5 flex items-center px-4 sm:px-6 justify-between shrink-0">
          <div className="flex items-center gap-4 sm:gap-8 font-mono">
            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-[#E91E8C] rounded-full" /> {nodes.length} Steps
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <button className="hidden sm:block px-6 sm:px-8 border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all rounded-none">
              Simulate
            </button>
            <button className="px-6 sm:px-8 py-3 bg-[#E91E8C] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-all rounded-none">
              Execute
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
