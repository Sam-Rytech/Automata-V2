import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-40 px-4">
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
        <h2 className="font-syne text-[5rem] md:text-[8rem] font-bold text-white leading-[0.85] uppercase mb-16 tracking-tighter">
          Your money.<br />
          Your agent.<br />
          Every chain.
        </h2>
        
        <Button size="lg" className="w-[280px]">
          Launch Automata
        </Button>
      </div>
    </section>
  );
}
