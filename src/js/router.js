// Aria — intelligent routing (Phase 1)

const TECHNICAL = [
  'code', 'bug', 'error', 'function', 'api', 'debug', 'javascript', 'python',
  'rust', 'sql', 'regex', 'compile', 'terminal', 'git', 'docker', 'linux',
  'algorithm', 'refactor', 'stack trace', 'typescript', 'html', 'css'
];

const STRATEGIC = [
  'strategy', 'business', 'decide', 'decision', 'plan', 'roadmap', 'career',
  'negotiate', 'offer', 'salary', 'market', 'competitor', 'positioning',
  'shekar', 'invest', 'revenue', 'pricing', 'opportunity'
];

const COMPLEX = [
  'research', 'compare', 'analyze', 'deep dive', 'pros and cons',
  'trade-off', 'tradeoff', 'comprehensive', 'evaluate options'
];

/**
 * Decide which provider + model to use.
 * Returns: { provider, model, label }
 */
export function route(message, history = []) {
  const text = (message || '').toLowerCase();
  const length = text.split(/\s+/).filter(Boolean).length;

  if (COMPLEX.some(k => text.includes(k)) || length > 80) {
    return {
      provider: 'openrouter',
      model: 'openrouter/fusion',
      label: 'fusion · deep'
    };
  }

  if (TECHNICAL.some(k => text.includes(k))) {
    return {
      provider: 'openrouter',
      model: 'x-ai/grok-4',
      label: 'grok · technical'
    };
  }

  if (STRATEGIC.some(k => text.includes(k))) {
    return {
      provider: 'claude',
      model: 'claude-sonnet-4-5',
      label: 'claude · strategic'
    };
  }

  if (length < 15) {
    return {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      label: 'gemini · casual'
    };
  }

  return {
    provider: 'claude',
    model: 'claude-sonnet-4-5',
    label: 'claude · default'
  };
}


