'use client';
import { motion } from 'framer-motion';
import { WalletIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, SquaresPlusIcon, ClockIcon } from '@heroicons/react/24/solid';

interface SidebarProps {
  executionMode: 'assisted' | 'autonomous';
  setExecutionMode: (mode: 'assisted' | 'autonomous') => void;
}

export function ChatSidebar({ executionMode, setExecutionMode }: SidebarProps) {
  const navItems = [
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, active: true },
    { name: 'Builder', icon: SquaresPlusIcon },
    { name: 'History', icon: ClockIcon },
    { name: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-[300px] h-full bg-[#0F0F1A] border-r border-white/5 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-12 mt-10 md:mt-0">
        <h1 className="font-syne text-2xl font-black text-white tracking-tighter uppercase mb-8">Automata</h1>


      </div>

      <div className="mb-10">
        <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">01 —— Connected Wallet</div>
        <div className="bg-[#1A1A2E] p-4 flex items-center gap-3 border-l-2 border-[#E91E8C]">
          <div className="w-8 h-8 bg-[#E91E8C] flex items-center justify-center shrink-0">
            <WalletIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-white font-bold uppercase truncate">0x1a2b...3c4d</div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#22C55E] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" /> Connected
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">02 —— Networks</div>
        <div className="flex flex-wrap gap-2">
          {['BASE', 'CELO', 'ETH', 'XLM'].map(n => (
            <div key={n} className="px-2 py-1 border border-white/10 font-mono text-[9px] text-white/60">{n}</div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">03 —— Balances</div>
        <div className="space-y-3">
          {[
            { t: 'USDC (Base)', v: '1,240.50' },
            { t: 'USDC (Celo)', v: '45.00' },
            { t: 'XLM (Stellar)', v: '892.12' }
          ].map((b, i) => (
            <div key={i} className="flex justify-between font-mono text-[11px] uppercase">
              <span className="text-white/40">{b.t}</span>
              <span className="text-white font-bold">{b.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="font-mono text-[10px] text-white/30 tracking-[0.2em] mb-4 uppercase">04 —— Execution</div>
        <div className="flex border border-white/10 p-1">
          <button
            onClick={() => setExecutionMode('assisted')}
            className={`flex-1 py-2 font-mono text-[10px] font-bold uppercase transition-all
              ${executionMode === 'assisted' ? 'bg-[#E91E8C]/10 border border-[#E91E8C]/40 text-[#E91E8C]' : 'text-white/30'}
            `}
          >
            Assisted
          </button>
          <button
            onClick={() => setExecutionMode('autonomous')}
            className={`flex-1 py-2 font-mono text-[10px] font-bold uppercase transition-all
              ${executionMode === 'autonomous' ? 'bg-[#E91E8C]/10 border border-[#E91E8C]/40 text-[#E91E8C]' : 'text-white/30'}
            `}
          >
            Autonomous
          </button>
        </div>
      </div>

      <nav className="mt-auto space-y-2">
        {navItems.map((item) => (
          <button key={item.name} className={`w-full flex items-center gap-4 px-4 py-3 font-syne text-sm uppercase font-bold transition-all ${item.active ? 'text-[#E91E8C]' : 'text-white/40 hover:text-white'}`}>
            <item.icon className="w-5 h-5" />
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
