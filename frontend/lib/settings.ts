const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

const storage = (
  operation: (storage: Storage) => void,
  defaultValue?: any
) => {
  if (typeof window === 'undefined') return defaultValue;
  operation(window.localStorage);
};

export function saveGeminiKey(key: string): void {
  storage((localStorage) => localStorage.setItem(GEMINI_KEY, key));
}

export function getGeminiKey(): string {
  return storage((localStorage) => localStorage.getItem(GEMINI_KEY), '') ?? '';
}

export function clearGeminiKey(): void {
  storage((localStorage) => localStorage.removeItem(GEMINI_KEY));
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  storage((localStorage) => localStorage.setItem(AGENT_MODE, mode));
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  return (storage((localStorage) => localStorage.getItem(AGENT_MODE), 'assisted') as 'assisted' | 'autonomous') ?? 'assisted';
}