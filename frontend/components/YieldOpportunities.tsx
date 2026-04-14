'use client';

import { motion } from 'framer-motion';

export interface YieldOpportunity {
  id: string;
  protocol?: string;
  project?: string;
  chain?: string;
  apy?: number;
  apyBase?: number;
  tvlUsd?: number;
  symbol?: string;
  [key: string]: any;
}

interface YieldOpportunitiesProps {
  opportunities: YieldOpportunity[];
  onDeposit: (opportunity: YieldOpportunity) => void;
}

function formatTVL(tvl?: number): string {
  if (!tvl) return "N/A";
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`;
  return `$${tvl.toFixed(0)}`;
}

function getAPY(o: YieldOpportunity): number {
  return o.apy ?? o.apyBase ?? 0;
}

function getProtocol(o: YieldOpportunity): string {
  return o.protocol || o.project || 'Unknown Protocol';
}

function getChain(o: YieldOpportunity): string {
  return o.chain || 'Unknown Chain';
}

export function YieldOpportunities({ opportunities, onDeposit }: YieldOpportunitiesProps) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 w-full"
    >
      <div className="font-mono text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] mb-3">
        Live Yield Opportunities —— {opportunities.length} Found
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {opportunities.slice(0, 5).map((opp, i) => {
          const apy = getAPY(opp);
          const protocol = getProtocol(opp);
          const chain = getChain(opp);

          return (
            <motion.div
              key={opp.id || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] p-4 flex flex-col gap-3 hover:border-[#E91E8C]/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wide truncate max-w-[120px]">
                    {protocol}
                  </span>
                  <span className="font-mono text-[8px] text-white/40 uppercase tracking-[0.2em]">
                    {opp.symbol || 'VAULT'}
                  </span>
                </div>
                <span className="font-mono text-[8px] text-white/60 bg-white/5 border border-white/10 px-2 py-1 uppercase tracking-wider shrink-0">
                  {chain}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-syne font-black text-2xl leading-none" style={{ color: '#E91E8C' }}>
                  {apy.toFixed(2)}%
                </span>
                <span className="font-mono text-[8px] text-white/30 uppercase tracking-wider">
                  per year
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-white/30 uppercase tracking-wider">TVL</span>
                <span className="font-mono text-[10px] text-white/60">{formatTVL(opp.tvlUsd)}</span>
              </div>
              <button
                onClick={() => onDeposit(opp)}
                className="mt-1 w-full bg-transparent border border-[#E91E8C]/40 text-[#E91E8C] font-mono font-bold text-[9px] uppercase tracking-[0.25em] py-2.5 hover:bg-[#E91E8C] hover:text-white transition-all duration-200 group-hover:border-[#E91E8C]"
              >
                Deposit
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
