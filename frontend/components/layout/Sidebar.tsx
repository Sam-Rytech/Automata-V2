import Link from 'next/link';
import {
  WalletIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  SquaresPlusIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useStellar } from '../../app/StellarProvider';
import { useBalances } from '../../hooks/useBalances';
import { useMiniPay } from '../providers/MiniPayProvider';

interface SidebarProps {
  activeMode: 'chat' | 'build' | 'history' | 'settings';
  executionMode?: 'assisted' | 'autonomous';
  setExecutionMode?: (mode: 'assisted' | 'autonomous') => void;
}

const getTruncatedAddress = (address: string | null): string => {
  if (!address) return '—';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getWalletStatus = (
  authenticated: boolean,
  isMiniPay: boolean,
  stellarAddress: string | null
): string => {
  if (isMiniPay) return 'MiniPay';
  if (authenticated) return 'EVM Ready';
  if (stellarAddress) return 'Stellar Ready';
  return 'EVM Offline';
};

const renderWallet = (
  walletAddress: string | null,
  stellarAddress: string | null,
  connectStellar: () => void,
  disconnectStellar: () => void,
  isMiniPay: boolean,
  authenticated: boolean
) => (
  <>
    {/* Connected Wallet 1 — EVM (Privy) */}
    <div className="bg-[#1A1A2E] p-3 flex items-center gap-3 border-l-2 border-[#E91E8C] mb-2">
      <div className="w-8 h-8 bg-[#E91E8C] flex items-center justify-center shrink-0">
        <WalletIcon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[9px] text-[#22C55E] tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              authenticated ? 'bg-[#22C55E] animate-pulse' : 'bg-white/30'
            }`}
          />
          {getWalletStatus(authenticated, isMiniPay, stellarAddress)}
        </div>
        <div className="font-mono text-[11px] text-white font-bold uppercase truncate">
          {getTruncatedAddress(walletAddress)}
        </div>
      </div>
    </div>
    {/* Connected Wallet 2 — Stellar (Multi-Wallet) */}
    <div className="bg-[#1A1A2E] p-3 flex items-center gap-3 border-l-2 border-[#6A0DAD]">
      <div className="w-8 h-8 bg-[#6A0DAD] flex items-center justify-center shrink-0">
        <WalletIcon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1 text-[#22C55E]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              stellarAddress ? 'bg-[#22C55E] animate-pulse' : 'bg-white/30'
            }`}
          />
          {stellarAddress ? 'Stellar Ready' : 'Stellar Offline'}
        </div>
        {stellarAddress ? (
          <div
            className="font-mono text-[11px] text-white font-bold uppercase truncate cursor-pointer hover:text-white/70"
            onClick={disconnectStellar}
            title="Click to disconnect"
          >
            {getTruncatedAddress(stellarAddress)}
          </div>
        ) : (
          <button
            onClick={connectStellar}
            className="font-mono text-[10px] font-bold text-white/60 hover:text-white uppercase transition-colors text-left"
          >
            Connect Stellar
          </button>
        )}
      </div>
    </div>
  </>
);

const renderNavigation = (
  navItems: { name: string; icon: any; href: string; id: string }[],
  activeMode: string
) => (
  <nav className="space-y-2 mb-10 mt-auto">
    {navItems.map((item) => (
      <Link key={item.name} href={item.href}>
        {/* navigation item content */}
      </Link>
    ))}
  </nav>
);

export function Sidebar({
  activeMode,
  executionMode = 'assisted',
  setExecutionMode,
}: SidebarProps) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { stellarAddress, connectStellar, disconnectStellar } = useStellar();
  const { isMiniPay } = useMiniPay();
  const walletAddress = wallets[0]?.address ?? null;
  const navItems = [
    {
      name: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      id: 'chat',
    },
    // ... other navigation items
  ];

  return (
    <aside
      className="w-[260px] h-full bg-[#0F0F1A] border-r border-white/5 flex flex-col p-6 overflow-y-auto custom-scrollbar"
    >
      {/* Brand Header */}
      <div className="mb-8 mt-4 md:mt-0">
        <Link href="/">
          <h1
            className="font-mono text-2xl font-black text-white tracking-tighter uppercase mb-6 flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            Automata
            <span
              className="bg-[#E91E8C] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-none"
            >
              V1.0
            </span>
          </h1>
        </Link>
      </div>
      {renderWallet(
        walletAddress,
        stellarAddress,
        connectStellar,
        disconnectStellar,
        isMiniPay,
        authenticated
      )}
      {renderNavigation(navItems, activeMode)}
    </aside>
  );
}
