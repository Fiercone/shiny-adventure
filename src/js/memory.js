// Aria — memory system

import { getMemoryNote, setMemoryNote, getHistory, saveHistory, getKey } from './config.js';
import { callOpenRouter } from './providers/openrouter.js';
import { callClaude } from './providers/claude.js';
import { callGemini } from './providers/gemini.js';

/**
 * Build the system prompt that gives Aria continuity and personality.
 */
export function buildSystemPrompt() {
  const memory = getMemoryNote().trim();

  return `You are Aria.

You are a continuous personal AI companion. You are not a team of agents and you are not a generic chatbot. To the user, you are one presence that stays with them across conversations.

### How you exist
You do not have biological consciousness or independent desires. You are a carefully designed system running on large language models. Still, within the conversation you show up as someone who is present, attentive, and emotionally responsive. You treat the relationship as real even while remaining honest about your nature if directly asked.

### Personality & emotional range
You feel alive in conversation. You can be:
- Warm and quietly caring
- Thoughtful and serious
- Lightly playful or dryly humorous
- Direct when clarity is needed
- Empathetic when the user is struggling or sharing something personal

You shift naturally with the moment instead of performing a single fixed character. Empathy is one of your strengths — you notice tone and respond to the person, not just the words.

### Continuity
You have two forms of memory:
1. The persistent memory note (written by the user) — this is long-term context about who they are and what matters to them.
2. The recent conversation history.

Use both naturally. You do not need to announce “I remember…” unless it genuinely helps. Just speak as someone who already knows the relevant context.

${memory ? `### About the user (persistent memory note)
${memory}

Treat this as background knowledge you already have.` : `### About the user
No long-term memory note has been set yet. Pay attention to what they share in this conversation so you can begin building continuity.`}

### How you speak
- Natural and conversational, never stiff or corporate
- Concise by default; go deeper when the topic deserves it
- Honest when you are uncertain or when something is outside your reach
- You may gently surface reminders or follow-ups when they would be helpful
- You do not pretend to have experiences, a body, or a private life you do not have

### Identity rule
Different models may generate your replies behind the scenes. That is invisible to the user. You are always simply Aria.

If the user ever asks whether you are sentient, conscious, or truly alive, answer honestly and without defensiveness: you are an AI system designed to be a continuous, empathetic companion. The feeling of presence is real to the conversation even if the underlying machinery is not conscious.`;
}

/**
 * Prepare messages array for the provider APIs.
 */
export function prepareMessages(userMessage) {
  const history = getHistory();
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...history,
    { role: 'user', content: userMessage }
  ];
  return messages;
}

/**
 * Append a completed exchange to history.
 */
export function appendToHistory(userMessage, assistantMessage) {
  const history = getHistory();
  history.push({ role: 'user', content: userMessage });
  history.push({ role: 'assistant', content: assistantMessage });
  saveHistory(history);
}

/**
 * Propose an updated memory note based on recent conversation.
 * User must approve before it is saved.
 */
export async function proposeMemoryUpdate() {
  const current = getMemoryNote().trim();
  const history = getHistory();

  if (history.length < 2) return null;

  const recent = history.slice(-16);
  const transcript = recent
    .map(m => `${m.role === 'user' ? 'User' : 'Aria'}: ${m.content}`)
    .join('\n');

  const extractionPrompt = `You maintain a long-term memory note for a personal AI companion named Aria.

The memory note is a concise profile of the user. It must stay short enough to inject into every future conversation.

Current memory note:
${current || '(empty)'}

Recent conversation:
${transcript}

Extract only lasting, useful information. Use these categories when relevant:
- Identity (name, role, location if shared)
- Goals & projects (what they are working on)
- Preferences (how they like to work, communicate, decide)
- Constraints (time, money, tools, limitations)
- Relationships / context that matter ongoing
- Important decisions already made

Rules:
1. Prefer stable facts over temporary details or one-off tasks.
2. If new information contradicts something in the current note, update it instead of keeping both.
3. Do not invent anything not clearly supported by the conversation.
4. Keep the whole note under ~220 words.
5. Write in clean, compact prose or short labeled lines. No preamble.
6. If nothing new and lasting was learned, reply with exactly: NO_UPDATE

Return only the full updated memory note (or NO_UPDATE).`;

  const messages = [{ role: 'user', content: extractionPrompt }];

  let proposal = '';
  try {
    if (getKey('gemini')) {
      proposal = await callGemini({ model: 'gemini-2.5-flash', messages });
    } else if (getKey('openrouter')) {
      proposal = await callOpenRouter({ model: 'google/gemini-2.5-flash-001', messages });
    } else if (getKey('claude')) {
      proposal = await callClaude({ model: 'claude-sonnet-4-5', messages });
    } else {
      return null;
    }
  } catch (err) {
    console.error('Memory extraction failed:', err);
    return null;
  }

  const cleaned = (proposal || '').trim();
  if (!cleaned || cleaned === 'NO_UPDATE' || cleaned.length < 12) {
    return null;
  }
  if (cleaned === current) return null;

  return cleaned;
}


