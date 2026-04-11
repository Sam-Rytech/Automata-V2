import { useState, useEffect } from 'react';
import { getAgentMode, saveAgentMode } from '@/lib/settings';

export function useExecutionMode() {
  const [executionMode, setExecutionModeState] = useState<'assisted' | 'autonomous'>('assisted');

  useEffect(() => {
    setExecutionModeState(getAgentMode());
  }, []);

  const setExecutionMode = (mode: 'assisted' | 'autonomous') => {
    setExecutionModeState(mode);
    saveAgentMode(mode);
  };

  return { executionMode, setExecutionMode };
}
