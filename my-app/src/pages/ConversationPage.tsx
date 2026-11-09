import { useEffect, useState } from 'react';
import { getConversations } from '../features/vocabulary/services/vocabularyApi';
import { useAppStore } from '../store';
import type { Conversation } from '../types';
import { speak } from '../utils/speech';
import { Button } from '../components/ui/Button';
export default function ConversationPage() {
  const language = useAppStore((s) => s.language);
  const [items, setItems] = useState<Conversation[]>([]),
    [selected, setSelected] = useState(0),
    [hide, setHide] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getConversations()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
      window.speechSynthesis?.cancel();
    };
  }, []);
  const item = items[selected];
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">NGÔN NGỮ TRONG NHỮNG CÂU CHUYỆN</p>
        <h1>Hội thoại thực tế</h1>
        <p>Nghe từng câu, hiểu ngữ cảnh và thử phản xạ.</p>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="card toolbar">
        <select
          aria-label="Chọn hội thoại"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {items.map((x, i) => (
            <option value={i} key={x.id}>
              {x.title_vi}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => setHide(!hide)}>
          {hide ? 'Hiện bản dịch' : 'Ẩn bản dịch để tự luyện'}
        </Button>
      </div>
      {item && (
        <article className="card conversation">
          <span className="badge">{item.level}</span>
          <h2>{item.title_vi}</h2>
          <p className="muted">{item.scenario_vi}</p>
          {item.lines.map((line, i) => (
            <div
              className={'dialogue ' + (line.speaker === 'B' ? 'reply' : '')}
              key={i}
            >
              <span className="avatar">{line.name.slice(0, 1)}</span>
              <div>
                <strong>{line.name}</strong>
                <p>{language === 'zh' ? line.zh : line.vi}</p>
                {language === 'zh' && <small>{line.pinyin}</small>}
                {!hide && (
                  <p className="muted">
                    {language === 'zh' ? line.vi : line.zh}
                  </p>
                )}
                <button
                  className="text-button"
                  onClick={() =>
                    speak(language === 'zh' ? line.zh : line.vi, language)
                  }
                >
                  Nghe câu này
                </button>
              </div>
            </div>
          ))}
        </article>
      )}
    </>
  );
}
