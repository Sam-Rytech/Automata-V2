'use client';

import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/solid';
import { ReactFlowInstance } from 'reactflow';

export function CanvasHUD({ reactFlowInstance }: { reactFlowInstance: ReactFlowInstance | null }) {
  return (
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
  );
}
