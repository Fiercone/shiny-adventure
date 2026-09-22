// Aria — OpenRouter client (GPT, DeepSeek, Grok, Fusion, etc.)

import { getKey } from '../config.js';

export async function callOpenRouter({ model, messages, signal }) {
  const apiKey = getKey('openrouter');
  if (!apiKey) throw new Error('OpenRouter API key missing. Add it in Settings.');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://aria.local',
      'X-Title': 'Aria'
    },
    body: JSON.stringify({
      model: model || 'openrouter/auto',
      messages,
      max_tokens: 4096,
      temperature: 0.7
    }),
    signal
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}


