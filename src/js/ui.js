// Aria — UI helpers

export function addMessage(role, text, routeLabel = null) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;

  const content = document.createElement('div');
  content.textContent = text;
  div.appendChild(content);

  if (routeLabel && role === 'aria') {
    const tag = document.createElement('div');
    tag.className = 'route-tag';
    tag.textContent = routeLabel;
    div.appendChild(tag);
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

export function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

export function clearInput() {
  const input = document.getElementById('user-input');
  if (input) {
    input.value = '';
    input.style.height = 'auto';
  }
}

export function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}


