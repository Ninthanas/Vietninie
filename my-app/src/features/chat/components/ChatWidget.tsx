import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { askGemini } from '../services/chatApi';
import type { Message } from '../types';
export function ChatWidget() {
  const [open, setOpen] = useState(false),
    [messages, setMessages] = useState<Message[]>([]),
    [question, setQuestion] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const input = useRef<HTMLTextAreaElement>(null),
    log = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    controller = useRef<AbortController | null>(null);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    log.current?.scrollTo(0, log.current.scrollHeight);
  }, [messages, busy, error]);
  useEffect(() => () => controller.current?.abort(), []);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || busy) return;
    const next: Message[] = [
      ...messages,
      { role: 'user', content: question.trim() },
    ];
    setMessages(next);
    setQuestion('');
    setError('');
    setBusy(true);
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 120000);
    try {
      const { reply } = await askGemini(next.slice(-11), request.signal);
      if (!reply?.trim())
        throw new Error('Gemini chưa trả lời. Vui lòng thử lại.');
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa kết nối được Gemini');
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }
  return (
    <aside
      className="chat-widget"
      onKeyDown={(e) => {
        if (e.key === 'Escape') close();
      }}
    >
      {open && (
        <section
          id="gemini-panel"
          className="chat-panel"
          aria-label="Trợ lý Gemini"
        >
          <header className="row spread">
            <span className="row">
              <Sparkles size={20} /> Trợ lý Vietninie
            </span>
            <button
              className="icon-button"
              onClick={close}
              aria-label="Đóng chat"
            >
              <X size={20} />
            </button>
          </header>
          <div
            className="chat-messages"
            ref={log}
            role="log"
            aria-live="polite"
          >
            <p className="chat-bubble assistant">
              Chào bạn! Hôm nay mình cùng học gì? Mình có thể giải thích từ
              vựng, ngữ pháp và luyện hội thoại cùng bạn.
            </p>
            {messages.map((m, i) => (
              <p key={i} className={'chat-bubble ' + m.role}>
                {m.content}
              </p>
            ))}
            {busy && (
              <p className="muted">
                Đang hỏi Gemini… Máy chủ có thể cần một phút để khởi động.
              </p>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </div>
          <p className="chat-disclaimer">
            AI có thể mắc lỗi. Câu hỏi được gửi đến Gemini. Tránh gửi thông tin
            nhạy cảm.
          </p>
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="gemini-question">
              Câu hỏi cho Gemini
            </label>
            <textarea
              ref={input}
              id="gemini-question"
              value={question}
              maxLength={2000}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Hỏi điều bạn đang thắc mắc…"
              required
            />
            <button
              className="icon-button"
              disabled={busy || !question.trim()}
              aria-label="Gửi câu hỏi"
            >
              <Send size={20} />
            </button>
          </form>
        </section>
      )}
      <button
        className="chat-fab"
        ref={trigger}
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
        aria-expanded={open}
        aria-controls="gemini-panel"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X /> : <MessageCircle />}
        <span>Hỏi AI</span>
      </button>
    </aside>
  );
}
