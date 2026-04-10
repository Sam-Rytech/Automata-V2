'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { TrashIcon } from '@heroicons/react/24/solid';
import { ActionNodeData } from '@/types/flow';

export function ActionNode({ data, selected }: NodeProps<ActionNodeData>) {
  const color = data.color || '#E91E8C';
  const stepNumber = data.stepIndex ? `0${data.stepIndex}` : '01';

  return (
    <div className="relative">
      {/* CAPTURE MODE GLOWING BRACKETS (Expanded with strict #E91E8C brand pink) */}
      {selected && (
        <>
          <div className="absolute -top-4 -left-4 w-5 h-5 border-t-2 border-l-2 shadow-[-2px_-2px_10px_rgba(233,30,140,0.3)] pointer-events-none z-0 border-[#E91E8C]" />
          <div className="absolute -top-4 -right-4 w-5 h-5 border-t-2 border-r-2 shadow-[2px_-2px_10px_rgba(233,30,140,0.3)] pointer-events-none z-0 border-[#E91E8C]" />
          <div className="absolute -bottom-4 -left-4 w-5 h-5 border-b-2 border-l-2 shadow-[-2px_2px_10px_rgba(233,30,140,0.3)] pointer-events-none z-0 border-[#E91E8C]" />
          <div className="absolute -bottom-4 -right-4 w-5 h-5 border-b-2 border-r-2 shadow-[2px_2px_10px_rgba(233,30,140,0.3)] pointer-events-none z-0 border-[#E91E8C]" />

          <div className="absolute -bottom-10 right-0 flex items-center gap-1 pointer-events-none">
            <span className="text-[7px] text-white/40 tracking-[0.2em] uppercase">Est. Gas:</span>
            <span className="text-[9px] text-[#22C55E] font-bold tracking-widest">~$0.14</span>
          </div>
        </>
      )}

      {/* COMPACT NODE CARD */}
      <div
        className={`relative bg-[#12121A] border p-5 w-[240px] transition-all shadow-xl z-10
          ${selected ? 'bg-[#1A1A2E]/80' : 'hover:border-white/20'}
        `}
        style={{ borderColor: selected ? color : 'rgba(255,255,255,0.08)' }}
      >
        <Handle type="target" position={Position.Left} style={{ background: color, width: 8, height: 8, border: 'none', left: -4, borderRadius: 0 }} />
        <Handle type="source" position={Position.Right} style={{ background: color, width: 8, height: 8, border: 'none', right: -4, borderRadius: 0 }} />

        {/* Tech Accents */}
        <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t border-l" style={{ borderColor: color }} />
        <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-b border-r" style={{ borderColor: color }} />
        <div className="absolute top-0 left-0 w-full h-[1px]" style={{ backgroundColor: color }} />

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[8px] text-white/40 tracking-[0.2em] uppercase block mb-1">{stepNumber}_TRIGGER</span>
            <span className="text-[13px] font-black uppercase tracking-widest block text-white">{data.type}_ASSET</span>
            <span className="text-[8px] text-white/40 tracking-[0.1em] uppercase block mt-1">Source: {data.fromChain || 'Ethereum'}</span>
          </div>
          {data.onDelete && (
            <button onClick={(e) => { e.stopPropagation(); data.onDelete!(); }} className="text-white/20 hover:text-[#EF4444] transition-colors mt-0.5 z-50">
              <TrashIcon className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[9px] text-white/60 tracking-widest uppercase">{data.fromToken || 'ETH'} ⟶ {data.toToken || data.asset || 'USDC'}</span>
        </div>
      </div>
    </div>
  );
}