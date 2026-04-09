export function Chains() {
  return (
    <section id="chains" className="py-24 border-y border-white/5 bg-[#0F0F1D]">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between font-syne text-[1.5rem] md:text-[2.5rem] font-bold text-white uppercase tracking-wider gap-8 text-center md:text-left">
          <div className="hover:text-white/70 transition-colors cursor-default">BASE</div>
          <div className="hover:text-white/70 transition-colors cursor-default">CELO</div>
          <div className="hover:text-white/70 transition-colors cursor-default">ETHEREUM</div>
          <div className="hover:text-white/70 transition-colors cursor-default">STELLAR</div>
          <div className="hover:text-white/70 transition-colors cursor-default">SOLANA</div>
        </div>
      </div>
    </section>
  );
}
