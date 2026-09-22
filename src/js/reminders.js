// Aria — simple reminder system (v1)

const STORAGE_KEY = 'aria_reminders';

export function getReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReminders(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addReminder(text, timestamp) {
  const list = getReminders();
  list.push({
    id: crypto.randomUUID(),
    text,
    at: timestamp,
    done: false
  });
  saveReminders(list);
}

export function completeReminder(id) {
  const list = getReminders().map(r =>
    r.id === id ? { ...r, done: true } : r
  );
  saveReminders(list);
}

export function getDueReminders() {
  const now = Date.now();
  return getReminders().filter(r => !r.done && r.at <= now);
}

/**
 * Simple parser for phrases like:
 * "remind me to call mom in 20 minutes"
 */
export function tryParseReminder(message) {
  const lower = message.toLowerCase();
  if (!lower.includes('remind me')) return null;

  const inMatch = lower.match(/in (\d+)\s*(minute|minutes|hour|hours|day|days)/);
  if (inMatch) {
    const amount = parseInt(inMatch[1], 10);
    const unit = inMatch[2];
    let ms = amount * 60 * 1000;
    if (unit.startsWith('hour')) ms *= 60;
    if (unit.startsWith('day')) ms *= 60 * 24;

    const task = message.replace(/remind me (to )? /i, '')
                        .replace(/in \d+\s*(minute|minutes|hour|hours|day|days)/i, '')
                        .trim();

    return {
      text: task || 'something',
      at: Date.now() + ms
    };
  }

  return null;
}


