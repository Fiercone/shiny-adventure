// Aria — main application entry

import {
  getKey, setKey, getMemoryNote, setMemoryNote,
  getVoiceOutputEnabled, setVoiceOutputEnabled,
  hasAnyKey, isOnboarded, setOnboarded
} from './config.js';
import { route } from './router.js';
import { prepareMessages, appendToHistory, proposeMemoryUpdate } from './memory.js';
import { callClaude } from './providers/claude.js';
import { callGemini } from './providers/gemini.js';
import { callOpenRouter } from './providers/openrouter.js';
import { startListening, stopListening, getIsListening, speak, stopSpeaking } from './voice.js';
import { tryParseReminder, addReminder, getDueReminders } from './reminders.js';
import { addMessage, setStatus, clearInput, autoResizeTextarea } from './ui.js';

const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const closeSettingsBtn = document.getElementById('close-settings');

const memoryModal = document.getElementById('memory-modal');
const memoryProposal = document.getElementById('memory-proposal');
const memoryAccept = document.getElementById('memory-accept');
const memoryReject = document.getElementById('memory-reject');

const onboardingModal = document.getElementById('onboarding-modal');
const onboardFinish = document.getElementById('onboard-finish');

let exchangeCount = 0;

async function handleSend(text) {
  const message = (text || input.value || '').trim();
  if (!message) return;

  if (!hasAnyKey()) {
    addMessage('aria', 'I need at least one API key to talk. Open Settings or finish the first-run setup.');
    return;
  }

  if (message.toLowerCase() === 'update memory' || message.toLowerCase() === 'review memory') {
    addMessage('user', message);
    clearInput();
    await triggerMemoryReview();
    return;
  }

  const parsed = tryParseReminder(message);
  if (parsed) {
    addReminder(parsed.text, parsed.at);
    addMessage('user', message);
    addMessage('aria', `Got it. I’ll remind you to “${parsed.text}” later.`);
    clearInput();
    return;
  }

  addMessage('user', message);
  clearInput();
  setStatus('Thinking…');
  sendBtn.disabled = true;

  const decision = route(message);
  const messages = prepareMessages(message);

  let reply = '';
  try {
    if (decision.provider === 'claude') {
      reply = await callClaude({ model: decision.model, messages });
    } else if (decision.provider === 'gemini') {
      reply = await callGemini({ model: decision.model, messages });
    } else {
      reply = await callOpenRouter({ model: decision.model, messages });
    }

    addMessage('aria', reply, decision.label);
    appendToHistory(message, reply);
    exchangeCount++;

    if (getVoiceOutputEnabled()) {
      speak(reply);
    }

    if (exchangeCount >= 4 && exchangeCount % 4 === 0) {
      setTimeout(() => triggerMemoryReview(true), 800);
    }
  } catch (err) {
    console.error(err);
    addMessage('aria', `Something went wrong: ${err.message}`);
  } finally {
    setStatus('Ready');
    sendBtn.disabled = false;
  }
}

async function triggerMemoryReview(silent = false) {
  setStatus('Reviewing memory…');
  try {
    const proposal = await proposeMemoryUpdate();
    if (!proposal) {
      if (!silent) {
        addMessage('aria', 'Nothing new to add to long-term memory right now.');
      }
      setStatus('Ready');
      return;
    }

    memoryProposal.value = proposal;
    memoryModal.classList.remove('hidden');
    setStatus('Memory proposal ready');
  } catch (err) {
    console.error(err);
    if (!silent) addMessage('aria', 'I couldn’t generate a memory update right now.');
    setStatus('Ready');
  }
}

sendBtn.addEventListener('click', () => handleSend());

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

input.addEventListener('input', () => autoResizeTextarea(input));

micBtn.addEventListener('click', () => {
  if (getIsListening()) {
    stopListening();
    micBtn.classList.remove('listening');
    setStatus('Ready');
    return;
  }

  micBtn.classList.add('listening');
  setStatus('Listening…');

  startListening({
    onResult: (text) => {
      input.value = text;
      micBtn.classList.remove('listening');
      handleSend(text);
    },
    onEnd: () => {
      micBtn.classList.remove('listening');
      setStatus('Ready');
    },
    onError: (err) => {
      console.error(err);
      micBtn.classList.remove('listening');
      setStatus('Ready');
      addMessage('aria', 'I couldn’t hear you clearly. Try again?');
    }
  });
});

settingsBtn.addEventListener('click', () => {
  document.getElementById('key-claude').value = getKey('claude');
  document.getElementById('key-gemini').value = getKey('gemini');
  document.getElementById('key-openrouter').value = getKey('openrouter');
  document.getElementById('memory-note').value = getMemoryNote();
  document.getElementById('voice-output').checked = getVoiceOutputEnabled();
  settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

saveSettingsBtn.addEventListener('click', () => {
  setKey('claude', document.getElementById('key-claude').value);
  setKey('gemini', document.getElementById('key-gemini').value);
  setKey('openrouter', document.getElementById('key-openrouter').value);
  setMemoryNote(document.getElementById('memory-note').value);
  setVoiceOutputEnabled(document.getElementById('voice-output').checked);
  settingsModal.classList.add('hidden');
  setStatus('Settings saved');
  setTimeout(() => setStatus('Ready'), 1500);
});

memoryAccept.addEventListener('click', () => {
  const text = memoryProposal.value.trim();
  if (text) {
    setMemoryNote(text);
    addMessage('aria', 'Memory updated.');
  }
  memoryModal.classList.add('hidden');
  setStatus('Ready');
});

memoryReject.addEventListener('click', () => {
  memoryModal.classList.add('hidden');
  setStatus('Ready');
});

onboardFinish.addEventListener('click', () => {
  const orKey = document.getElementById('onboard-openrouter').value.trim();
  const claudeKey = document.getElementById('onboard-claude').value.trim();
  const geminiKey = document.getElementById('onboard-gemini').value.trim();
  const memory = document.getElementById('onboard-memory').value.trim();
  const voice = document.getElementById('onboard-voice').checked;

  if (!orKey && !claudeKey && !geminiKey) {
    alert('Please add at least one API key to continue.');
    return;
  }

  if (orKey) setKey('openrouter', orKey);
  if (claudeKey) setKey('claude', claudeKey);
  if (geminiKey) setKey('gemini', geminiKey);
  if (memory) setMemoryNote(memory);
  setVoiceOutputEnabled(voice);
  setOnboarded(true);

  onboardingModal.classList.add('hidden');

  const nameHint = memory ? 'Thanks for telling me a bit about yourself. ' : '';
  addMessage('aria', `${nameHint}I’m ready when you are. You can type, or tap the mic and just talk.`);
  setStatus('Ready');
});

function boot() {
  if (!isOnboarded()) {
    onboardingModal.classList.remove('hidden');
    return;
  }

  const due = getDueReminders();
  if (due.length > 0) {
    due.forEach(r => {
      addMessage('aria', `Reminder: ${r.text}`);
    });
  }

  if (!hasAnyKey()) {
    addMessage('aria', 'Hi. I’m Aria.\n\nOpen Settings (⚙) and add at least one API key so we can start talking.');
  } else {
    addMessage('aria', 'Hey. I’m here.');
  }
}

boot();


