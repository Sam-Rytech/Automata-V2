import { AuthGuard } from '@/components/AuthGuard';
import { LockClosedIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { Sidebar } from '@/components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useStellar } from '@/app/StellarProvider';

const SECTIONS = [
  { id: 'ai-model', num: '01', title: 'AI Model' },
  { id: 'wallet', num: '02', title: 'Wallet' },
  { id: 'execution', num: '03', title: 'Execution' },
  { id: 'appearance', num: '04', title: 'Appearance' },
];

function SettingsPageContent() {
  const { logout } = usePrivy();
  const { wallets } = useWallets();
  const { stellarAddress, connectStellar, disconnectStellar } = useStellar();
  const walletAddress = wallets[0]?.address ?? null;
  const displayAddress = walletAddress ?? 'No wallet connected';
  const [activeSection, setActiveSection] = useState('ai-model');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [executionMode, setExecutionMode] = useState('assisted');
  const [apiKey, setApiKey] = useState('');
  const [hudEnabled, setHudEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const savedMode = localStorage.getItem('automata_execution_mode');
    const savedHud = localStorage.getItem('automata_hud_enabled');
    if (savedKey) setApiKey(savedKey);
    if (savedMode) setExecutionMode(savedMode);
    if (savedHud !== null) setHudEnabled(savedHud === 'true');
  }, []);

  const handleStateChange = (key, value) => {
    switch (key) {
      case 'api_key':
        if (!value.trim()) {
          toast.error('Configuration Error', { description: 'API key cannot be empty.' });
          return;
        }
        localStorage.setItem('gemini_api_key', value.trim());
        setApiKey(value.trim());
        toast.success('Configuration Saved', { description: 'Gemini API Key has been secured locally.' });
        break;
      case 'execution_mode':
        setExecutionMode(value);
        localStorage.setItem('automata_execution_mode', value);
        toast.info('Execution Mode Updated', { description: `Mode set to ${value.toUpperCase()}.` });
        break;
      case 'hud_enabled':
        const newState = !hudEnabled;
        setHudEnabled(newState);
        localStorage.setItem('automata_hud_enabled', String(newState));
        toast.info('Appearance Updated', { description: `Interface HUD is now ${newState ? 'ON' : 'OFF'}.` });
        break;
      default:
        break;
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // ... rest of the code remains the same ...
  );
}
