const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

export function saveGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_KEY) ?? '';
}

export function clearGeminiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GEMINI_KEY);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  if (typeof window === 'undefined') return 'assisted';
  return (localStorage.getItem(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}
