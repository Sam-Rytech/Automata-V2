'use client';
import { motion } from 'framer-motion';

export function X402Banner() {
  return (
    <section className="relative py-24 border-b border-[var(--border-subtle)] bg-[#0A0A10] overflow-hidden z-10">
      
      {/* Background Glow / Light Contrast */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[rgba(86,132,209,0.15)] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Dither / Dot Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Context & Partnership */}
        <div className="flex-1 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-mono text-white/50 text-[0.65rem] tracking-widest mb-6 uppercase">
              02 —— NATIVE MONETIZATION
            </div>
            
            {/* Partnership Logos */}
            <div className="flex items-center gap-4 mb-8">
              {/* Automata Logo (using the png) */}
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-sm">
                <img 
                  src="/Automata.png" 
                  alt="Automata" 
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div className="text-white/30 font-mono text-sm">✕</div>

              {/* X402 Logo (mask technique for color manipulation) */}
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(86,132,209,0.1)] backdrop-blur-sm group cursor-pointer transition-all hover:bg-white/10">
                <div
                  className="w-8 h-8 transition-colors duration-300 bg-white/70 group-hover:bg-[#5684D1]"
                  style={{
                    maskImage: 'url("/x402_vector.svg")',
                    WebkitMaskImage: 'url("/x402_vector.svg")',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center'
                  }}
                />
              </div>
            </div>

            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wider mb-6">
              Built-in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#5684D1]">X402</span> Economics.
            </h2>
            
            <p className="font-mono text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
              Automata natively supports X402 payment middleware. Empower your AI agents to seamlessly meter access, manage networked payment schemes, and monetize capabilities across chained executions.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Code Snippet */}
        <div className="flex-1 w-full max-w-2xl lg:max-w-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            {/* Glow around the code block */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5684D1]/30 to-purple-500/30 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative rounded-xl overflow-hidden bg-[#0F0F1A] border border-[var(--border-subtle)] shadow-2xl">
              {/* Window Header */}
              <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-black/40">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 text-center font-mono text-[0.65rem] text-white/40 tracking-wider">
                  api.ts
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm sm:text-base leading-loose overflow-x-auto text-white/80">
                <pre><code>
                  <span className="text-[#5684D1]">app</span><span className="text-white/60">.</span><span className="text-[#D19A66]">use</span><span className="text-white/60">(</span>{'\n'}
                  {'  '}<span className="text-[#D19A66]">paymentMiddleware</span><span className="text-white/60">(</span>{'\n'}
                  {'    '}<span className="text-white/60">{'{'}</span>{'\n'}
                  {'      '}<span className="text-[#98C379]">"GET /weather"</span><span className="text-white/60">: {'{'}</span>{'\n'}
                  {'        '}<span className="text-[#E5C07B]">accepts</span><span className="text-white/60">: [</span><span className="text-[#ABB2BF]">...</span><span className="text-white/60">],</span>                 <span className="text-[#5C6370] italic">{'//'} As many networks / schemes as you want</span>{'\n'}
                  {'        '}<span className="text-[#E5C07B]">description</span><span className="text-white/60">:</span> <span className="text-[#98C379]">"Weather data"</span><span className="text-white/60">,</span>    <span className="text-[#5C6370] italic">{'//'} What your endpoint does</span>{'\n'}
                  {'      '}<span className="text-white/60">{'}'}</span><span className="text-white/60">,</span>{'\n'}
                  {'    '}<span className="text-white/60">{'}'}</span><span className="text-white/60">,</span>{'\n'}
                  {'  '}<span className="text-white/60">)</span>{'\n'}
                  <span className="text-white/60">);</span>
                </code></pre>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
