'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import {
  getGeminiKey,
  saveGeminiKey,
  getAgentMode,
  saveAgentMode,
} from '@/lib/settings';

export default function SettingsPage() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [keyInput, setKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState(false);
  const [agentMode, setAgentMode] = useState<'assisted' | 'autonomous'>('assisted');

  // Load existing settings on mount
  useEffect(() => {
    const existingKey = getGeminiKey();
    if (existingKey) {
      setKeyInput(existingKey);
      setSavedKey(true);
    }
    setAgentMode(getAgentMode());
  }, []);

  function handleSaveKey() {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    saveGeminiKey(trimmed);
    setSavedKey(true);
    
    // Quick reset for the animation if they save again
    setTimeout(() => setSavedKey(false), 3000); 
  }

  function handleModeChange(mode: 'assisted' | 'autonomous') {
    setAgentMode(mode);
    saveAgentMode(mode);
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#FFFFFF] p-8 md:p-16 font-mono">
      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <header className="space-y-2 border-b border-[rgba(255,255,255,0.08)] pb-6">
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Settings</h1>
          <p className="text-[#888888]">Manage your AI key, execution preferences, and wallet.</p>
        </header>

        {/* SECTION 1: AI Agent Key */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-[#E91E8C] uppercase tracking-wide">Your AI Agent Key</h2>
            <p className="text-sm text-[#888888] mt-1">
              Automata uses your own Google Gemini key so you stay in control. 
              It's free to get at aistudio.google.com — no credit card needed.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative w-full max-w-md">
              <Input 
                type="password" 
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setSavedKey(false);
                }}
                placeholder="Paste your Gemini API key"
                className="rounded-none bg-[#16213E] border-[rgba(255,255,255,0.08)] focus-visible:ring-[#E91E8C] focus-visible:ring-offset-0 focus-visible:border-[#E91E8C]"
              />
            </div>
            
            <button 
              onClick={handleSaveKey}
              className="tech-button bg-[#E91E8C] hover:bg-[#c21472] text-white px-6 py-2 rounded-none transition-colors relative"
            >
              <span className="tech-corners-extra"></span>
              Save Key
            </button>
          </div>

          <div className="h-6">
            <AnimatePresence>
              {savedKey ? (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[#22C55E] text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Key saved</span>
                </motion.div>
              ) : (
                <div className="text-sm text-[#888888]">
                  {keyInput ? "Unsaved changes" : "No key saved yet"}
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SECTION 2: Execution Mode */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#E91E8C] uppercase tracking-wide">Execution Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assisted Card */}
            <Card 
              onClick={() => handleModeChange('assisted')}
              className={`rounded-none cursor-pointer relative overflow-hidden transition-all duration-300 ${
                agentMode === 'assisted' 
                  ? 'border-[#E91E8C] bg-[#E91E8C]/[0.04] shadow-[0_0_15px_rgba(233,30,140,0.15)]' 
                  : 'border-[rgba(255,255,255,0.08)] bg-[#16213E] hover:bg-[#1A1A2E]'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Assisted</h3>
                  {agentMode === 'assisted' && <CheckCircleIcon className="w-5 h-5 text-[#E91E8C]" />}
                </div>
                <p className="text-[#888888] text-sm">
                  I review every step before anything executes.
                </p>
              </div>
            </Card>

            {/* Autonomous Card */}
            <Card 
              onClick={() => handleModeChange('autonomous')}
              className={`rounded-none cursor-pointer relative overflow-hidden transition-all duration-300 ${
                agentMode === 'autonomous' 
                  ? 'border-[#E91E8C] bg-[#E91E8C]/[0.04] shadow-[0_0_15px_rgba(233,30,140,0.15)]' 
                  : 'border-[rgba(255,255,255,0.08)] bg-[#16213E] hover:bg-[#1A1A2E]'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Autonomous</h3>
                  {agentMode === 'autonomous' && <CheckCircleIcon className="w-5 h-5 text-[#E91E8C]" />}
                </div>
                <p className="text-[#888888] text-sm">
                  Agent executes immediately. I get notified when done.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 3: Connected Wallets */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#E91E8C] uppercase tracking-wide">Your Wallets</h2>
          
          <Card className="rounded-none border-[rgba(255,255,255,0.08)] bg-[#16213E] p-6">
            {!authenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[#888888]">Connect a wallet to get started</span>
                <button 
                  onClick={login}
                  className="tech-button bg-[#6A0DAD] hover:bg-[#520987] text-white px-6 py-2 rounded-none transition-colors relative"
                >
                  <span className="tech-corners-extra"></span>
                  Connect
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <div key={wallet.address} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#1A1A2E] border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm tracking-wider">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      {wallet.walletClientType === 'privy' && (
                        <Badge className="bg-[#6A0DAD] text-white hover:bg-[#6A0DAD] rounded-none">
                          Privy
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <button className="tech-button border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.05)] px-4 py-2 rounded-none text-sm transition-colors relative">
                    <span className="tech-corners-extra"></span>
                    Manage Wallets
                  </button>
                </div>
              </div>
            )}
          </Card>
        </section>

      </div>
    </div>
  );
}
