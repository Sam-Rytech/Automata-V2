'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A12] text-white p-6 relative overflow-hidden font-mono">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E91E8C]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center max-w-2xl z-10 relative"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-5 border border-white/10 rounded-2xl bg-[#1A1A2E]/50 backdrop-blur-md shadow-[0_0_30px_rgba(233,30,140,0.15)] relative">
            <ExclamationTriangleIcon className="w-16 h-16 text-[#E91E8C]" />
          </div>
        </div>

        <h1 className="font-syne text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          404
        </h1>

        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#E91E8C]/50 to-transparent mb-8" />

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.3em] text-white/80 mb-6 drop-shadow-md">
          Signal Lost In The Void
        </h2>

        <p className="text-sm md:text-base text-white/40 max-w-md mx-auto mb-10 leading-relaxed font-mono">
          The node you are attempting to connect to does not exist on this chain. It may have been relocated or removed entirely.
        </p>

        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center gap-3 bg-[#E91E8C] text-white px-8 py-4 font-bold uppercase tracking-[0.2em] transition-all overflow-hidden"
          >
            {/* Scanline effect entirely in CSS using basic before/after tricks */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
            <span>Return to Hub</span>
          </motion.div>
        </Link>
      </motion.div>
      
      {/* Decorative Bottom Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
