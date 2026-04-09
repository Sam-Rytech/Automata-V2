'use client';
import { useState, useRef } from 'react';
import { BuildSidebar } from '@/components/build/BuildSidebar';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  TrashIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
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

const PALETTE = [
  { type: 'SEND' as ActionType, desc: 'Transfer to wallet', color: '#E91E8C' },
  { type: 'SWAP' as ActionType, desc: 'Execute asset trade', color: '#6A0DAD' },
  { type: 'BRIDGE' as ActionType, desc: 'Cross-chain transfer', color: '#F59E0B' },
  { type: 'STAKE' as ActionType, desc: 'Deposit for yield', color: '#22C55E' }
];

const CHAINS = ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Celo'];
const ASSETS = ['USDC', 'ETH', 'WETH', 'DAI', 'USDT'];
const SLIPPAGE = ['0.1%', '0.5%', '1.0%', 'AUTO'];

// --- DRAGGABLE PALETTE COMPONENT ---
function DraggablePaletteItem({ item, canvasRef, onDrop, closeDrawer }: { item: typeof PALETTE[0], canvasRef: React.RefObject<HTMLDivElement>, onDrop: (t: ActionType, c: string) => void, closeDrawer?: () => void }) {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleDragEnd = (event: any, info: any) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.getBoundingClientRect();

    if (info.point.x >= canvas.left && info.point.x <= canvas.right && info.point.y >= canvas.top && info.point.y <= canvas.bottom) {
      setIsRecovering(true);
      onDrop(item.type, item.color);
      if (closeDrawer) closeDrawer();
      setTimeout(() => setIsRecovering(false), 1200);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 border border-dashed border-white/10 flex flex-col items-center justify-center z-0 bg-[#0A0A12]">
        <div className="w-4 h-4 border-2 border-white/10 border-t-[#E91E8C]/80 rounded-full animate-spin mb-2" />
        <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Regenerating</span>
      </div>

      <motion.div
        drag
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        animate={{ opacity: isRecovering ? 0 : 1, zIndex: isRecovering ? -1 : 10 }}
        transition={{ opacity: { duration: isRecovering ? 0 : 1, ease: "easeInOut" } }}
        whileDrag={{ scale: 1.05, zIndex: 99999, cursor: 'grabbing', opacity: 1, boxShadow: `0 0 30px ${item.color}40` }}
        className="bg-[#1A1A2E]/90 backdrop-blur-md border border-white/5 p-5 cursor-grab group relative rounded-none shadow-lg touch-none h-full flex flex-col justify-center"
        style={{ borderTop: `2px solid ${item.color}` }}
      >
        {/* Node Ports */}
        <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[#12121A] border border-white/20 -translate-y-1/2" />
        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-[#12121A] border border-white/20 -translate-y-1/2" />

        <div className="flex justify-between items-center mb-2 pointer-events-none">
          <span className="text-xs font-black uppercase text-white tracking-widest">{item.type}</span>
          <span className="text-[10px] opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: item.color }}>⋮⋮</span>
        </div>
        <span className="text-[10px] text-white/50 pointer-events-none">{item.desc}</span>
      </motion.div>
    </div>
  );
}

// --- ADVANCED CONFIGURATION PANEL ---
function NodeConfigContent({ selectedNode, updateNode, closeConfig }: { selectedNode: Node, updateNode: (f: string, v: string) => void, closeConfig?: () => void }) {
  const [activeDropdown, setActiveDropdown] = useState<'chain' | 'asset' | null>(null);
  const [slippage, setSlippage] = useState('0.5%');

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0F0F1A] shrink-0">
        <span className="text-[10px] text-[#E91E8C] tracking-[0.3em] uppercase font-bold flex items-center gap-2">
          Module Configuration
        </span>
        <button onClick={closeConfig} className="p-2 hover:bg-white/5 transition-colors"><XMarkIcon className="w-4 h-4 text-white/60" /></button>
      </div>

      <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
        {/* Module Identifier */}
        <div className="bg-[#1A1A2E]/50 border border-[#E91E8C]/20 p-4 flex items-center gap-4 relative">
          <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[#E91E8C]" />
          <div className="w-8 h-8 bg-[#E91E8C]/10 border border-[#E91E8C]/30 flex items-center justify-center shrink-0">
            <span className="text-[#E91E8C] text-xs">↔</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#E91E8C] tracking-widest uppercase mb-1">{selectedNode.type}_MODULE</div>
            <div className="text-[8px] text-white/40 tracking-[0.2em] uppercase">ID: MOD_{selectedNode.id.split('-')[1]}_XP</div>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="space-y-4">
          <div className="text-[9px] text-white/60 tracking-[0.3em] uppercase mb-4 border-b border-white/5 pb-2">Input Parameters</div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Target Chain</label>
              <span className="text-[8px] text-[#E91E8C] tracking-widest uppercase">[{selectedNode.chain}]</span>
            </div>
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'chain' ? null : 'chain')}
              className="bg-[#0F0F1A] border border-white/10 p-3 flex justify-between items-center cursor-pointer hover:border-[#E91E8C]/50 transition-colors"
            >
              <span className="text-sm font-bold text-white">{selectedNode.chain} Network</span>
              <ChevronDownIcon className={`w-3 h-3 text-white/40 transition-transform ${activeDropdown === 'chain' ? 'rotate-180' : ''}`} />
            </div>
            <AnimatePresence>
              {activeDropdown === 'chain' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 w-full bg-[#1A1A2E] border border-white/10 z-50 shadow-2xl"
                >
                  {CHAINS.map(chain => (
                    <div
                      key={chain}
                      onClick={() => { updateNode('chain', chain); setActiveDropdown(null); }}
                      className="p-3 text-[11px] font-bold text-white hover:bg-[#E91E8C]/20 hover:text-[#E91E8C] cursor-pointer transition-colors border-b border-white/5 last:border-0 uppercase tracking-widest"
                    >
                      {chain} Network
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Asset / Token</label>
              <span className="text-[8px] text-[#E91E8C] tracking-widest uppercase">[{selectedNode.asset}]</span>
            </div>
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'asset' ? null : 'asset')}
              className="bg-[#0F0F1A] border border-white/10 p-3 flex justify-between items-center cursor-pointer hover:border-[#E91E8C]/50 transition-colors"
            >
              <span className="text-sm font-bold text-white">{selectedNode.asset}</span>
              <ChevronDownIcon className={`w-3 h-3 text-white/40 transition-transform ${activeDropdown === 'asset' ? 'rotate-180' : ''}`} />
            </div>
            <AnimatePresence>
              {activeDropdown === 'asset' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 w-full bg-[#1A1A2E] border border-white/10 z-50 shadow-2xl"
                >
                  {ASSETS.map(asset => (
                    <div
                      key={asset}
                      onClick={() => { updateNode('asset', asset); setActiveDropdown(null); }}
                      className="p-3 text-[11px] font-bold text-white hover:bg-[#E91E8C]/20 hover:text-[#E91E8C] cursor-pointer transition-colors border-b border-white/5 last:border-0 uppercase tracking-widest"
                    >
                      {asset}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Execution Amount</label>
            <div className="bg-[#0F0F1A] border border-white/10 p-3 flex items-center focus-within:border-[#E91E8C]/50 transition-colors">
              <input type="text" value={selectedNode.amount} onChange={(e) => updateNode('amount', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-white" />
            </div>
          </div>
        </div>

        {/* Slippage Tolerance */}
        <div className="space-y-4">
          <div className="text-[9px] text-white/60 tracking-[0.3em] uppercase mb-4 border-b border-white/5 pb-2">Slippage Tolerance</div>
          <div className="flex gap-2">
            {SLIPPAGE.map(s => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-all ${slippage === s ? 'bg-[#E91E8C]/20 border border-[#E91E8C] text-[#E91E8C]' : 'bg-[#1A1A2E] border border-white/5 text-white/40 hover:text-white hover:border-white/20'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Logic Override Terminal */}
        <div className="space-y-4">
          <div className="text-[9px] text-[#E91E8C] tracking-[0.3em] uppercase mb-2">Logic_Override</div>
          <div className="bg-[#050508] border border-white/5 p-4 font-mono text-[10px] leading-loose">
            <span className="text-[#E91E8C]">if</span> <span className="text-white">(liquidity_depth &lt; 100k)</span> {'{\n'}
            <span className="text-white/60 pl-4">route = </span><span className="text-[#22C55E]">"BALANCER_V2"</span>{';\n'}
            {'}\n'}
            <span className="text-[#E91E8C]">else</span> {'{\n'}
            <span className="text-white/60 pl-4">route = </span><span className="text-[#22C55E]">"UNISWAP_V3"</span>{';\n'}
            {'}'}
          </div>
        </div>
      </div>

      <div className="p-6 bg-[#0F0F1A] border-t border-white/5 space-y-3 shrink-0">
        <button onClick={closeConfig} className="w-full bg-[#E91E8C] text-white py-4 font-syne font-bold uppercase text-[10px] tracking-[0.2em] rounded-none hover:bg-[#E91E8C]/80 transition-colors">
          Apply Changes
        </button>
        <button className="w-full bg-transparent border border-white/10 text-white/60 py-4 font-syne font-bold uppercase text-[10px] tracking-[0.2em] rounded-none hover:bg-white/5 hover:text-white transition-colors">
          Reset Module
        </button>
      </div>
    </div>
  );
}

// --- MAIN BUILDER PAGE ---
export default function BuildPage() {
  const [view, setView] = useState<'visual' | 'terminal'>('visual');
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'node-1', type: 'BRIDGE', chain: 'BASE', asset: 'USDC', amount: '100', color: '#F59E0B' }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-1');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = (type: ActionType, color: string) => {
    const newId = `node-${Date.now()}`;
    setNodes(prev => [...prev, { id: newId, type, chain: 'Ethereum', asset: 'ETH', amount: '0', color }]);
    setSelectedNodeId(newId);
    if (window.innerWidth < 1024) setIsMobileConfigOpen(true);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
      setIsMobileConfigOpen(false);
    }
  };

  const updateSelectedNode = (field: string, value: string) => {
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, [field]: value } : n));
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden font-mono relative">
      <div className="hidden lg:block w-[260px] shrink-0 z-40 bg-[#0F0F1A] border-r border-white/5">
        <BuildSidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A12] relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0F0F1A] shrink-0 z-20">
          <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
            <span className="text-[#E91E8C] font-bold">NETWORK</span> <span className="hidden sm:inline">AGENTS</span> <span className="hidden sm:inline">BRIDGE</span> <span className="hidden sm:inline">GOVERNANCE</span>
          </div>
          <div className="flex bg-[#1A1A2E] p-1 border border-white/5">
            <button onClick={() => setView('visual')} className={`px-4 sm:px-6 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all ${view === 'visual' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}>
              <Squares2X2Icon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Visual</span>
            </button>
            <button onClick={() => setView('terminal')} className={`px-4 sm:px-6 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all ${view === 'terminal' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}>
              <CodeBracketIcon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Terminal</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          <div className="hidden lg:flex w-[280px] bg-[#12121A] border-r border-white/5 flex-col z-30">
            <div className="p-4 border-b border-white/5 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">Nodes</div>
            <div className="p-4 flex-1 space-y-4 overflow-visible">
              {PALETTE.map((n) => (
                <div key={n.type} className="h-24">
                  <DraggablePaletteItem item={n} canvasRef={canvasRef} onDrop={addNode} />
                </div>
              ))}
            </div>
          </div>

          <div ref={canvasRef} className="flex-1 relative flex flex-col bg-[#0A0A12] z-10 overflow-hidden">
            {view === 'visual' ? (
              <div className="flex-1 bg-dot-grid p-6 sm:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center pb-[150px] lg:pb-12 relative">

                {/* --- CANVAS HUD --- */}
                <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
                  <div className="flex items-center gap-4 bg-[#12121A] border border-white/5 p-3">
                    <span className="text-[9px] text-[#E91E8C] tracking-[0.3em] font-bold">DRAFT_V04</span>
                    <div className="w-[1px] h-3 bg-white/10" />
                    <span className="flex items-center gap-2 text-[9px] text-white/60 tracking-widest">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full" /> LIVE SYNC
                    </span>
                  </div>
                  <div className="flex items-center bg-[#12121A] border border-white/5">
                    <button className="p-3 hover:bg-white/5 text-white/40 hover:text-white border-r border-white/5"><MagnifyingGlassPlusIcon className="w-4 h-4" /></button>
                    <button className="p-3 hover:bg-white/5 text-white/40 hover:text-white border-r border-white/5"><MagnifyingGlassMinusIcon className="w-4 h-4" /></button>
                    <button className="p-3 hover:bg-white/5 text-white/40 hover:text-white"><div className="w-4 h-4 border border-current rounded-sm" /></button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 mb-8 mt-16">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center font-bold text-[10px] text-white/40">START</div>
                  <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-white/10 to-[#E91E8C]/40" />
                </div>

                <Reorder.Group axis="y" values={nodes} onReorder={setNodes} className="flex flex-col items-center w-full">
                  <AnimatePresence>
                    {nodes.map((node, i) => {
                      const isSelected = selectedNodeId === node.id;

                      return (
                        <Reorder.Item key={node.id} value={node} className="w-full flex flex-col items-center relative z-20">

                          {/* --- CAPTURE MODE CONTAINER --- */}
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            onClick={() => {
                              setSelectedNodeId(node.id);
                              if (window.innerWidth < 1024) setIsMobileConfigOpen(true);
                            }}
                            className={`relative transition-all cursor-pointer select-none
                              ${isSelected ? 'p-3 bg-[#1A1A2E]/20' : 'p-0'}
                            `}
                          >
                            {/* Glowing Terminal Vertices (Capture Outline) */}
                            {isSelected && (
                              <>
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#E91E8C] shadow-[-2px_-2px_10px_rgba(233,30,140,0.3)]" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#E91E8C] shadow-[2px_-2px_10px_rgba(233,30,140,0.3)]" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#E91E8C] shadow-[-2px_2px_10px_rgba(233,30,140,0.3)]" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#E91E8C] shadow-[2px_2px_10px_rgba(233,30,140,0.3)]" />

                                {/* Estimated Gas Fee Attachment */}
                                <div className="absolute -bottom-6 right-0 flex items-center gap-2">
                                  <span className="text-[8px] text-white/40 tracking-[0.3em] uppercase">Est. Gas:</span>
                                  <span className="text-[10px] text-[#22C55E] font-bold tracking-widest">~$0.14</span>
                                </div>
                              </>
                            )}

                            {/* The Actual Node Card */}
                            <div className={`relative bg-[#12121A] border p-5 sm:p-6 w-full min-w-[280px] max-w-[320px] shadow-xl ${isSelected ? `border-[${node.color}]` : 'border-white/10 hover:border-white/20'}`}>

                              {/* Drag Handle */}
                              <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center opacity-0 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-30">
                                <span className="text-white/20 text-xs">⋮⋮</span>
                              </div>

                              {/* Circuit Ports */}
                              <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[#12121A] border border-white/20 -translate-y-1/2 z-20" />
                              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-[#12121A] border border-white/20 -translate-y-1/2 z-20" />

                              <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2" style={{ borderColor: node.color }} />
                              <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2" style={{ borderColor: node.color }} />
                              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: node.color }} />

                              <div className="flex justify-between items-start mb-4 pr-6 relative z-40">
                                <div>
                                  <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase block mb-1">0{i + 1}_TRIGGER</span>
                                  <span className="text-sm font-black uppercase tracking-widest block">{node.type}_ASSET</span>
                                  <span className="text-[9px] text-white/40 tracking-[0.1em] uppercase">Source: {node.chain} Network</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-white/10 hover:text-[#EF4444] transition-colors mt-1">
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="mt-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#6A0DAD] rounded-full" />
                              </div>
                            </div>

                          </motion.div>
                          {i < nodes.length - 1 && <div className="w-[1px] h-8 sm:h-12 bg-white/5 my-2 pointer-events-none" />}
                        </Reorder.Item>
                      );
                    })}
                  </AnimatePresence>
                </Reorder.Group>

                {nodes.length === 0 && <div className="text-white/20 uppercase text-xs tracking-widest mt-10">Canvas Empty</div>}
              </div>
            ) : (
              <div className="flex-1 bg-[#050508] p-4 sm:p-8 font-mono text-xs text-[#22C55E] overflow-y-auto">
                <pre>{JSON.stringify({ flow: nodes }, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="hidden xl:flex w-[380px] bg-[#12121A] border-l border-white/5 flex-col z-20">
            {selectedNode ? (
              <NodeConfigContent selectedNode={selectedNode} updateNode={updateSelectedNode} closeConfig={() => setSelectedNodeId(null)} />
            ) : (
              <div className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 border border-white/5 mb-4 flex items-center justify-center">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-white/20" />
                </div>
                <div className="text-[9px] text-white/20 uppercase tracking-widest leading-loose">
                  Select a node on the<br />canvas to configure<br />parameters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE EXCLUSIVE: Floating Action Button (FAB) */}
        <div className="lg:hidden absolute bottom-[100px] right-6 z-30">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-14 h-14 bg-[#E91E8C] rounded-none border border-[#E91E8C] flex items-center justify-center shadow-[0_0_30px_rgba(233,30,140,0.4)] hover:bg-[#E91E8C]/80 transition-colors"
          >
            <PlusIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* MOBILE EXCLUSIVE: Node Palette Drawer */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="lg:hidden absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden absolute bottom-0 left-0 w-full bg-[#12121A] border-t border-[#E91E8C]/40 z-50 overflow-visible shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-none"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0F0F1A]">
                  <span className="text-[10px] text-white/40 tracking-[0.3em] uppercase font-bold flex items-center gap-2">
                    <PlusIcon className="w-3 h-3" /> Drag Node UP to Canvas
                  </span>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2"><XMarkIcon className="w-5 h-5 text-white/40" /></button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4 pb-12 overflow-visible">
                  {PALETTE.map(n => (
                    <div key={n.type} className="h-20">
                      <DraggablePaletteItem item={n} canvasRef={canvasRef} onDrop={addNode} closeDrawer={() => setIsMobileDrawerOpen(false)} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MOBILE EXCLUSIVE: Configuration Drawer */}
        <AnimatePresence>
          {isMobileConfigOpen && selectedNode && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileConfigOpen(false)}
                className="lg:hidden absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden absolute bottom-0 left-0 w-full bg-[#12121A] border-t border-white/10 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
              >
                <NodeConfigContent selectedNode={selectedNode} updateNode={updateSelectedNode} closeConfig={() => setIsMobileConfigOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Command Footer */}
        <footer className="h-16 sm:h-20 bg-[#0F0F1A] border-t border-white/5 flex items-center px-4 sm:px-6 justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-2 sm:gap-4 font-mono">
            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-[#E91E8C] rounded-full" /> {nodes.length} Steps
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-6 sm:px-8 py-3 border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all rounded-none hidden sm:block">
              Simulate
            </button>
            <button className="px-6 sm:px-8 py-3 bg-[#E91E8C] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-all rounded-none">
              Execute Flow
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}