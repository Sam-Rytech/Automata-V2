import { useState, useRef } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { sendAgentMessage, UnsignedTx, saveHistoryToDb } from '@/lib/api';
import { getGeminiKey } from '@/lib/settings';
import { AgentPlan, StatusState } from '@/types/status';

type Message = { id: string; role: 'user' | 'agent'; content: string };

const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

export function useAgentChat(
  executionMode: 'assisted' | 'autonomous',
  signAndSubmitStellar: (xdr: string) => Promise<string>
) {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<StatusState>('idle');
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [pendingTxs, setPendingTxs] = useState<UnsignedTx[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);

  const appendMessage = (role: 'user' | 'agent', content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content }]);
  };

  const handleSend = async (customInput?: string) => {
    const text = customInput || input;
    if (!text.trim()) return;

    const geminiKey = getGeminiKey();
    if (!geminiKey) {
      toast.error('Configuration Required', { description: 'Please add your Gemini API Key in Settings.' });
      return;
    }

    if (!activeWallet) {
      toast.error('Wallet Disconnected', { description: 'Please connect your wallet to use the agent.' });
      return;
    }

    appendMessage('user', text);
    setInput('');
    setStatus('thinking');

    try {
      const result = await sendAgentMessage(text, activeWallet.address, geminiKey, sessionId);

      if (!result.unsignedTxs || result.unsignedTxs.length === 0) {
        setStatus('idle');
        appendMessage('agent', result.reply || 'I have processed your request.');
        return;
      }

      setPendingTxs(result.unsignedTxs);

      const generatedPlan: AgentPlan = {
        steps: result.unsignedTxs.map((tx, i) => ({
          stepNumber: i + 1,
          description: tx.description || `Execute operation on ${tx.chainId}`,
          estimatedFeeUSD: 'Network Standard',
          estimatedTimeSeconds: 15,
        })),
        totalEstimatedFeeUSD: 'Pending',
        estimatedTimeSeconds: result.unsignedTxs.length * 15,
        warnings: ['Review transaction parameters before approving.'],
      };

      if (executionMode === 'assisted') {
        setActivePlan(generatedPlan);
        setStatus('awaiting_approval');
        appendMessage('agent', result.reply || 'I have compiled a transaction plan. Please review and approve.');
      } else {
        executePlan(result.unsignedTxs, generatedPlan);
      }

    } catch (error: any) {
      setStatus('error');
      toast.error('Agent Error', { description: error.message || 'Failed to communicate with LLM.' });
      appendMessage('agent', `Error: ${error.message || 'I encountered an issue processing that.'}`);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const executePlan = async (txsToExecute = pendingTxs, plan = activePlan) => {
    if (!activeWallet || txsToExecute.length === 0) return;

    setActivePlan(null);
    setStatus('executing');

    try {
      let lastTxHash = '';

      for (const tx of txsToExecute) {
        if (tx.chainId === 'stellar') {
          if (!tx.xdr) throw new Error('Missing XDR for Stellar transaction.');
          lastTxHash = await signAndSubmitStellar(tx.xdr);

        } else {
          const targetChainId = CHAIN_IDS[tx.chainId];
          if (targetChainId) await activeWallet.switchChain(targetChainId);
          const provider = await activeWallet.getEthereumProvider();
          lastTxHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{ to: tx.to, data: tx.data, value: tx.value || '0x0', from: activeWallet.address }],
          });
        }
      }

      try {
        await saveHistoryToDb(
          activeWallet.address,
          lastTxHash,
          'AGENT_EXECUTION',
          'SUCCESS',
          { steps: plan?.steps?.length || txsToExecute.length, chainId: txsToExecute[0].chainId }
        );
      } catch (dbErr) {
        console.error('Failed to log history to DB:', dbErr);
      }

      setStatus('success');
      appendMessage('agent', `Sequence completed successfully. Verification hash: ${lastTxHash}`);
      toast.success('Execution Complete', { description: `Tx Hash: ${lastTxHash}` });

    } catch (error: any) {
      setStatus('error');
      try {
        await saveHistoryToDb(activeWallet.address, undefined, 'AGENT_EXECUTION', 'FAILED', { error: error.message });
      } catch (e) {}

      if (error.code === 4001) {
        toast.warning('Transaction Rejected', { description: 'You cancelled the signature request.' });
        appendMessage('agent', 'Execution aborted by user.');
      } else {
        toast.error('Transaction Failed', { description: error.message || 'Failed to execute.' });
        appendMessage('agent', `Execution failed: ${error.message}`);
      }
    } finally {
      setPendingTxs([]);
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleCancelPlan = () => {
    setActivePlan(null);
    setPendingTxs([]);
    setStatus('idle');
    appendMessage('agent', 'Plan discarded.');
    toast.info('Execution Aborted', { description: 'The transaction plan was discarded.' });
  };

  return {
    messages,
    input,
    setInput,
    status,
    activePlan,
    pendingTxs,
    sessionId,
    scrollRef,
    handleSend,
    executePlan,
    handleCancelPlan,
  };
}
