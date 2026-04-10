import { useState } from 'react';
import { Node as ReactFlowNode } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { ActionNodeData } from '@/types/flow';
import { CHAINS, ASSETS, PROTOCOLS, SLIPPAGE } from '../constants';

export function NodeConfigContent({
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
  );
}
