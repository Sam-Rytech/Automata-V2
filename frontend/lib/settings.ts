const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined';
}

export function saveGeminiKey(key: string): void {
  if (!isBrowserEnvironment()) return;
  localStorage.setItem(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  if (!isBrowserEnvironment()) return '';
  return localStorage.getItem(GEMINI_KEY) ?? '';
}

export function clearGeminiKey(): void {
  if (!isBrowserEnvironment()) return;
  localStorage.removeItem(GEMINI_KEY);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  if (!isBrowserEnvironment()) return;
  localStorage.setItem(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  if (!isBrowserEnvironment()) return 'assisted';
  return (localStorage.getItem(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}