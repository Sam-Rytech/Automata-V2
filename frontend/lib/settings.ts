const GEMINI_KEY = 'automata_gemini_key';
const AGENT_MODE = 'automata_agent_mode';

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && window.localStorage;
}

function getStorageItem(key: string): string | null {
  return storageAvailable() ? window.localStorage.getItem(key) : null;
}

function setStorageItem(key: string, value: string): void {
  if (storageAvailable()) {
    window.localStorage.setItem(key, value);
  }
}

function removeStorageItem(key: string): void {
  if (storageAvailable()) {
    window.localStorage.removeItem(key);
  }
}

export function saveGeminiKey(key: string): void {
  setStorageItem(GEMINI_KEY, key);
}

export function getGeminiKey(): string {
  return getStorageItem(GEMINI_KEY) ?? '';
}

export function clearGeminiKey(): void {
  removeStorageItem(GEMINI_KEY);
}

export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
  setStorageItem(AGENT_MODE, mode);
}

export function getAgentMode(): 'assisted' | 'autonomous' {
  return (getStorageItem(AGENT_MODE) as 'assisted' | 'autonomous') ?? 'assisted';
}