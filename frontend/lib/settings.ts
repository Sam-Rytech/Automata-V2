const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function saveGeminiKey(key: string): void {
  const localStorage = getLocalStorage();
  if (localStorage) localStorage.setItem(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  const localStorage = getLocalStorage();
  return localStorage?.getItem(GEMINI_KEY) ?? '';
}

export function clearGeminiKey(): void {
  const localStorage = getLocalStorage();
  if (localStorage) localStorage.removeItem(GEMINI_KEY);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  const localStorage = getLocalStorage();
  if (localStorage) localStorage.setItem(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  const localStorage = getLocalStorage();
  return (localStorage?.getItem(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}