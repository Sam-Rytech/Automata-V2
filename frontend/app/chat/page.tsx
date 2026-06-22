import { AuthGuard } from '@/components/AuthGuard';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusPanel } from '@/components/StatusPanel';
import { PlanReview } from '@/components/PlanReview';
import { StatusState, AgentPlan } from '@/types/status';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useWallets } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { sendAgentMessage, UnsignedTx } from '@/lib/api';
import { useStellar } from '@/app/StellarProvider';
import { useTransactionExecutor } from '@/app/hooks/useTransactionExecutor';
import { YieldOpportunities, YieldOpportunity } from '@/components/YieldOpportunities';
type Message = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  opportunities?: YieldOpportunity[];
};

function ChatPageContent() {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];
  const { stellarAddress, signStellarTransaction } = useStellar();
  const { executeSequence } = useTransactionExecutor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<StatusState>('idle');
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [pendingTxs, setPendingTxs] = useState<UnsignedTx[]>([]);
  const [executionMode, setExecutionMode] = useState<'assisted' | 'autonomous'>('assisted');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('automata_execution_mode');
    if (savedMode === 'assisted' || savedMode === 'autonomous') {
      setExecutionMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, status, activePlan]);

  const handleSend = async (customInput?: string) => {
    const text = customInput || input;
    if (!text.trim()) return;
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (!geminiKey) {
      toast.error('Configuration Required', {
        description: 'Please add your Gemini API Key in Settings.'
      });
      return;
    }
    if (!activeWallet) {
      toast.error('Wallet Disconnected', {
        description: 'Please connect your wallet to use the agent.'
      });
      return;
    }
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus('thinking');
    try {
      const result = await sendAgentMessage(
        text,
        activeWallet.address,
        geminiKey,
        sessionId,
        stellarAddress
      );
      if (!result.unsignedTxs || result.unsignedTxs.length === 0) {
        setStatus('idle');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'agent',
            content: result.reply || 'I have processed your request.',
            opportunities: result.opportunities
          }
        ]);
        return;
      }
      setPendingTxs(result.unsignedTxs);
      const generatedPlan: AgentPlan = {
        steps: result.unsignedTxs.map((tx, i) => ({
          stepNumber: i + 1,
          description: tx.description || `Execute operation on ${tx.chainId}`,
          estimatedFeeUSD: 'Network Standard',
          estimatedTimeSeconds: 15
        })),
        totalEstimatedFeeUSD: 'Pending',
        estimatedTimeSeconds: result.unsignedTxs.length * 15,
        warnings: ['Review raw transaction parameters in your wallet provider.']
      };
      if (executionMode === 'assisted') {
        setActivePlan(generatedPlan);
        setStatus('awaiting_approval');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'agent',
            content: result.reply || 'I have compiled a transaction plan. Please review and approve.'
          }
        ]);
      } else {
        executePlan(result.unsignedTxs, generatedPlan);
      }
    } catch (error: any) {
      handleError(error);
    }
  };

  const executePlan = async (txsToExecute = pendingTxs, plan = activePlan) => {
    if (!activeWallet || txsToExecute.length === 0) return;
    setActivePlan(null);
    setStatus('executing');
    try {
      const lastTxHash = await executeSequence(
        txsToExecute,
        activeWallet,
        {
          address: stellarAddress,
          signTransaction: signStellarTransaction
        },
        {
          type: 'AGENT_EXECUTION',
          stepCount: plan?.steps?.length || txsToExecute.length
        },
        () => {
          // Bridge relay started callback
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'agent',
              content: `Burn confirmed. Your USDC is on its way to Stellar — this happens automatically in the background. No further action needed. You will receive it in approximately 90 seconds.`
            }
          ]);
        }
      );
      setStatus('success');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'agent',
          content: `Sequence completed. Verification hash: ${lastTxHash}`
        }
      ]);
      toast.success('Execution Complete', {
        description: `Tx Hash: ${lastTxHash}`
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      setPendingTxs([]);
      setTimeout(() => {
        if (status !== 'error') setStatus('idle');
      }, 4000);
    }
  };

  const handleError = (error: any) => {
    setStatus('error');
    if (error.code === 4001) {
      toast.warning('Transaction Rejected', {
        description: 'You cancelled the signature request.'
      });
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'agent',
          content: 'Execution aborted by user.'
        }
      ]);
    } else {
      toast.error('Transaction Failed', {
        description: error.message || 'Failed to execute.'
      });
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'agent',
          content: `Execution failed: ${error.message}`
        }
      ]);
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleCancelPlan = () => {
    setActivePlan(null);
    setPendingTxs([]);
    setStatus('idle');
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'agent',
        content: 'Plan discarded.'
      }
    ]);
    toast.info('Execution Aborted', {
      description: 'The transaction plan was discarded.'
    });
  };

  return (
    // ... rest of the code remains the same ...
  );
}
