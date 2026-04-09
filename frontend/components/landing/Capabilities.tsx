import { Button } from "@/components/ui/button";

export function Capabilities() {
  return (
    <section className="py-32 px-4 max-w-6xl mx-auto">
      <div className="mb-20 text-center md:text-left">
        <div className="font-mono text-white/50 text-sm tracking-widest mb-6">02 —— CAPABILITIES</div>
        <h2 className="font-syne text-[3.5rem] md:text-[5rem] font-bold text-white leading-none uppercase">
          Everything your<br />money needs.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: SEND */}
        <div className="bg-[#1A1A2E] p-8 border-t-2 border-t-[#E91E8C] relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors">
          <h3 className="font-syne text-2xl font-bold text-white mb-4 uppercase tracking-wider">SEND</h3>
          <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
            Transfer USDC to any wallet on any chain. No gas token needed, pay fees in USDC.
          </p>
          
          <div className="glassmorphism p-4 border-white/5 flex flex-col gap-3">
            <div className="h-10 bg-[#0F0F1A] border border-white/10 px-3 flex items-center font-mono text-xs text-white/40">
              0x... or ENS domain
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-[#0F0F1A] border border-white/10 px-3 flex items-center font-mono text-xs text-white flex-1">
                <span className="text-white/40 mr-2">$</span> 1,000.00
              </div>
              <Button size="sm" className="bg-[#E91E8C]">Send</Button>
            </div>
          </div>
        </div>

        {/* Card 2: SWAP */}
        <div className="bg-[#1A1A2E] p-8 border-t-2 border-t-[#6A0DAD] relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors">
          <h3 className="font-syne text-2xl font-bold text-white mb-4 uppercase tracking-wider">SWAP</h3>
          <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
            Exchange tokens at the best rate, automatically. Liquidity sourced across all DEXs.
          </p>
          
          <div className="glassmorphism p-4 border-white/5 flex flex-col gap-1">
            <div className="flex justify-between items-center py-2 border-b border-white/5 font-mono text-sm">
              <span className="text-white">USDC</span>
              <span className="text-white/50">1,000.00</span>
            </div>
            <div className="py-1 text-center text-white/30 text-xs">↓</div>
            <div className="flex justify-between items-center py-2 font-mono text-sm">
              <span className="text-white">XLM</span>
              <span className="text-[#22C55E]">8,420.50</span>
            </div>
          </div>
        </div>

        {/* Card 3: BRIDGE */}
        <div className="bg-[#1A1A2E] p-8 border-t-2 border-t-[#E91E8C] relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors">
          <h3 className="font-syne text-2xl font-bold text-white mb-4 uppercase tracking-wider">BRIDGE</h3>
          <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
            Move assets across Base, Celo, Ethereum, Stellar. Powered by Circle CCTP.
          </p>
          
          <div className="glassmorphism p-4 border-white/5 flex items-center justify-between">
            <div className="bg-[#0F0F1A] border border-white/10 px-4 py-2 font-mono text-xs text-white">BASE</div>
            <div className="text-white/30 font-mono text-xs">—→</div>
            <div className="bg-[#0F0F1A] border border-white/10 px-4 py-2 font-mono text-xs text-white">STELLAR</div>
          </div>
        </div>

        {/* Card 4: EARN */}
        <div className="bg-[#1A1A2E] p-8 border-t-2 border-t-[#6A0DAD] relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors">
          <h3 className="font-syne text-2xl font-bold text-white mb-4 uppercase tracking-wider">EARN</h3>
          <p className="font-mono text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
            Deposit into yield protocols. Your money works for you while you sleep.
          </p>
          
          <div className="glassmorphism p-4 flex items-end justify-between h-20">
            <div className="font-mono text-sm">
              <div className="text-white/50 text-xs mb-1">USDC on Aave</div>
              <div className="text-[#22C55E]">APY 4.2%</div>
            </div>
            <div className="flex items-end gap-1 h-full">
              <div className="w-4 bg-[#6A0DAD]/30 h-1/3"></div>
              <div className="w-4 bg-[#6A0DAD]/50 h-1/2"></div>
              <div className="w-4 bg-[#6A0DAD]/80 h-3/4"></div>
              <div className="w-4 bg-[#6A0DAD] h-full"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
