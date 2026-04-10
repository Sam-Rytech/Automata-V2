'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { StatusState, ActionNodeData } from '@/types/flow';
import { Node as ReactFlowNode } from 'reactflow';
import { toast } from 'sonner';

export function useAutomataEngine() {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  // Engine State
  const [statusState, setStatusState] = useState<StatusState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Execution State
  const [planReviewData, setPlanReviewData] = useState<any | null>(null);
  const [isSigningWallet, setIsSigningWallet] = useState(false);

  const addLog = (msg: string) => setTerminalLogs(prev => [...prev, msg]);
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- CORE PROCESS RUNNER (100% MOCK MODE) ---
  const runProcess = async (type: 'simulate' | 'execute', sequence: ReactFlowNode<ActionNodeData>[]) => {
    if (!sequence || sequence.length === 0) {
      setStatusState('error');
      setStatusMessage('Canvas empty or path disconnected.');
      toast.error('Execution Failed', { description: 'Canvas is empty or the path is disconnected.' });
      return;
    }

    // 🚨 MOCK OVERRIDE: Bypassing Gemini API and Wallet checks for testing phase
    /*
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (!geminiKey || !activeWallet) {
      setStatusState('error');
      setStatusMessage(!geminiKey ? 'Missing Gemini API Key in Settings.' : 'Please connect your wallet.');
      return;
    }
    */

    setIsProcessing(true);
    setStatusState('thinking');
    setStatusMessage(type === 'simulate' ? 'Simulating...' : 'Compiling Execution Plan...');
    setTerminalLogs(['[SYS] Booting Automata Execution Engine v1.4...']);

    await delay(600);
    addLog(`[SYS] Parsed valid sequence of ${sequence.length} module(s)...`);

    await delay(800);
    addLog(`[NET] Transmitting intent to LLM Core (MOCK MODE)...`);

    await delay(1200);
    addLog(`[OPT] Calculating optimal routing pathways...`);

    try {
      if (type === 'simulate') {
        await delay(1500);
        addLog(`[EST] Simulation Complete.`);
        await delay(1000);
        setIsProcessing(false);
        setStatusState('success');
        setStatusMessage('Simulation successful. Ready to execute.');
        toast.success('Simulation Complete', { description: 'Estimated Gas: ~$0.42' });

        setTimeout(() => { setStatusState('idle'); setStatusMessage('Ready'); }, 3000);
      } else {
        await delay(1500);
        addLog(`[BLD] Valid transaction payload received. Generating Plan Review...`);
        await delay(1000);
        setIsProcessing(false);
        setStatusState('awaiting_approval');
        setStatusMessage('Awaiting User Approval...');

        // Mocking the Agent Plan response
        setPlanReviewData({
          steps: sequence.map((node, i) => ({
            stepNumber: i + 1,
            description: `Execute ${node.data.type} operation on ${node.data.fromChain || 'Ethereum'}`,
            estimatedFeeUSD: '0.' + (Math.floor(Math.random() * 50) + 10),
            estimatedTimeSeconds: Math.floor(Math.random() * 20) + 5
          })),
          totalEstimatedFeeUSD: '$1.42',
          estimatedTimeSeconds: 45,
          warnings: ['Slippage tolerance is set to AUTO.']
        });
      }
    } catch (error: any) {
      setIsProcessing(false);
      setStatusState('error');
      setStatusMessage(error.message || 'Execution failed.');
      toast.error('System Error', { description: error.message || 'Execution failed.' });
    }
  };

  // --- PRIVY TRANSACTION EXECUTION (MOCK) ---
  const handleApprovePlan = async () => {
    setStatusState('executing');
    setStatusMessage('Awaiting wallet signature...');
    setPlanReviewData(null);
    setIsSigningWallet(true);

    try {
      // 🚨 MOCK OVERRIDE: Simulating the Privy wallet signature delay
      await delay(3500);

      setStatusState('success');
      setStatusMessage('Flow executed successfully.');
      toast.success('Execution Complete', { description: 'All transactions confirmed on-chain.' });
    } catch (error: any) {
      console.error(error);
      setStatusState('error');
      setStatusMessage(error.message || 'Transaction rejected or failed.');
      toast.error('Transaction Failed', { description: error.message || 'User rejected the signature.' });
    } finally {
      setIsSigningWallet(false);
      setTimeout(() => {
        if (statusState !== 'error') {
          setStatusState('idle');
          setStatusMessage('Ready');
        }
      }, 4000);
    }
  };

  const handleCancelPlan = () => {
    setPlanReviewData(null);
    setStatusState('idle');
    setStatusMessage('Execution aborted.');
    toast.info('Execution Aborted', { description: 'The transaction plan was cancelled.' });
  };

  return {
    statusState,
    statusMessage,
    isProcessing,
    terminalLogs,
    planReviewData,
    isSigningWallet,
    runProcess,
    handleApprovePlan,
    handleCancelPlan
  };
}