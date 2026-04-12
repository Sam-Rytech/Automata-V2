'use client';
import { motion } from 'framer-motion';

export function Chains() {
  const chains = [
    {
      name: 'base',
      hoverTextClass: 'hover:text-[#0000FE]',
      hoverShadowClass: 'hover:drop-shadow-[0_0_15px_rgba(0,0,254,0.4)]',
      src: '/base_logos.jpeg',
    },
    {
      name: 'CELO',
      hoverTextClass: 'hover:text-[#FCFF52]',
      hoverShadowClass: 'hover:drop-shadow-[0_0_15px_rgba(252,255,82,0.3)]',
      src: '/celo-celo-logo.svg',
      textSvg: (
        <svg viewBox="0 0 114 26" fill="none" className="h-[14px] lg:h-5 shrink-0 transition-all duration-300">
          <path fillRule="evenodd" clipRule="evenodd" d="M25.9538 0H0.435547V25.682H25.9533V16.7172H21.7184C20.2586 19.9876 16.9728 22.2654 13.2125 22.2654C8.02853 22.2654 3.83037 18.0039 3.83037 12.823C3.83037 7.64221 8.02853 3.41712 13.2125 3.41712C17.0457 3.41712 20.3315 5.76873 21.7919 9.11197H25.9538V0ZM50.6663 16.7167C49.1698 19.987 45.9205 22.2647 42.1242 22.2649C37.086 22.2649 32.9608 18.2234 32.7783 13.1898H54.9012V0H29.3829V25.6814H54.9012V16.7167H50.6663ZM50.9934 10.0303H33.1782H33.1777C34.3093 5.80518 38.0696 3.41716 42.122 3.41716C46.1743 3.41716 49.6793 5.65795 50.9934 10.0303ZM110.005 12.8225C110.005 18.0398 105.843 22.2649 100.659 22.2649C95.5115 22.2649 91.3133 18.0033 91.3133 12.8225C91.3133 7.64169 95.4753 3.4166 100.659 3.4166C105.843 3.4166 110.005 7.60527 110.005 12.8225ZM113.436 0H87.918V25.682H113.436V0ZM80.4927 16.7167H84.7276V25.6814H58.2969V0H62.6046V12.8225C62.6046 18.5543 66.8395 22.2284 71.8772 22.2284C75.7833 22.2284 79.2148 20.0974 80.4927 16.7172V16.7167Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'ETHEREUM',
      hoverTextClass: 'hover:text-[#627EEA]',
      hoverShadowClass: 'hover:drop-shadow-[0_0_15px_rgba(98,126,234,0.4)]',
      src: '/ethereum-eth-logo.svg',
    },
    {
      name: 'STELLAR',
      hoverTextClass: 'hover:text-white',
      hoverShadowClass: 'hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]',
      src: '/stellar-xlm-logo.svg',
    },
    {
      name: 'SOLANA',
      hoverTextClass: 'hover:text-[#14F195]',
      hoverShadowClass: 'hover:drop-shadow-[0_0_15px_rgba(20,241,149,0.4)]',
      src: '/solana-sol-logo.svg',
    },
    {
      name: 'STACKS',
      hoverTextClass: 'hover:text-[#5546FF]',
      hoverShadowClass: 'hover:drop-shadow-[0_0_15px_rgba(85,70,255,0.4)]',
      src: '/stacks-stx-logo.svg',
    }
  ];

  return (
    <section id="chains" className="py-24 border-y border-[var(--border-subtle)] bg-[#0F0F1A]/80 backdrop-blur-md relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="font-mono text-white/50 text-[0.65rem] tracking-widest mb-3 uppercase">
            04 —— INFRASTRUCTURE
          </div>
          <h2 className="font-syne text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
            Supported Networks
          </h2>
        </div>

        {/* Logos Grid / Row */}
        <div className="grid grid-cols-2 gap-y-10 gap-x-2 place-items-center sm:grid-cols-3 lg:flex lg:flex-row lg:flex-nowrap lg:items-center lg:justify-center lg:gap-12 xl:gap-20">
          
          {chains.map((chain) => (
            <motion.div
              key={chain.name}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 lg:gap-3 text-white/30 transition-all duration-300 cursor-pointer drop-shadow-none 
                         ${chain.hoverTextClass} ${chain.hoverShadowClass} group justify-center`}
            >
              <img 
                src={chain.src} 
                alt={`${chain.name} logo`} 
                className="w-6 h-6 lg:w-8 lg:h-8 shrink-0 object-contain grayscale opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
              />
              {chain.textSvg ? (
                chain.textSvg
              ) : (
                <span className="font-syne font-bold uppercase text-sm lg:text-xl tracking-widest whitespace-nowrap">
                  {chain.name}
                </span>
              )}
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}