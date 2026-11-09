(() => {
  const script = document.currentScript;
  const base = new URL('../', script.src);
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('css/chat.css', base); document.head.append(css);
  const root = document.createElement('div'); root.id = 'vn-chat';
  root.innerHTML = `<button class="chat-launch" aria-expanded="false" aria-controls="chat-panel">💬 Hỏi AI</button><section id="chat-panel" hidden aria-label="Trợ lý học tập"><header><strong>🌶️ Trợ lý Vietninie</strong><button type="button" class="chat-close" aria-label="Đóng">✕</button></header><div class="chat-log" role="log" aria-live="polite"></div><p class="chat-note">AI có thể trả lời chưa chính xác. Câu hỏi sẽ được gửi đến dịch vụ AI. Không gửi thông tin nhạy cảm.</p><form><label for="chat-question">Bạn muốn học gì?</label><textarea id="chat-question" maxlength="2000" rows="2" required placeholder="Giải thích cách dùng 了 và ví dụ…"></textarea><button type="submit">Gửi</button></form></section>`;
  document.body.append(root);
  const panel = root.querySelector('section'), launch = root.querySelector('.chat-launch'), input = root.querySelector('textarea'), log = root.querySelector('.chat-log'), submit = root.querySelector('[type=submit]');
  let history = [], busy = false;
  const add = (role, text) => { const el = document.createElement('p'); el.className = `chat-${role}`; el.textContent = text; log.append(el); log.scrollTop = log.scrollHeight; return el; };
  add('assistant', 'Xin chào! Mình giúp bạn học tiếng Trung, tiếng Việt, giải thích ngữ pháp và luyện hội thoại.');
  const toggle = (open) => { panel.hidden = !open; launch.setAttribute('aria-expanded', String(open)); (open ? input : launch).focus(); };
  launch.onclick = () => toggle(panel.hidden); root.querySelector('.chat-close').onclick = () => toggle(false);
  root.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  root.querySelector('form').onsubmit = async e => {
    e.preventDefault(); const content = input.value.trim(); if (!content || busy) return;
    busy = true; submit.disabled = true; add('user', content); input.value = '';
    const status = add('assistant', 'Đang trả lời…');
    const messages = [...history, {role:'user', content}].slice(-12);
    try {
      const configured = window.VIETNINIE_CHAT_URL;
      const local = ['localhost','127.0.0.1'].includes(location.hostname);
      if (!configured && !local) throw new Error('Chat AI chưa được kết nối. Bạn có thể tiếp tục dùng các bài học trên website.');
      const response = await fetch(configured || 'http://localhost:8787/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages}), signal:AbortSignal.timeout(45000)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa thể trả lời. Vui lòng thử lại.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('AI chưa trả về câu trả lời. Hãy thử lại.');
      status.textContent = data.reply; history = [...messages, {role:'assistant',content:data.reply}].slice(-10);
    } catch (err) { status.textContent = err.name === 'TimeoutError' ? 'Kết nối quá lâu. Hãy thử lại.' : err.message === 'Failed to fetch' ? 'Không kết nối được trợ lý. Hãy thử lại sau.' : err.message; }
    finally { busy = false; submit.disabled = false; log.scrollTop = log.scrollHeight; }
  };
})();
