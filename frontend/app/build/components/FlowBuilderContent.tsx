'use client';

import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  addEdge, useNodesState, useEdgesState,
  Background, Controls, Connection,
  ReactFlowInstance, Node as ReactFlowNode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActionNode } from '@/components/FlowBuilder/ActionNode';
import { ActionType, ActionNodeData } from '@/types/flow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon, CodeBracketIcon, PlusIcon, Bars3Icon, XMarkIcon
} from '@heroicons/react/24/solid';
import { toast } from 'sonner';

import { TYPE_COLOURS, PALETTE_ITEMS } from '../constants';
import { DraggablePaletteItem } from './DraggablePaletteItem';
import { NodeConfigContent } from './NodeConfigContent';
import { TerminalView } from './TerminalView';
import { ExecutionOverlay } from './ExecutionOverlay';
import { CanvasHUD } from './CanvasHUD';
import { PlanReview } from '@/components/PlanReview';
import { useAutomataEngine } from '../hooks/useAutomataEngine';

const nodeTypes = { actionNode: ActionNode };

export function FlowBuilderContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ActionNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [view, setView] = useState<'visual' | 'terminal'>('visual');
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState('');

  const engine = useAutomataEngine();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const selectedNode = nodes.find(n => n.selected);

  const getOrderedSequence = useCallback((): ReactFlowNode<ActionNodeData>[] | null => {
    if (nodes.length === 0) return [];
    if (nodes.length === 1) return nodes;

    const targetIds = new Set(edges.map(e => e.target));
    const rootNodes = nodes.filter(n => !targetIds.has(n.id));

    if (rootNodes.length !== 1) return null;

    const ordered: ReactFlowNode<ActionNodeData>[] = [];
    let currentId: string | undefined = rootNodes[0].id;

    while (currentId) {
      const node = nodes.find(n => n.id === currentId);
      if (node) ordered.push(node);
      const outEdge = edges.find(e => e.source === currentId);
      currentId = outEdge ? outEdge.target : undefined;
    }

    if (ordered.length !== nodes.length) return null;
    return ordered;
  }, [nodes, edges]);

  const handleSaveFlow = () => {
    const sequence = getOrderedSequence();
    if (!sequence) {
      toast.error('Graph Error', { description: 'All modules must be connected in a single path before saving.' });
      return;
    }

    const flow = {
      id: crypto.randomUUID(),
      name: flowName || 'Untitled Flow',
      nodes: sequence.map((n, i) => ({ ...n, data: { ...n.data, stepIndex: i + 1, onDelete: undefined } })),
      edges,
      savedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('automata_flows') || '[]');
    localStorage.setItem('automata_flows', JSON.stringify([flow, ...existing]));

    setSaveDialogOpen(false);
    setFlowName('');
    toast.success('Sequence Saved', { description: `"${flow.name}" has been stored locally.` });
  };

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
    if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

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

  const fireProcess = (type: 'simulate' | 'execute') => {
    const sequence = getOrderedSequence();
    if (!sequence) {
      toast.error('Graph Error', { description: 'All modules must be connected in a single path.' });
      return;
    }
    engine.runProcess(type, sequence);
  }

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

      <AnimatePresence>
        {saveDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSaveDialogOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#12121A] border border-white/10 p-8 w-full max-w-md shadow-2xl">
              <h3 className="font-syne text-xl font-black uppercase tracking-widest mb-2">Save Flow</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">Store this sequence for future execution.</p>
              <input type="text" value={flowName} onChange={e => setFlowName(e.target.value)} placeholder="e.g., Weekly Yield Harvesting" className="w-full bg-[#0A0A12] border border-white/10 px-4 py-3 text-sm text-white focus:border-[#E91E8C]/50 outline-none mb-6 font-mono" />
              <div className="flex justify-end gap-3">
                <button onClick={() => setSaveDialogOpen(false)} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveFlow} className="bg-[#E91E8C] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#E91E8C]/80 transition-colors">Save Sequence</button>
              </div>
            </motion.div>
          </div>
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
          <div className="flex items-center gap-4">
            <button onClick={() => setSaveDialogOpen(true)} className="px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase border border-white/10 hover:bg-white/5 transition-colors hidden md:block">Save Flow</button>
            <div className="flex bg-[#1A1A2E] p-1 border border-white/5">
              <button onClick={() => setView('visual')} className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase ${view === 'visual' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}><Squares2X2Icon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Visual</span></button>
              <button onClick={() => setView('terminal')} className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase ${view === 'terminal' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}><CodeBracketIcon className="w-3 h-3 inline sm:mr-2" /> <span className="hidden sm:inline">Terminal</span></button>
            </div>
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
                <CanvasHUD reactFlowInstance={reactFlowInstance} />

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
              <TerminalView nodes={getOrderedSequence() || nodes} />
            )}

            <ExecutionOverlay isProcessing={engine.isProcessing} terminalLogs={engine.terminalLogs} />

            <AnimatePresence>
              {engine.planReviewData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-[#0A0A12]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-12 overflow-y-auto">
                  <div className="w-full max-w-2xl mt-auto sm:mt-0">
                    <PlanReview plan={engine.planReviewData} onApprove={engine.handleApprovePlan} onCancel={engine.handleCancelPlan} isExecuting={engine.statusState === 'executing'} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {engine.isSigningWallet && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-[#6A0DAD] rounded-full animate-spin mb-4" />
                    <h3 className="text-gray-900 font-bold text-lg mb-1">Confirm in Wallet</h3>
                    <p className="text-gray-500 text-sm">Please sign the transaction in your connected wallet provider to continue.</p>
                  </motion.div>
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
            <span className={`flex items-center gap-2 ${engine.statusState === 'success' ? 'text-[#22C55E]' : engine.statusState === 'error' ? 'text-[#EF4444]' : 'text-[#E91E8C]'}`}>
              <span className={`w-2 h-2 rounded-full ${engine.statusState === 'thinking' || engine.statusState === 'executing' || engine.statusState === 'awaiting_approval' ? 'bg-[#F59E0B] animate-pulse' : engine.statusState === 'success' ? 'bg-[#22C55E]' : engine.statusState === 'error' ? 'bg-[#EF4444]' : 'bg-[#E91E8C]'}`} />
              {engine.statusState === 'idle' ? `${nodes.length} Modules Ready` : engine.statusState}
            </span>
            <span className="text-white/40 border-l border-white/10 pl-4 hidden sm:block">{engine.statusMessage}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => fireProcess('simulate')} disabled={engine.isProcessing || engine.statusState === 'awaiting_approval' || engine.statusState === 'executing'} className="px-8 py-3.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-colors hidden sm:block disabled:opacity-50">
              Simulate
            </button>
            <button onClick={() => fireProcess('execute')} disabled={engine.isProcessing || engine.statusState === 'awaiting_approval' || engine.statusState === 'executing'} className="bg-[#E91E8C] text-white px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-colors disabled:opacity-50">
              Execute Flow →
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}