// Aria — Voice layer (free Web Speech API first)
// Clean upgrade path left for ElevenLabs later.

let recognition = null;
let isListening = false;

export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window;
}

/**
 * Start listening. Calls onResult(text) when transcription is ready.
 */
export function startListening({ onResult, onEnd, onError }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.(new Error('Speech recognition not supported in this browser'));
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult?.(text);
  };

  recognition.onerror = (event) => {
    onError?.(event.error);
    isListening = false;
  };

  recognition.onend = () => {
    isListening = false;
    onEnd?.();
  };

  isListening = true;
  recognition.start();
}

export function stopListening() {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
}

export function getIsListening() {
  return isListening;
}

/**
 * Speak text using the browser's default voice.
 * Later swap this for ElevenLabs without touching the rest of the app.
 */
export function speak(text, { onEnd } = {}) {
  if (!isSpeechSynthesisSupported()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.onend = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}


