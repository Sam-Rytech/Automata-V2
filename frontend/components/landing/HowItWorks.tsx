import { Button } from "@/components/ui/button";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="min-h-screen py-32 px-4 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="mb-20">
        <div className="font-mono text-white/50 text-sm tracking-widest mb-6">01 —— HOW IT WORKS</div>
        <h2 className="font-syne text-[3.5rem] md:text-[5rem] font-bold text-white leading-none uppercase">
          Two ways to<br />move money.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Mockup - Chat */}
        <div className="glassmorphism rounded-xl relative overflow-hidden flex flex-col h-[600px] border-[#E91E8C]/20 border-t-[#E91E8C]/40">
          {/* Title Bar */}
          <div className="h-12 border-b border-white/10 flex items-center px-4 font-mono text-xs text-white/50 tracking-wider bg-[#0F0F1A]/80">
            AUTOMATA — Chat
          </div>
          
          {/* Chat Thread */}
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
            {/* User message */}
            <div className="self-end bg-[#E91E8C] text-white p-4 max-w-[80%] float-right shadow-lg">
              <span className="font-mono text-sm leading-relaxed">
                Bridge 100 USDC from Base to Stellar and swap to XLM
              </span>
            </div>

            {/* Agent message */}
            <div className="self-start glassmorphism p-4 max-w-[90%] mt-4">
              <div className="font-mono text-sm text-white/80 leading-relaxed mb-4">
                On it. Found the best route via Circle CCTP V2.<br />
                <span className="text-[#E91E8C]">Transfer fee: $0.42 · Est. time: 45 sec</span>
              </div>
              
              {/* Transaction Plan */}
              <div className="bg-[#0F0F1A] border-l-2 border-[#E91E8C] p-4 mb-4">
                <div className="font-mono text-xs text-white/50 mb-3 tracking-widest">TRANSACTION PLAN</div>
                <ul className="font-mono text-sm text-white/70 space-y-2">
                  <li><span className="text-white">Step 1:</span> Burn USDC on Base</li>
                  <li><span className="text-white">Step 2:</span> Attest via Circle</li>
                  <li><span className="text-white">Step 3:</span> Mint on Stellar</li>
                  <li><span className="text-white">Step 4:</span> Swap to XLM via Horizon</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-[#E91E8C] text-white hover:bg-[#E91E8C]/80">Confirm & Sign</Button>
                <Button size="sm" variant="ghost">Cancel</Button>
              </div>
            </div>
            
            {/* User confirmation */}
            <div className="self-end bg-[#E91E8C] text-white p-4 max-w-[80%] mt-4">
              <span className="font-mono text-sm">Confirmed.</span>
            </div>
          </div>

          {/* Input Bar */}
          <div className="h-16 border-t border-white/10 bg-[#0F0F1A]/80 px-4 flex items-center">
            <div className="flex-1 font-mono text-sm text-white/30 truncate pr-4">Type a command...</div>
            <Button size="icon-sm" className="bg-[#E91E8C]">↑</Button>
          </div>
        </div>

        {/* Right Mockup - Flow Builder */}
        <div className="glassmorphism rounded-xl relative overflow-hidden flex flex-col h-[600px] border-[#6A0DAD]/20 border-t-[#6A0DAD]/40">
          <div className="h-12 border-b border-white/10 flex items-center px-4 font-mono text-xs text-white/50 tracking-wider bg-[#0F0F1A]/80">
            AUTOMATA — Flow Builder
          </div>

          <div className="flex-1 bg-dot-grid p-8 flex items-center justify-center relative">
            {/* Nodes */}
            <div className="flex items-center gap-12 w-full max-w-lg relative z-10">
              
              {/* Node 1 */}
              <div className="flex-1 bg-[#1A1A2E] border border-white/10 border-t-2 border-t-[#6A0DAD] p-4 relative crosshair-corners">
                <div className="font-mono text-[10px] text-white/50 tracking-wider mb-2">BRIDGE</div>
                <div className="font-syne text-sm text-white font-bold">USDC · Base → Celo</div>
              </div>

              {/* Arrow */}
              <div className="text-white/30 text-xs">→</div>

              {/* Node 2 */}
              <div className="flex-1 bg-[#1A1A2E] border border-white/10 border-t-2 border-t-[#E91E8C] p-4 relative crosshair-corners">
                <div className="font-mono text-[10px] text-white/50 tracking-wider mb-2">SWAP</div>
                <div className="font-syne text-sm text-white font-bold">USDC → cUSD</div>
              </div>

              {/* Arrow */}
              <div className="text-white/30 text-xs">→</div>

              {/* Node 3 */}
              <div className="flex-1 bg-[#1A1A2E] border border-white/10 border-t-2 border-t-[#22C55E] p-4 relative crosshair-corners">
                <div className="font-mono text-[10px] text-white/50 tracking-wider mb-2">STAKE</div>
                <div className="font-syne text-sm text-white font-bold">cUSD → Aave</div>
              </div>
            </div>
            
            {/* Flow line underneath */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-white/20 -translate-y-1/2 z-0" />
          </div>

          {/* Bottom Bar */}
          <div className="h-20 border-t border-white/10 bg-[#0F0F1A]/80 px-6 flex items-center justify-between">
            <div className="font-mono text-xs text-white/50">
              <span className="text-white">Ready to execute</span> · Est. fee $1.20
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="text-white border-white/20">Simulate</Button>
              <Button className="bg-[#E91E8C] text-white w-32">Execute</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
