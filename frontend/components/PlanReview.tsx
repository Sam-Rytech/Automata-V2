'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign, ChevronRight } from 'lucide-react';
// import { PlanReviewProps } from '@/types/status';

export function PlanReview({ plan, onApprove, onCancel, isExecuting = false }: PlanReviewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
      <div className="bg-[#1A1A2E]/60 border border-[#E91E8C]/40 p-6 rounded-none relative backdrop-blur-md">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-syne text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-[#E91E8C] animate-pulse" />
            Transaction Plan
            </h3>
            <span className="font-mono text-[10px] text-white/30 tracking-[0.3em] uppercase">Auth Required</span>
        </div>

        <div className="space-y-4 mb-8">
          {plan.steps.map((step) => (
            <div key={step.stepNumber} className="flex items-start gap-4 p-5 bg-[#0F0F1A] border border-white/5 rounded-none group hover:border-[#6A0DAD]/50 transition-all">
              <span className="w-6 h-6 bg-[#E91E8C] text-white font-mono text-[10px] flex items-center justify-center shrink-0">
                0{step.stepNumber}
              </span>
              <div className="flex-1">
                <p className="text-white font-mono text-xs leading-relaxed uppercase mb-2">{step.description}</p>
                <div className="flex gap-6 font-mono text-[10px] text-white/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><DollarSign size={10}/> {step.estimatedFeeUSD}</span>
                  <span className="flex items-center gap-1"><Clock size={10}/> ~{step.estimatedTimeSeconds}S</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {plan.warnings.length > 0 && (
          <div className="mb-8 space-y-2">
            {plan.warnings.map((w, i) => (
              <div key={i} className="flex gap-3 items-center p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] font-mono text-[10px] uppercase tracking-widest">
                <AlertTriangle size={14} /> WARNING: {w}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
          <div className="flex gap-8 font-mono text-[10px] uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">Total Fee: <span className="text-[#22C55E] font-bold">{plan.totalEstimatedFeeUSD}</span></div>
            <div className="flex items-center gap-2">Est Time: <span className="text-white font-bold">{plan.estimatedTimeSeconds}S</span></div>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={onCancel} disabled={isExecuting} className="flex-1 sm:flex-none px-8 py-3 border border-white/10 font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 disabled:opacity-50 transition-all">
              Abort
            </button>
            <button 
              onClick={onApprove} 
              disabled={isExecuting} 
              className="flex-1 sm:flex-none px-8 py-3 bg-[#E91E8C] text-white font-mono text-[10px] uppercase tracking-widest font-black transition-all hover:bg-[#E91E8C]/80 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExecuting ? 'SYNCING...' : 'Approve & Execute'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
