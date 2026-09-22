// Aria — configuration & local storage helpers

const STORAGE_KEYS = {
  claude: 'aria_key_claude',
  gemini: 'aria_key_gemini',
  openrouter: 'aria_key_openrouter',
  memory: 'aria_memory_note',
  history: 'aria_chat_history',
  voiceOutput: 'aria_voice_output',
  onboarded: 'aria_onboarded',
};

export function getKey(provider) {
  return localStorage.getItem(STORAGE_KEYS[provider]) || '';
}

export function setKey(provider, value) {
  localStorage.setItem(STORAGE_KEYS[provider], value.trim());
}

export function getMemoryNote() {
  return localStorage.getItem(STORAGE_KEYS.memory) || '';
}

export function setMemoryNote(text) {
  localStorage.setItem(STORAGE_KEYS.memory, text);
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
  } catch {
    return [];
  }
}

export function saveHistory(messages) {
  const trimmed = messages.slice(-40);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(trimmed));
}

export function getVoiceOutputEnabled() {
  const val = localStorage.getItem(STORAGE_KEYS.voiceOutput);
  return val === null ? true : val === 'true';
}

export function setVoiceOutputEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.voiceOutput, String(enabled));
}

export function hasAnyKey() {
  return !!(getKey('claude') || getKey('gemini') || getKey('openrouter'));
}

export function isOnboarded() {
  return localStorage.getItem(STORAGE_KEYS.onboarded) === 'true';
}

export function setOnboarded(value = true) {
  localStorage.setItem(STORAGE_KEYS.onboarded, String(value));
}


