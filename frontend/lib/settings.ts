const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined';
}

function getLocalStorageItem(key: string): string | null {
  return isBrowserEnvironment() ? localStorage.getItem(key) : null;
}

function setLocalStorageItem(key: string, value: string): void {
  if (isBrowserEnvironment()) {
    localStorage.setItem(key, value);
  }
}

function removeLocalStorageItem(key: string): void {
  if (isBrowserEnvironment()) {
    localStorage.removeItem(key);
  }
}

export function saveGeminiKey(key: string): void {
  setLocalStorageItem(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  return getLocalStorageItem(GEMINI_KEY) ?? '';
}

export function clearGeminiKey(): void {
  removeLocalStorageItem(GEMINI_KEY);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  setLocalStorageItem(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  return (getLocalStorageItem(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}