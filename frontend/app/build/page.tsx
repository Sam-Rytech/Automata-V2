'use client';
import { useState, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  TrashIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  PlusIcon,
  XMarkIcon
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

// --- DRAGGABLE PALETTE COMPONENT ---
function DraggablePaletteItem({ item, canvasRef, onDrop, closeDrawer }: { item: typeof PALETTE[0], canvasRef: React.RefObject<HTMLDivElement | null>, onDrop: (t: ActionType, c: string) => void, closeDrawer?: () => void }) {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleDragEnd = (event: any, info: any) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.getBoundingClientRect();

    if (info.point.x >= canvas.left && info.point.x <= canvas.right && info.point.y >= canvas.top && info.point.y <= canvas.bottom) {
      // Instantly trigger the missing state to hand off visual continuity to the canvas
      setIsRecovering(true);
      onDrop(item.type, item.color);
      if (closeDrawer) closeDrawer();
      setTimeout(() => setIsRecovering(false), 1200); // Slow 1.2s regeneration fade
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 border border-dashed border-white/10 flex flex-col items-center justify-center z-0 bg-[#0A0A12]">
        <div className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-2" />
        <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Regenerating</span>
      </div>

      <motion.div
        drag
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        animate={{ opacity: isRecovering ? 0 : 1, zIndex: isRecovering ? -1 : 10 }}
        // 0 duration going out (instant disappear on drop), 1s duration coming back (slow regenerate)
        transition={{ opacity: { duration: isRecovering ? 0 : 1, ease: "easeInOut" } }}
        whileDrag={{ scale: 1.05, zIndex: 99999, cursor: 'grabbing', opacity: 1, boxShadow: `0 0 30px ${item.color}40` }}
        className="bg-[#1A1A2E]/90 backdrop-blur-md border border-white/5 p-5 cursor-grab group relative rounded-none shadow-lg touch-none h-full flex flex-col justify-center"
        style={{ borderTop: `2px solid ${item.color}` }}
      >
        <div className="flex justify-between items-center mb-2 pointer-events-none">
          <span className="text-xs font-black uppercase text-white tracking-widest">{item.type}</span>
          <span className="text-[10px] opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: item.color }}>⋮⋮</span>
        </div>
        <span className="text-[10px] text-white/50 pointer-events-none">{item.desc}</span>
      </motion.div>
    </div>
  );
}

// --- MODULE 3: INTERACTIVE CONFIGURATION PANEL ---
function NodeConfigContent({ selectedNode, updateNode, closeConfig }: { selectedNode: Node, updateNode: (f: string, v: string) => void, closeConfig?: () => void }) {
  const [activeDropdown, setActiveDropdown] = useState<'chain' | 'asset' | null>(null);

  return (
    <div className="p-6 space-y-6 pb-12 relative">
      {/* Target Chain Dropdown */}
      <div className="space-y-2 relative">
        <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Target Chain</label>
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'chain' ? null : 'chain')}
          className="bg-[#0F0F1A] border border-white/10 p-4 flex justify-between items-center cursor-pointer hover:border-[#E91E8C]/50 transition-colors"
        >
          <span className="text-sm font-bold text-white">{selectedNode.chain}</span>
          <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${activeDropdown === 'chain' ? 'rotate-180' : ''}`} />
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
                  className="p-4 text-xs font-bold text-white hover:bg-[#E91E8C]/20 hover:text-[#E91E8C] cursor-pointer transition-colors border-b border-white/5 last:border-0 uppercase tracking-widest"
                >
                  {chain}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Asset Dropdown */}
      <div className="space-y-2 relative">
        <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Asset / Token</label>
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'asset' ? null : 'asset')}
          className="bg-[#0F0F1A] border border-white/10 p-4 flex justify-between items-center cursor-pointer hover:border-[#E91E8C]/50 transition-colors"
        >
          <span className="text-sm font-bold text-white">{selectedNode.asset}</span>
          <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${activeDropdown === 'asset' ? 'rotate-180' : ''}`} />
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
                  className="p-4 text-xs font-bold text-white hover:bg-[#E91E8C]/20 hover:text-[#E91E8C] cursor-pointer transition-colors border-b border-white/5 last:border-0 uppercase tracking-widest"
                >
                  {asset}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Execution Amount */}
      <div className="space-y-2">
        <label className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Execution Amount</label>
        <div className="bg-[#0F0F1A] border border-white/10 p-4 flex items-center focus-within:border-white/40 transition-colors">
          <input
            type="number"
            value={selectedNode.amount}
            onChange={(e) => updateNode('amount', e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold w-full text-white"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Mobile Save Button */}
      {closeConfig && (
        <button onClick={closeConfig} className="w-full bg-[#E91E8C] text-white py-4 font-syne font-bold uppercase text-[10px] tracking-[0.2em] mt-8 rounded-none hover:bg-[#E91E8C]/80 transition-colors">
          Save Parameters
        </button>
      )}
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
    setNodes(prev => [...prev, { id: newId, type, chain: 'SELECT...', asset: '...', amount: '0', color }]);
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
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden relative">
      <div className="hidden lg:block w-[260px] shrink-0 z-40 bg-[#0F0F1A] border-r border-white/5">
        <Sidebar activeMode="build" />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A12] relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0F0F1A] shrink-0 z-20">
          <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
            03 —— Build Mode
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

          {/* PANE 1: Desktop Drag Palette */}
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

          {/* PANE 2: The Dotted Canvas */}
          <div ref={canvasRef} className="flex-1 relative flex flex-col bg-[#0A0A12] z-10 overflow-hidden">
            {view === 'visual' ? (
              <div className="flex-1 bg-dot-grid p-6 sm:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center pb-[150px] lg:pb-12">
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center font-bold text-[10px] text-white/40">START</div>
                  <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-white/10 to-[#E91E8C]/40" />
                </div>

                <Reorder.Group axis="y" values={nodes} onReorder={setNodes} className="flex flex-col items-center w-full">
                  <AnimatePresence>
                    {nodes.map((node, i) => (
                      <Reorder.Item key={node.id} value={node} className="w-full flex flex-col items-center relative z-20">
                        {/* Layout animation handles the smooth sliding displacement */}
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
                          className={`relative bg-[#12121A] border p-5 sm:p-6 w-full max-w-[320px] transition-all cursor-pointer select-none
                            ${selectedNodeId === node.id ? 'border-[#E91E8C] shadow-[0_0_30px_rgba(233,30,140,0.15)]' : 'border-white/10 hover:border-white/20'}
                          `}
                        >
                          <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center opacity-0 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-30">
                            <span className="text-white/20 text-xs">⋮⋮</span>
                          </div>
                          <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2" style={{ borderColor: node.color }} />
                          <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2" style={{ borderColor: node.color }} />
                          <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: node.color }} />

                          <div className="flex justify-between items-start mb-4 pr-6 relative z-40">
                            <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase">0{i + 1} —— {node.type}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-white/10 hover:text-[#EF4444] transition-colors">
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-base sm:text-lg font-black uppercase tracking-widest text-white pr-6 relative z-40 flex items-center gap-2">
                            {node.chain} <span style={{ color: node.color }}>→</span> {node.asset}
                          </div>
                        </motion.div>
                        {i < nodes.length - 1 && <div className="w-[1px] h-8 sm:h-12 bg-white/5 my-2 pointer-events-none" />}
                      </Reorder.Item>
                    ))}
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

          {/* PANE 3: Desktop Config Panel */}
          <div className="hidden xl:flex w-[320px] bg-[#12121A] border-l border-white/5 flex-col z-20">
            <div className="p-4 border-b border-white/5 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold flex justify-between items-center">
              Node Parameters <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </div>
            {selectedNode ? (
              <NodeConfigContent selectedNode={selectedNode} updateNode={updateSelectedNode} />
            ) : (
              <div className="p-6 h-full flex items-center justify-center text-center text-[9px] text-white/20 uppercase tracking-widest leading-loose">
                Select a node on the<br />canvas to modify
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
                className="lg:hidden absolute bottom-0 left-0 w-full bg-[#12121A] border-t border-white/10 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0F0F1A] shrink-0">
                  <span className="text-[10px] text-white/40 tracking-[0.3em] uppercase font-bold flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="w-3 h-3" /> Configure {selectedNode.type}
                  </span>
                  <button onClick={() => setIsMobileConfigOpen(false)} className="p-2"><XMarkIcon className="w-5 h-5 text-white/40" /></button>
                </div>
                <div className="overflow-y-auto flex-1">
                  <NodeConfigContent selectedNode={selectedNode} updateNode={updateSelectedNode} closeConfig={() => setIsMobileConfigOpen(false)} />
                </div>
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
          <button className="px-6 sm:px-8 py-3 bg-[#E91E8C] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-all rounded-none">
            Execute
          </button>
        </footer>
      </main>
    </div>
  );
}