import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const SCENARIOS = [
  {
    command: 'Bridge 100 USDC from Base to Stellar and swap to XLM',
    reply: 'Found the best route via Circle CCTP V2. Transfer fee: $0.42',
    plan: ['Burn USDC on Base', 'Attest via Circle', 'Mint on Stellar', 'Swap to XLM via Horizon']
  },
  {
    command: 'Stake 5 ETH on Lido and wrap to wstETH',
    reply: 'Current Lido APY is 3.8%. Preparing staking transaction.',
    plan: ['Route to Ethereum Mainnet', 'Deposit ETH to Lido', 'Receive stETH', 'Wrap to wstETH']
  },
  {
    command: 'Send 500 cUSD to 0x4a... on Celo',
    reply: 'Recipient verified on Celo network. Gas fee: <$0.01',
    plan: ['Verify recipient address', 'Check cUSD balance', 'Approve transfer', 'Execute send']
  }
];

const runChatScenario = async (
  setTypedText: (text: string) => void,
  setMessages: (messages: any[]) => void,
  scenario: any,
  isCancelled: () => boolean
) => {
  // 1. Type command
  for (let i = 0; i <= scenario.command.length; i++) {
    if (isCancelled()) return;
    setTypedText(scenario.command.substring(0, i));
    await new Promise((r) => setTimeout(r, 30));
  }
  await new Promise((r) => setTimeout(r, 400));
  if (isCancelled()) return;

  // 2. Send User Message
  setTypedText('');
  const userMsgId = Date.now();
  setMessages((prev) => [...prev, { id: userMsgId, type: 'user', text: scenario.command }]);

  // 3. Agent Reply
  await new Promise((r) => setTimeout(r, 600));
  if (isCancelled()) return;
  const agentMsgId = Date.now() + 1;
  setMessages((prev) => [
    ...prev,
    { id: agentMsgId, type: 'agent', text: scenario.reply, plan: scenario.plan, status: 'pending' }
  ]);

  // 4. Confirm
  await new Promise((r) => setTimeout(r, 1500));
  if (isCancelled()) return;
  setMessages((prev) =>
    prev.map((m) =>
      m.id === agentMsgId ? { ...m, status: 'confirmed' } : m
    )
  );
  const confirmMsgId = Date.now() + 2;
  setMessages((prev) => [
    ...prev,
    { id: confirmMsgId, type: 'user', text: 'Confirmed. Executing...' }
  ]);
};

export function ChatMockup() {
  const [messages, setMessages] = useState<any[]>([]);
  const [typedText, setTypedText] = useState('');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    const runScenario = async () => {
      const s = SCENARIOS[scenarioIdx];
      await runChatScenario(setTypedText, (messages) => setMessages(messages), s, () => isCancelled);
      await new Promise((r) => setTimeout(r, 2000));
      if (isCancelled) return;
      setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
    };
    runScenario();
    return () => {
      isCancelled = true;
    };
  }, [scenarioIdx]);

  // Keep chat scrolled to bottom safely
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    // ... rest of the code remains the same ...
  );
}