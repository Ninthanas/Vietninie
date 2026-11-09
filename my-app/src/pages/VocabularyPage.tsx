import { useMemo, useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Volume2,
} from 'lucide-react';
import { useVocabulary, WordCard } from '../features/vocabulary';
import { useDebounce } from '../hooks/useDebounce';
import { useAppStore } from '../store';
import { normalize } from '../utils/text';
import { speak } from '../utils/speech';
import { Button } from '../components/ui/Button';
export default function VocabularyPage() {
  const { words, loading, error } = useVocabulary();
  const { favorites, learned, language, toggleLearned } = useAppStore();
  const [query, setQuery] = useState(''),
    [level, setLevel] = useState(''),
    [topic, setTopic] = useState(''),
    [filter, setFilter] = useState('all'),
    [page, setPage] = useState(0),
    [mode, setMode] = useState('list'),
    [flipped, setFlipped] = useState(false);
  const search = useDebounce(query);
  const filtered = useMemo(
    () =>
      words.filter(
        (w) =>
          (!level || w.level === level) &&
          (!topic || w.topic === topic) &&
          (filter !== 'favorites' || favorites.includes(w.id)) &&
          (filter !== 'unlearned' || !learned.includes(w.id)) &&
          normalize(
            w.word +
              ' ' +
              (w.meaning_vi || w.meaning_zh) +
              ' ' +
              (w.pinyin || ''),
          ).includes(normalize(search)),
      ),
    [words, level, topic, filter, favorites, learned, search],
  );
  useEffect(() => {
    setPage(0);
    setFlipped(false);
  }, [search, level, topic, filter, language, mode]);
  const count = mode === 'list' ? 12 : 1,
    total = Math.ceil(filtered.length / count),
    safePage = Math.min(page, Math.max(0, total - 1));
  const current = filtered[safePage];
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">TÍCH LŨY TỪNG NGÀY</p>
        <h1>Kho từ vựng</h1>
        <p>Học trong ngữ cảnh, ghi nhớ bằng trải nghiệm.</p>
      </div>
      <div className="card toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Tìm từ vựng"
            placeholder="Tìm chữ Hán, pinyin hoặc nghĩa…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Trình độ"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Tất cả trình độ</option>
          {[...new Set(words.map((w) => w.level))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Chủ đề"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">Tất cả chủ đề</option>
          {[
            ...new Map(words.map((w) => [w.topic, w.topic_label_vi])).entries(),
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Bộ lọc từ"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả từ</option>
          <option value="favorites">Đã lưu</option>
          <option value="unlearned">Chưa học</option>
        </select>
      </div>
      <div className="row spread section-heading">
        <p>{loading ? 'Đang tải dữ liệu…' : filtered.length + ' từ vựng'}</p>
        <div className="segmented">
          {['list', 'flashcard'].map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === 'list' ? 'Danh sách' : 'Flashcard'}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!loading && !filtered.length && (
        <div className="empty-state">
          Chưa tìm thấy từ phù hợp. Hãy thử từ khóa khác nhé.
        </div>
      )}
      {mode === 'list' ? (
        <div className="word-grid">
          {filtered.slice(safePage * count, (safePage + 1) * count).map((w) => (
            <WordCard key={w.id} word={w} />
          ))}
        </div>
      ) : (
        current && (
          <div className="flashcard-wrap">
            <button
              className="card flashcard"
              onClick={() => setFlipped(!flipped)}
            >
              <small>{flipped ? 'NGHĨA & VÍ DỤ' : 'BẤM ĐỂ LẬT THẺ'}</small>
              <h2>
                {flipped
                  ? current.meaning_vi || current.meaning_zh
                  : current.word}
              </h2>
              <p>
                {flipped
                  ? language === 'zh'
                    ? current.example_zh
                    : current.example_vi
                  : current.pinyin || current.pronunciation_guide}
              </p>
              <RotateCw size={20} />
            </button>
            <div className="row center">
              <Button
                variant="secondary"
                onClick={() => speak(current.word, language)}
              >
                <Volume2 size={18} /> Nghe
              </Button>
              <Button onClick={() => toggleLearned(current.id)}>
                {learned.includes(current.id) ? 'Đã nhớ ✓' : 'Đánh dấu đã nhớ'}
              </Button>
            </div>
          </div>
        )
      )}
      {total > 0 && (
        <div className="pagination">
          <Button
            variant="secondary"
            disabled={safePage === 0}
            onClick={() => {
              setPage(safePage - 1);
              setFlipped(false);
            }}
          >
            <ChevronLeft size={16} /> Trước
          </Button>
          <span>
            {safePage + 1} / {total}
          </span>
          <Button
            variant="secondary"
            disabled={safePage >= total - 1}
            onClick={() => {
              setPage(safePage + 1);
              setFlipped(false);
            }}
          >
            Sau <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </>
  );
}
