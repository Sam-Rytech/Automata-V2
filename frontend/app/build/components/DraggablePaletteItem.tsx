import { useState } from 'react';
import { TYPE_COLOURS, PALETTE_ITEMS } from '../constants';

export function DraggablePaletteItem({
  item,
  onDragStart
}: {
  item: typeof PALETTE_ITEMS[0],
  onDragStart: (e: React.DragEvent, type: string) => void
}) {
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
  );
}
