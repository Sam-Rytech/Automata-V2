const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

const storage = (
  key: string,
  value?: string | null
): string | void => {
  if (typeof window === 'undefined') return value === undefined ? '' : undefined;
  if (value === undefined) return localStorage.getItem(key) ?? '';
  if (value === null) return localStorage.removeItem(key);
  return localStorage.setItem(key, value);
};

export function saveGeminiKey(key: string): void {
  storage(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  return storage(GEMINI_KEY);
}

export function clearGeminiKey(): void {
  storage(GEMINI_KEY, null);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  storage(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  return (storage(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}