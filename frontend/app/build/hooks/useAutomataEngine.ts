'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { StatusState, ActionNodeData } from '@/types/flow';
import { Node as ReactFlowNode } from 'reactflow';
import { toast } from 'sonner';
import { sendAgentMessage, UnsignedTx, saveHistoryToDb } from '@/lib/api';

export function useAutomataEngine() {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const [statusState, setStatusState] = useState<StatusState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const [planReviewData, setPlanReviewData] = useState<any | null>(null);
  const [pendingTxs, setPendingTxs] = useState<UnsignedTx[]>([]);
  const [isSigningWallet, setIsSigningWallet] = useState(false);

  const addLog = (msg: string) => setTerminalLogs(prev => [...prev, msg]);

  const buildIntent = (sequence: ReactFlowNode<ActionNodeData>[]) => {
    const actionDescriptions = sequence.map((node, i) => {
      const d = node.data;
      if (d.type === 'SWAP') return `Step ${i + 1}: Swap ${d.amount || '0'} ${d.fromToken || ''} to ${d.toToken || ''} on ${d.fromChain || 'Ethereum'}`;
      if (d.type === 'BRIDGE') return `Step ${i + 1}: Bridge ${d.amount || '0'} ${d.fromToken || ''} from ${d.fromChain || 'Ethereum'} to ${d.toChain || ''}`;
      if (d.type === 'STAKE') return `Step ${i + 1}: Stake ${d.amount || '0'} ${d.fromToken || ''} into ${d.protocol || ''} on ${d.fromChain || 'Ethereum'}`;
      if (d.type === 'TRANSFER' || d.type === 'SEND') return `Step ${i + 1}: Send ${d.amount || '0'} ${d.fromToken || ''} to ${d.toAddress || ''} on ${d.fromChain || 'Ethereum'}`;
      return '';
    }).join('. ');
    return `Generate transaction calldata for the following flow: ${actionDescriptions}. Return only the required transaction payload.`;
  };

  const runProcess = async (type: 'simulate' | 'execute', sequence: ReactFlowNode<ActionNodeData>[]) => {
    if (!sequence || sequence.length === 0) {
      setStatusState('error');
      setStatusMessage('Canvas empty or path disconnected.');
      toast.error('Execution Failed', { description: 'Canvas is empty or the path is disconnected.' });
      return;
    }

    const geminiKey = localStorage.getItem('gemini_api_key');
    if (!geminiKey) {
      setStatusState('error');
      setStatusMessage('Missing Gemini API Key.');
      toast.error('Configuration Required', { description: 'Please add your Gemini API Key in Settings.' });
      return;
    }

    if (!activeWallet) {
      setStatusState('error');
      setStatusMessage('Please connect your wallet.');
      toast.error('Wallet Disconnected', { description: 'Please connect your wallet to execute.' });
      return;
    }

    setIsProcessing(true);
    setStatusState('thinking');
    setStatusMessage('Compiling Execution Plan...');
    setTerminalLogs(['[SYS] Booting Automata Execution Engine v1.4...']);

    try {
      const intent = buildIntent(sequence);
      addLog(`[SYS] Parsed sequence. Generated Intent: "${intent.substring(0, 50)}..."`);
      addLog(`[NET] Transmitting to Automata Backend...`);

      const result = await sendAgentMessage(intent, activeWallet.address, geminiKey, crypto.randomUUID());

      if (result.unsignedTxs && result.unsignedTxs.length > 0) {
        addLog(`[BLD] Valid transaction payload received from Agent. Generating Plan Review...`);
        setPendingTxs(result.unsignedTxs);

        setIsProcessing(false);
        setStatusState('awaiting_approval');
        setStatusMessage('Awaiting User Approval...');

        setPlanReviewData({
          steps: result.unsignedTxs.map((tx, i) => ({
            stepNumber: i + 1,
            description: tx.description || `Execute operation on ${tx.chainId}`,
            estimatedFeeUSD: 'Network Standard',
            estimatedTimeSeconds: 15
          })),
          totalEstimatedFeeUSD: 'Pending',
          estimatedTimeSeconds: result.unsignedTxs.length * 15,
          warnings: ['Review raw transaction parameters in your wallet provider.']
        });
      } else {
        throw new Error(result.reply || 'Agent failed to return valid transaction data.');
      }

    } catch (error: any) {
      setIsProcessing(false);
      setStatusState('error');
      setStatusMessage(error.message || 'Execution failed.');
      toast.error('Backend Error', { description: error.message || 'Failed to fetch plan from agent.' });
    }
  };

  const handleApprovePlan = async () => {
    if (!activeWallet || pendingTxs.length === 0) return;

    setStatusState('executing');
    setStatusMessage('Awaiting wallet signature...');

    // Cache details for DB
    const stepCount = planReviewData?.steps?.length || 0;
    const detailsCache = { steps: stepCount, chainId: pendingTxs[0]?.chainId || 'VARIOUS' };

    setPlanReviewData(null);
    setIsSigningWallet(true);

    try {
      const provider = await activeWallet.getEthereumProvider();
      let lastTxHash = '';

      for (const tx of pendingTxs) {
        lastTxHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            to: tx.to,
            data: tx.data,
            value: tx.value || '0x0',
            from: activeWallet.address
          }]
        });
      }

      // --- DATABASE HISTORY HOOKUP ---
      try {
        await saveHistoryToDb(
          activeWallet.address,
          lastTxHash,
          'FLOW',
          'SUCCESS',
          detailsCache
        );
      } catch (dbErr) {
        console.error('Failed to log history to DB:', dbErr);
      }

      setStatusState('success');
      setStatusMessage('Flow executed successfully.');
      toast.success('Execution Complete', { description: `Tx Hash: ${lastTxHash}` });

    } catch (error: any) {
      console.error(error);
      setStatusState('error');
      setStatusMessage(error.message || 'Transaction rejected or failed.');

      // Log failure to DB as well
      try {
        await saveHistoryToDb(activeWallet.address, undefined, 'FLOW', 'FAILED', detailsCache);
      } catch (e) { }

      if (error.code === 4001) {
        toast.warning('Transaction Rejected', { description: 'You cancelled the signature request.' });
      } else {
        toast.error('Transaction Failed', { description: error.message || 'Failed to execute.' });
      }
    } finally {
      setIsSigningWallet(false);
      setPendingTxs([]);
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
    setPendingTxs([]);
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