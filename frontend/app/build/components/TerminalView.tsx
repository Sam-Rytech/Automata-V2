'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/solid';
import { ActionNodeData } from '@/types/flow';
import { Node as ReactFlowNode } from 'reactflow';

export function TerminalView({ nodes }: { nodes: ReactFlowNode<ActionNodeData>[] }) {
  const [copied, setCopied] = useState(false);

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

  return (
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
  );
}
