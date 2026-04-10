'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { StatusState, ActionNodeData } from '@/types/flow';
import { Node as ReactFlowNode } from 'reactflow';
import { toast } from 'sonner';

export function useAutomataEngine() {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const [statusState, setStatusState] = useState<StatusState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const [planReviewData, setPlanReviewData] = useState<any | null>(null);
  const [isSigningWallet, setIsSigningWallet] = useState(false);

  const addLog = (msg: string) => setTerminalLogs(prev => [...prev, msg]);
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- CORE PROCESS RUNNER (GEMINI MOCKED) ---
  const runProcess = async (type: 'simulate' | 'execute', sequence: ReactFlowNode<ActionNodeData>[]) => {
    if (!sequence || sequence.length === 0) {
      setStatusState('error');
      setStatusMessage('Canvas empty or path disconnected.');
      toast.error('Execution Failed', { description: 'Canvas is empty or the path is disconnected.' });
      return;
    }

    if (type === 'execute' && !activeWallet) {
      setStatusState('error');
      setStatusMessage('Please connect your wallet.');
      toast.error('Wallet Disconnected', { description: 'Please connect your wallet to execute.' });
      return;
    }

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

  // --- REAL PRIVY EXECUTION ---
  const handleApprovePlan = async () => {
    if (!activeWallet) {
      toast.error('Execution Error', { description: 'Wallet lost connection.' });
      return;
    }

    setStatusState('executing');
    setStatusMessage('Awaiting wallet signature...');
    setPlanReviewData(null);
    setIsSigningWallet(true);

    try {
      // 1. Get the real EIP-1193 Provider from Privy
      const provider = await activeWallet.getEthereumProvider();

      // 2. Since Gemini is mocked, we execute a SAFE 0 ETH test transaction to your own address.
      // When Gemini is live, you will loop through the `pendingTxs` returned by the API instead.
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: activeWallet.address, // Sending to yourself
          value: '0x0',             // 0 ETH
          from: activeWallet.address
        }]
      });

      console.log('Transaction Successful. Hash:', txHash);

      setStatusState('success');
      setStatusMessage('Flow executed successfully.');
      toast.success('Execution Complete', { description: `Tx Hash: ${txHash}` });
    } catch (error: any) {
      console.error(error);
      setStatusState('error');
      setStatusMessage(error.message || 'Transaction rejected or failed.');

      // Handle User Rejection vs actual RPC error
      if (error.code === 4001) {
        toast.warning('Transaction Rejected', { description: 'You cancelled the signature request.' });
      } else {
        toast.error('Transaction Failed', { description: error.message || 'Failed to execute.' });
      }
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
    toast.warning('Execution Aborted', { description: 'The transaction plan was cancelled.' });
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