export function Models() {
  return (
    <section id="models" className="py-32 px-4 max-w-6xl mx-auto">
      <div className="mb-20 text-center flex flex-col items-center">
        <div className="font-mono text-white/50 text-sm tracking-widest mb-6">03 —— INTELLIGENCE</div>
        <h2 className="font-syne text-[3rem] md:text-[4rem] font-bold text-white leading-none uppercase mb-6">
          Optimized for<br />intelligence.
        </h2>
        <p className="font-mono text-white/60 max-w-lg text-sm leading-relaxed">
          Automata works with your own API key. Choose the model you trust.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Gemini */}
        <div className="bg-[#1A1A2E] p-8 border border-white/5 border-t-[#E91E8C] relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors shadow-[0_0_30px_rgba(233,30,140,0.05)]">
          <div className="font-mono text-[10px] text-[#E91E8C] tracking-widest mb-2 uppercase">Recommended</div>
          <h3 className="font-syne text-2xl font-bold text-white mb-2 uppercase tracking-wider">GEMINI 2.0 FLASH</h3>
          <p className="font-mono text-xs text-white/60 mb-8 leading-relaxed h-12">
            Ultra-fast thinking that excels at multi-network routing and complex chain reasoning.
          </p>
          <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-auto">POWERED BY GOOGLE</div>
        </div>

        {/* GPT-4o */}
        <div className="bg-[#1A1A2E] p-8 border border-white/5 relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors">
          <div className="font-mono text-[10px] text-white/50 tracking-widest mb-2 uppercase">Advanced Reasoning</div>
          <h3 className="font-syne text-2xl font-bold text-white mb-2 uppercase tracking-wider">GPT-4o</h3>
          <p className="font-mono text-xs text-white/60 mb-8 leading-relaxed h-12">
            Highest precision for multi-chain transaction logic and safety protocols.
          </p>
          <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-auto">POWERED BY OPENAI</div>
        </div>

        {/* Claude */}
        <div className="bg-[#1A1A2E] p-8 border border-white/5 relative crosshair-corners group hover:bg-[#1A1A2E]/80 transition-colors">
          <div className="font-mono text-[10px] text-white/50 tracking-widest mb-2 uppercase">Versatile Creation</div>
          <h3 className="font-syne text-2xl font-bold text-white mb-2 uppercase tracking-wider">CLAUDE 3.5 SONNET</h3>
          <p className="font-mono text-xs text-white/60 mb-8 leading-relaxed h-12">
            Balanced performance for long-form agent execution and flow building.
          </p>
          <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-auto">POWERED BY ANTHROPIC</div>
        </div>
      </div>

      <p className="text-center font-mono text-xs text-white/40 max-w-md mx-auto">
        Enter your API key once in Settings. It never leaves your device.
      </p>
    </section>
  );
}
