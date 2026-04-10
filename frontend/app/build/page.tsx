'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  addEdge, useNodesState, useEdgesState,
  Background, Controls, Connection,
  ReactFlowInstance, Node as ReactFlowNode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActionNode } from '@/components/FlowBuilder/ActionNode';
import { ActionType, ActionNodeData, StatusState } from '@/types/flow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon, ChevronDownIcon, MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon, Squares2X2Icon, CodeBracketIcon, PlusIcon, Bars3Icon,
  DocumentDuplicateIcon, CheckIcon
} from '@heroicons/react/24/solid';

const TYPE_COLOURS: Record<string, string> = {
  SEND: '#E91E8C', SWAP: '#8B5CF6', BRIDGE: '#6A0DAD', STAKE: '#22C55E', TRANSFER: '#0EA5E9'
};

const PALETTE_ITEMS = [
  { type: 'SEND' as ActionType, desc: 'Transfer to wallet' },
  { type: 'SWAP' as ActionType, desc: 'Execute asset trade' },
  { type: 'BRIDGE' as ActionType, desc: 'Cross-chain transfer' },
  { type: 'STAKE' as ActionType, desc: 'Deposit for yield' },
];

const CHAINS = ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Celo', 'Stellar'];
const ASSETS = ['USDC', 'ETH', 'WETH', 'DAI', 'USDT', 'CELO'];
const PROTOCOLS = ['Aave', 'Mento', 'Compound'];
const SLIPPAGE = ['0.1%', '0.5%', '1.0%', 'AUTO'];

const nodeTypes = { actionNode: ActionNode };

// --- Draggable Palette Component ---
function DraggablePaletteItem({ item, onDragStart }: { item: typeof PALETTE_ITEMS[0], onDragStart: (e: React.DragEvent, type: string) => void }) {
  const [isRecovering, setIsRecovering] = useState(false);
  return (
    <div className="relative h-28">
      <div className="absolute inset-0 border border-dashed border-white/10 flex flex-col items-center justify-center bg-[#0A0A12] z-0">
        <div className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-2" />
        <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Regenerating</span>
      </div>
      <div
        draggable
        onDragStart={(e) => {
          onDragStart(e, item.type);
          setTimeout(() => setIsRecovering(true), 0);
        }}
        onDragEnd={() => setTimeout(() => setIsRecovering(false), 800)}
        className={`absolute inset-0 bg-[#1A1A2E] border border-white/5 p-5 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-opacity duration-700 z-10 flex flex-col justify-center ${isRecovering ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ borderLeft: `2px solid ${TYPE_COLOURS[item.type]}` }}
      >
        <div className="flex justify-between items-center mb-2 pointer-events-none">
          <span className="text-[11px] font-black uppercase tracking-widest text-white">{item.type}_MODULE</span>
          <span className="text-[10px] opacity-20" style={{ color: TYPE_COLOURS[item.type] }}>⋮⋮</span>
        </div>
        <span className="text-[9px] text-white/40 pointer-events-none">{item.desc}</span>
      </div>
    </div>
  )
}

// --- Dynamic Configuration Component ---
function NodeConfigContent({
  node,
  updateNode,
  onClose
}: {
  node: ReactFlowNode<ActionNodeData>;
  updateNode: (id: string, field: string, value: string) => void;
  onClose?: () => void;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [slippage, setSlippage] = useState('0.5%');

  const up = (field: string, value: string) => {
    updateNode(node.id, field, value);
    setActiveDropdown(null);
  };

  const handleReset = () => {
    up('amount', '0');
    up('fromChain', 'Ethereum');
    up('fromToken', 'ETH');
    if (node.data.type === 'BRIDGE') up('toChain', 'Base');
    if (node.data.type === 'SWAP') up('toToken', 'USDC');
    if (node.data.type === 'STAKE') up('protocol', 'Aave');
    if (node.data.type === 'TRANSFER' || node.data.type === 'SEND') up('toAddress', '');
    setSlippage('0.5%');
  };

  const renderDropdown = (field: string, label: string, options: string[], currentVal: string) => (
    <div className="space-y-2 relative" key={field}>
      <div className="flex justify-between items-center">
        <label className="text-[8px] text-white/40 tracking-[0.2em] uppercase">{label}</label>
        <span className="text-[8px] text-[#E91E8C] tracking-widest uppercase">[{currentVal || 'SELECT'}]</span>
      </div>
      <div onClick={() => setActiveDropdown(activeDropdown === field ? null : field)} className="bg-[#0F0F1A] border border-white/10 p-3.5 flex justify-between items-center cursor-pointer hover:border-[#E91E8C]/50 transition-colors">
        <span className="text-xs font-bold text-white">{currentVal || `Select ${label}`}</span>
        <ChevronDownIcon className="w-3 h-3 text-white/40" />
      </div>
      <AnimatePresence>
        {activeDropdown === field && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full left-0 w-full bg-[#1A1A2E] border border-white/10 z-50 shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
            {options.map(opt => (
              <div key={opt} onClick={() => up(field, opt)} className="p-3.5 text-[10px] font-bold text-white hover:bg-[#E91E8C]/20 hover:text-[#E91E8C] cursor-pointer border-b border-white/5 uppercase tracking-widest">
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0F0F1A] shrink-0">
        <span className="text-[9px] text-[#E91E8C] tracking-[0.3em] uppercase font-bold">{node.data.type}_MODULE</span>
        {onClose && <button onClick={onClose} className="text-white/40 hover:text-white"><XMarkIcon className="w-4 h-4" /></button>}
      </div>
      <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
        {/* Module ID */}
        <div className="bg-[#1A1A2E]/50 border border-[#E91E8C]/20 p-4 flex items-center gap-4 relative">
          <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[#E91E8C]" />
          <div className="w-8 h-8 bg-[#E91E8C]/10 border border-[#E91E8C]/30 flex items-center justify-center shrink-0">
            <span className="text-[#E91E8C] text-[10px]">↔</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#E91E8C] uppercase mb-1">{node.data.type}_MODULE</div>
            <div className="text-[8px] text-white/40 tracking-[0.2em]">ID: MOD_{node.id.split('-')[1]}</div>
          </div>
        </div>

        {/* Dynamic Input Parameters */}
        <div className="space-y-4">
          <div className="text-[8px] text-white/60 tracking-[0.3em] uppercase border-b border-white/5 pb-2">Input Parameters</div>

          {renderDropdown('fromChain', 'Source Network', CHAINS, node.data.fromChain || '')}

          {node.data.type === 'BRIDGE' && renderDropdown('toChain', 'Target Network', CHAINS, node.data.toChain || '')}
          {node.data.type === 'STAKE' && renderDropdown('protocol', 'Protocol', PROTOCOLS, node.data.protocol || '')}

          {renderDropdown('fromToken', node.data.type === 'BRIDGE' ? 'Token' : 'Source Token', ASSETS, node.data.fromToken || '')}
          {node.data.type === 'SWAP' && renderDropdown('toToken', 'Target Token', ASSETS, node.data.toToken || '')}

          <div className="space-y-2">
            <label className="text-[8px] text-white/40 tracking-[0.2em] uppercase">Execution Amount</label>
            <div className="bg-[#0F0F1A] border border-white/10 p-3.5 flex items-center focus-within:border-[#E91E8C]/50 transition-colors">
              <input type="text" value={node.data.amount || ''} onChange={(e) => up('amount', e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold w-full text-white" placeholder="0.00" />
            </div>
          </div>

          {(node.data.type === 'TRANSFER' || node.data.type === 'SEND') && (
            <div className="space-y-2">
              <label className="text-[8px] text-white/40 tracking-[0.2em] uppercase">Destination Address</label>
              <div className="bg-[#0F0F1A] border border-white/10 p-3.5 flex items-center focus-within:border-[#E91E8C]/50 transition-colors">
                <input type="text" value={node.data.toAddress || ''} onChange={(e) => up('toAddress', e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold w-full text-white" placeholder="0x..." />
              </div>
            </div>
          )}
        </div>

        {/* Slippage */}
        <div className="space-y-4">
          <div className="text-[8px] text-white/60 tracking-[0.3em] uppercase border-b border-white/5 pb-2">Slippage Tolerance</div>
          <div className="flex gap-2">
            {SLIPPAGE.map(s => (
              <button key={s} onClick={() => setSlippage(s)} className={`flex-1 py-2 text-[9px] font-bold tracking-widest transition-all ${slippage === s ? 'bg-[#E91E8C]/20 border border-[#E91E8C] text-[#E91E8C]' : 'bg-[#1A1A2E] border border-white/5 text-white/40 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Logic Override */}
        <div className="space-y-4">
          <div className="text-[8px] text-white/60 tracking-[0.3em] uppercase border-b border-white/5 pb-2">Logic Override</div>
          <div className="bg-[#0A0A12] border border-white/10 p-5 font-mono text-[11px] leading-relaxed text-white/70 shadow-inner">
            <span className="text-[#E91E8C]">if</span> (liquidity_depth &lt; 100k) {'{\n'}
            <div className="pl-4">route = <span className="text-[#22C55E]">"BALANCER_V2"</span>;</div>
            {'}\n'}
            <span className="text-[#E91E8C]">else</span> {'{\n'}
            <div className="pl-4">route = <span className="text-[#22C55E]">"UNISWAP_V3"</span>;</div>
            {'}'}
          </div>
        </div>
      </div>

      {/* Apply / Reset Actions */}
      <div className="p-6 bg-[#0F0F1A] border-t border-white/5 shrink-0 space-y-4">
        <button onClick={onClose} className="w-full bg-[#E91E8C] text-white py-4 font-syne font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-colors">Apply Changes</button>
        <button onClick={handleReset} className="w-full border border-white/10 text-white/60 py-4 font-syne font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/5 hover:text-white transition-colors">Reset Module</button>
      </div>
    </div>
  )
}

function FlowBuilderContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ActionNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [view, setView] = useState<'visual' | 'terminal'>('visual');
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Execution & Terminal State
  const [statusState, setStatusState] = useState<StatusState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const selectedNode = nodes.find(n => n.selected);

  // --- DRAG AND DROP LOGIC ---
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as ActionType;
    if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const id = crypto.randomUUID();
    const newNode: ReactFlowNode<ActionNodeData> = {
      id, type: 'actionNode', position,
      data: { type, color: TYPE_COLOURS[type], stepIndex: nodes.length + 1, fromChain: 'Ethereum', fromToken: 'USDC', amount: '0', onDelete: () => deleteNode(id) },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, nodes]);

  const handleMobileDragEnd = (event: any, info: any, type: ActionType) => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    if (info.point.x >= bounds.left && info.point.x <= bounds.right && info.point.y >= bounds.top && info.point.y <= bounds.bottom) {
      const position = reactFlowInstance.screenToFlowPosition({ x: info.point.x, y: info.point.y });
      const id = crypto.randomUUID();
      setNodes((nds) => nds.concat({ id, type: 'actionNode', position, data: { type, color: TYPE_COLOURS[type], stepIndex: nds.length + 1, fromChain: 'Ethereum', fromToken: 'USDC', amount: '0', onDelete: () => deleteNode(id) } }));
      setIsMobileDrawerOpen(false);
    }
  }

  function deleteNode(id: string) {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
  }

  const updateNodeData = (id: string, field: string, value: string) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  };

  const onConnect = useCallback((connection: Connection) => setEdges(prev => addEdge({ ...connection, animated: true }, prev)), [setEdges]);

  // --- TERMINAL VIEW CLEANUP & COPY ---
  const getCleanTerminalData = () => {
    return nodes.map((n, i) => {
      const { color, onDelete, stepIndex, ...cleanData } = n.data;
      return {
        step: i + 1,
        moduleId: `MOD_${n.id.split('-')[1]}`,
        ...cleanData
      };
    });
  };

  const handleCopyTerminal = () => {
    navigator.clipboard.writeText(JSON.stringify(getCleanTerminalData(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- MOCK EXECUTION THOUGHT PROCESS ---
  const runProcess = async (type: 'simulate' | 'execute') => {
    if (nodes.length === 0) { setStatusState('error'); setStatusMessage('Canvas empty.'); return; }

    setIsProcessing(true);
    setStatusState('thinking');
    setStatusMessage(type === 'simulate' ? 'Simulating...' : 'Executing Sequence...');
    setTerminalLogs(['[SYS] Booting Automata Execution Engine v1.4...']);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    await delay(800);
    setTerminalLogs(prev => [...prev, `[SYS] Parsing ${nodes.length} module(s) from Intent Graph...`]);

    await delay(1000);
    setTerminalLogs(prev => [...prev, `[NET] Fetching live cross-chain liquidity depth...`]);

    await delay(1200);
    setTerminalLogs(prev => [...prev, `[OPT] Calculating optimal routing pathways...`]);

    await delay(1500);

    if (type === 'simulate') {
      setTerminalLogs(prev => [...prev, `[EST] Simulation Complete. Estimated Gas: ~$0.42`]);
      await delay(2000);
      setIsProcessing(false);
      setStatusState('success');
      setStatusMessage('Simulation successful.');
    } else {
      setTerminalLogs(prev => [...prev, `[BLD] Compiling EVM transaction calldata...`]);
      await delay(1200);
      setTerminalLogs(prev => [...prev, `[SEC] Payload verified. Injecting to connected wallet...`]);
      await delay(2000);
      setTerminalLogs(prev => [...prev, `[OK] Transactions confirmed on-chain.`]);
      await delay(1500);
      setIsProcessing(false);
      setStatusState('success');
      setStatusMessage('Flow executed successfully.');
    }

    setTimeout(() => { setStatusState('idle'); setStatusMessage('Ready'); }, 3000);
  };

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden font-mono relative">
      <div className="hidden lg:block w-[260px] shrink-0 z-40 bg-[#0F0F1A] border-r border-white/5">
        <Sidebar activeMode="build" />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[260px] bg-[#0F0F1A] z-50 lg:hidden">
              <Sidebar activeMode="build" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A12] relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0F0F1A] shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Bars3Icon className="w-5 h-5" />
            </button>
            <div className="text-[10px] text-[#E91E8C] tracking-[0.3em] uppercase font-bold flex items-center gap-6">
              <span className="text-[#E91E8C]">NETWORK</span>
              <span className="hidden sm:inline text-white/40">AGENTS</span>
              <span className="hidden sm:inline text-white/40">BRIDGE</span>
            </div>
          </div>
          <div className="flex bg-[#1A1A2E] p-1 border border-white/5">
            <button onClick={() => setView('visual')} className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase ${view === 'visual' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}><Squares2X2Icon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Visual</span></button>
            <button onClick={() => setView('terminal')} className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase ${view === 'terminal' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}><CodeBracketIcon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Terminal</span></button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">

          <div className="hidden lg:flex w-[280px] bg-[#12121A] border-r border-white/5 flex-col z-20 shrink-0">
            <div className="p-4 border-b border-white/5 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">Nodes</div>
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
              {PALETTE_ITEMS.map((item) => (
                <DraggablePaletteItem key={item.type} item={item} onDragStart={onDragStart} />
              ))}
            </div>
          </div>

          <div className="flex-1 relative bg-[#0A0A12]" ref={reactFlowWrapper}>
            {view === 'visual' ? (
              <>
                <div className="absolute top-4 left-4 z-30 flex items-center gap-4 pointer-events-none">
                  <div className="flex items-center gap-4 bg-[#12121A]/80 backdrop-blur-md border border-white/5 p-2 px-3 shadow-lg">
                    <span className="text-[8px] text-[#E91E8C] tracking-[0.3em] font-bold">DRAFT_V04</span>
                    <div className="w-[1px] h-3 bg-white/10" />
                    <span className="flex items-center gap-2 text-[8px] text-white/60 tracking-widest">
                      <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full shadow-[0_0_10px_#22C55E] animate-pulse" /> LIVE SYNC
                    </span>
                  </div>
                  <div className="flex items-center bg-[#12121A]/80 backdrop-blur-md border border-white/5 pointer-events-auto shadow-lg">
                    <button onClick={() => reactFlowInstance?.zoomIn()} className="p-2.5 hover:bg-white/5 text-white/40 hover:text-white border-r border-white/5"><MagnifyingGlassPlusIcon className="w-3 h-3" /></button>
                    <button onClick={() => reactFlowInstance?.zoomOut()} className="p-2.5 hover:bg-white/5 text-white/40 hover:text-white border-r border-white/5"><MagnifyingGlassMinusIcon className="w-3 h-3" /></button>
                    <button onClick={() => reactFlowInstance?.fitView()} className="p-2.5 hover:bg-white/5 text-white/40 hover:text-white"><div className="w-3 h-3 border border-current rounded-sm" /></button>
                  </div>
                </div>

                <ReactFlow
                  nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver}
                  onPaneClick={() => { setNodes(nds => nds.map(n => ({ ...n, selected: false }))); setIsMobileConfigOpen(false); }}
                  onNodeClick={() => { if (window.innerWidth < 1024) setIsMobileConfigOpen(true); }}
                  nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.5, minZoom: 0.5, maxZoom: 1.2 }} proOptions={{ hideAttribution: true }}
                >
                  <Background color="rgba(255,255,255,0.05)" gap={24} size={1} />
                  <Controls position="bottom-left" showInteractive={false} className="hidden" />
                </ReactFlow>

                {nodes.length === 0 && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] border border-dashed border-white/10 p-6 backdrop-blur-sm">
                      Drag an action here to build your flow
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* CLEANED TERMINAL VIEW */
              <div className="absolute inset-0 bg-[#050508] p-6 sm:p-12 overflow-y-auto z-40 custom-scrollbar flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-[#22C55E]/20 pb-4">
                  <div className="text-[10px] text-[#22C55E] tracking-[0.3em] uppercase flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#22C55E] animate-pulse" /> Flow_Configuration_Export.json
                  </div>
                  <button onClick={handleCopyTerminal} className="flex items-center gap-2 text-[9px] text-[#22C55E] uppercase tracking-widest border border-[#22C55E]/30 px-4 py-2 hover:bg-[#22C55E]/10 transition-colors">
                    {copied ? <CheckIcon className="w-3 h-3" /> : <DocumentDuplicateIcon className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Data'}
                  </button>
                </div>
                <pre className="text-[#22C55E]/80 text-xs font-mono leading-loose flex-1">{JSON.stringify(getCleanTerminalData(), null, 2)}</pre>
              </div>
            )}

            {/* PROCESS SIMULATION OVERLAY */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-4 sm:inset-x-12 bottom-12 top-24 bg-[#050508]/95 backdrop-blur-xl border border-[#22C55E]/30 z-50 p-8 font-mono text-[#22C55E] overflow-y-auto shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col"
                >
                  <div className="text-[10px] tracking-[0.3em] uppercase border-b border-[#22C55E]/20 pb-4 mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#22C55E] animate-pulse" /> Automata Terminal Environment
                  </div>
                  <div className="space-y-4 flex-1">
                    {terminalLogs.map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs sm:text-sm tracking-wider">
                        {log}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          <div className="w-[380px] bg-[#12121A] border-l border-white/5 flex-col z-20 shrink-0 hidden xl:flex">
            {selectedNode ? (
              <NodeConfigContent node={selectedNode} updateNode={updateNodeData} onClose={() => setNodes(nds => nds.map(n => ({ ...n, selected: false })))} />
            ) : (
              <div className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="text-[10px] text-white/20 uppercase tracking-widest leading-loose border border-dashed border-white/10 p-8 shadow-inner">Select a node on the<br />canvas to configure</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:hidden absolute bottom-[100px] right-6 z-30">
          <button onClick={() => setIsMobileDrawerOpen(true)} className="w-14 h-14 bg-[#E91E8C] border border-[#E91E8C] flex items-center justify-center shadow-[0_0_30px_rgba(233,30,140,0.4)] hover:bg-[#E91E8C]/80 transition-colors">
            <PlusIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileDrawerOpen(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#12121A] border-t border-white/10 z-50 p-6 lg:hidden max-h-[60vh] overflow-visible shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-syne text-lg font-black uppercase tracking-widest">Drag UP to Add</h3>
                  <button onClick={() => setIsMobileDrawerOpen(false)}><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 overflow-visible">
                  {PALETTE_ITEMS.map((item) => (
                    <motion.div key={item.type} drag dragSnapToOrigin onDragEnd={(e, info) => handleMobileDragEnd(e, info, item.type)} whileDrag={{ scale: 1.1, zIndex: 999 }} className="bg-[#1A1A2E] border border-white/5 p-4 cursor-grab active:cursor-grabbing shadow-lg" style={{ borderLeft: `2px solid ${TYPE_COLOURS[item.type]}` }}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.type}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMobileConfigOpen && selectedNode && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileConfigOpen(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm xl:hidden" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-[85%] max-w-[380px] bg-[#12121A] border-l border-white/10 z-50 xl:hidden flex flex-col shadow-2xl">
                <NodeConfigContent node={selectedNode} updateNode={updateNodeData} onClose={() => setIsMobileConfigOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <footer className="h-16 sm:h-20 bg-[#0F0F1A] border-t border-white/5 flex items-center px-4 sm:px-6 justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold">
            <span className={`flex items-center gap-2 ${statusState === 'success' ? 'text-[#22C55E]' : statusState === 'error' ? 'text-[#EF4444]' : 'text-[#E91E8C]'}`}>
              <span className={`w-2 h-2 rounded-full ${statusState === 'thinking' ? 'bg-[#F59E0B] animate-pulse' : statusState === 'success' ? 'bg-[#22C55E]' : statusState === 'error' ? 'bg-[#EF4444]' : 'bg-[#E91E8C]'}`} />
              {statusState === 'idle' ? `${nodes.length} Modules Ready` : statusState}
            </span>
            <span className="text-white/40 border-l border-white/10 pl-4 hidden sm:block">{statusMessage}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => runProcess('simulate')} disabled={isProcessing} className="px-8 py-3.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-colors hidden sm:block disabled:opacity-50">
              Simulate
            </button>
            <button onClick={() => runProcess('execute')} disabled={isProcessing} className="bg-[#E91E8C] text-white px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-colors disabled:opacity-50">
              Execute Flow →
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function BuildPage() {
  return (
    <AuthGuard>
      <FlowBuilderContent />
    </AuthGuard>
  )
}
