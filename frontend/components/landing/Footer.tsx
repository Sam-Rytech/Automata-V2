export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0F0F1A] py-12 px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="font-syne text-2xl font-bold text-white tracking-widest mb-2">AUTOMATA</div>
          <div className="font-mono text-xs text-success flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
            V1.0 · TESTNET STATUS
          </div>
        </div>

        <div className="flex gap-16 font-mono text-xs uppercase tracking-widest">
          <div className="flex flex-col gap-4">
            <div className="text-white/60 mb-2">Model</div>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Gemini 2.5 Flash</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Architecture</a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-white/60 mb-2">Build</div>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Github</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Postman / API</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Discord</a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-white/60 mb-2">Legal</div>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Cipher Grids</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto mt-16 flex justify-between items-center font-mono text-[10px] text-white/30 tracking-widest uppercase">
        <div>© 2026 AUTOMATA. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-4">
          <span>SYSTEM: ONLINE</span>
          <span>LATENCY: 42MS</span>
          <span>LAST OUT: NULL</span>
        </div>
      </div>
    </footer>
  );
}
