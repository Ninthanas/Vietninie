import { useParams, Link } from 'react-router-dom';
import { Volume2, ArrowLeft } from 'lucide-react';
import { useVocabulary } from '../features/vocabulary';
import { useAppStore } from '../store';
import { safeHtml, toTraditional } from '../utils/text';
import { speak } from '../utils/speech';
import { Button } from '../components/ui/Button';
export default function WordDetailPage() {
  const { id } = useParams();
  const { words, loading, error } = useVocabulary();
  const { language, toggleLearned, learned } = useAppStore();
  const word = words.find((w) => String(w.id) === id);
  if (loading) return <p>Đang tải từ vựng…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!word)
    return (
      <p>
        Không tìm thấy từ vựng. <Link to="/vocabulary">Về kho từ</Link>
      </p>
    );
  return (
    <>
      <Link className="text-button" to="/vocabulary">
        <ArrowLeft size={18} /> Kho từ vựng
      </Link>
      <article className="card detail-card">
        <span className="badge">{word.level}</span>
        <h1>{word.word}</h1>
        {language === 'zh' && (
          <p className="muted">Phồn thể: {toTraditional(word.word)}</p>
        )}
        <p className="pinyin">{word.pinyin || word.pronunciation_guide}</p>
        <h2>{word.meaning_vi || word.meaning_zh}</h2>
        <div className="row">
          <Button onClick={() => speak(word.word, language)}>
            <Volume2 size={18} /> Phát âm
          </Button>
          <Button variant="secondary" onClick={() => toggleLearned(word.id)}>
            {learned.includes(word.id) ? 'Đã học ✓' : 'Đánh dấu đã học'}
          </Button>
        </div>
        <hr />
        <h3>Trong một câu chuyện</h3>
        <p className="example-large">
          {language === 'zh' ? word.example_zh : word.example_vi}
        </p>
        <p className="pinyin">{word.example_pinyin}</p>
        <p>{language === 'zh' ? word.example_vi : word.example_zh}</p>
        <Button
          variant="ghost"
          onClick={() =>
            speak(
              language === 'zh' ? word.example_zh : word.example_vi,
              language,
            )
          }
        >
          <Volume2 size={18} /> Nghe câu ví dụ
        </Button>
        {word.usage_note && (
          <div
            className="usage-note"
            dangerouslySetInnerHTML={{ __html: safeHtml(word.usage_note) }}
          />
        )}
      </article>
    </>
  );
}
