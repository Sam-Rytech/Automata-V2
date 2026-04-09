'use client';
import Link from 'next/link';
import { WalletIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, SquaresPlusIcon, ClockIcon, QuestionMarkCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export function BuildSidebar() {
  const navItems = [
    { name: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/chat', active: false },
    { name: 'Builder', icon: SquaresPlusIcon, href: '/build', active: true },
    { name: 'History', icon: ClockIcon, href: '/history', active: false },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/settings', active: false },
  ];

  return (
    <aside className="w-[260px] h-full bg-[#0F0F1A] border-r border-white/5 flex flex-col p-6 overflow-y-auto">
      {/* Brand Header */}
      <div className="mb-12 mt-4 md:mt-0">
        <h1 className="font-syne text-2xl font-black text-white tracking-tighter uppercase mb-8">Automata</h1>

        {/* Connected Wallet Snippet */}
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
      </div>

      {/* Main Navigation */}
      <nav className="space-y-2 mb-10">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <button className={`w-full flex items-center gap-4 px-4 py-3 font-syne text-[13px] uppercase font-bold transition-all ${item.active ? 'bg-[#E91E8C]/10 text-[#E91E8C] border-l-2 border-[#E91E8C]' : 'text-white/40 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-6">
        <button className="w-full bg-[#E91E8C] text-white py-4 font-syne font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-[#E91E8C]/80 transition-colors">
          Launch Agent
        </button>

        <div className="space-y-3 pt-6 border-t border-white/5">
          <button className="flex items-center gap-3 text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors w-full">
            <QuestionMarkCircleIcon className="w-4 h-4" /> Support
          </button>
          <button className="flex items-center gap-3 text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors w-full">
            <DocumentTextIcon className="w-4 h-4" /> Documentation
          </button>
        </div>
      </div>
    </aside>
  );
}
