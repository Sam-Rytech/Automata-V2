import { ChatMockup } from "./ChatMockup";
import { FlowBuilderMockup } from "./FlowBuilderMockup";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="min-h-screen py-32 px-4 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="mb-20">
        <div className="font-mono text-white/50 text-sm tracking-widest mb-6 uppercase">
          01 —— How it works
        </div>
        <h2 className="font-syne text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] font-bold text-white leading-none uppercase tracking-tighter">
          Two ways to<br />move money.
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
        <ChatMockup />
        <FlowBuilderMockup />
      </div>
    </section>
  );
}