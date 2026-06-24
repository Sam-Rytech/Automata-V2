const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

function storageAccessor<T>(key: string, value?: T): T | void {
  if (typeof window === 'undefined') return value === undefined ? undefined : value;
  if (value !== undefined) {
    localStorage.setItem(key, value);
  } else {
    return localStorage.getItem(key) as T;
  }
}

function storageRemover(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function saveGeminiKey(key: string): void {
  storageAccessor(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  return storageAccessor(GEMINI_KEY) ?? '';
}

export function clearGeminiKey(): void {
  storageRemover(GEMINI_KEY);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  storageAccessor(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  return (storageAccessor(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}