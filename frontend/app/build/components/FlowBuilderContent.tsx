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
  MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon,
  Squares2X2Icon, CodeBracketIcon, PlusIcon, Bars3Icon,
  DocumentDuplicateIcon, CheckIcon, XMarkIcon
} from '@heroicons/react/24/solid';

import { TYPE_COLOURS, PALETTE_ITEMS } from '../constants';
import { DraggablePaletteItem } from './DraggablePaletteItem';
import { NodeConfigContent } from './NodeConfigContent';

const nodeTypes = { actionNode: ActionNode };

export function FlowBuilderContent() {
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
