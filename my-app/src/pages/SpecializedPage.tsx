import { useEffect, useState } from 'react';
import { loadData } from '../features/vocabulary/services/vocabularyApi';
import { Button } from '../components/ui/Button';
import { speak } from '../utils/speech';
interface Entry {
  zh: string;
  zh_tw?: string;
  pinyin: string;
  vi: string;
  category: string;
  explanation: string;
  example: { zh: string; pinyin: string; vi: string };
}
interface Specialized {
  categories: {
    id: string;
    icon: string;
    name_vi: string;
    description: string;
  }[];
  words: Entry[];
  interview_scenarios: {
    id: string;
    topic_vi: string;
    question_zh: string;
    question_vi: string;
    answer_zh: string;
    answer_pinyin: string;
    answer_vi: string;
  }[];
  pm_action_phrases: {
    zh: string;
    pinyin: string;
    vi: string;
    context_vi: string;
  }[];
  workplace_tools: {
    tool: string;
    zh: string;
    pinyin: string;
    usage_vi: string;
  }[];
  game_core_distinction: {
    title_vi: string;
    roles: { zh: string; pinyin: string; role_vi: string; desc_vi: string }[];
  };
}
export default function SpecializedPage() {
  const [data, setData] = useState<Specialized | null>(null),
    [category, setCategory] = useState(''),
    [mode, setMode] = useState('words'),
    [search, setSearch] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadData<Specialized>('specialized-vocabulary.json')
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">TỪ LỚP HỌC ĐẾN CÔNG VIỆC</p>
        <h1>Tiếng Trung chuyên ngành</h1>
        <p>Thuật ngữ, kịch bản phỏng vấn và câu nói dùng ngay.</p>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="card toolbar">
        <input
          placeholder="Tìm thuật ngữ…"
          aria-label="Tìm thuật ngữ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Chuyên ngành"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Tất cả chuyên ngành</option>
          {data?.categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.icon} {c.name_vi}
            </option>
          ))}
        </select>
        <select
          aria-label="Nội dung chuyên ngành"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="words">Thuật ngữ</option>
          <option value="interview">Phỏng vấn</option>
          <option value="guide">Cẩm nang công việc</option>
        </select>
      </div>
      {mode === 'words' && (
        <div className="word-grid">
          {data?.words
            .filter(
              (w) =>
                (!category || w.category === category) &&
                (w.zh + ' ' + w.vi + ' ' + w.pinyin)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((w) => (
              <article className="card word-card" key={w.zh}>
                <span className="badge">
                  {data.categories.find((c) => c.id === w.category)?.icon}{' '}
                  Chuyên ngành
                </span>
                <h2 className="word-title">{w.zh}</h2>
                <p className="pinyin">
                  {w.pinyin} · {w.zh_tw}
                </p>
                <h3>{w.vi}</h3>
                <p>{w.explanation}</p>
                <details>
                  <summary>Xem ví dụ</summary>
                  <p>{w.example.zh}</p>
                  <small>{w.example.pinyin}</small>
                  <p>{w.example.vi}</p>
                </details>
                <Button variant="ghost" onClick={() => speak(w.zh, 'zh')}>
                  Nghe phát âm
                </Button>
              </article>
            ))}
        </div>
      )}
      {mode === 'interview' && (
        <div className="stack">
          {data?.interview_scenarios.map((x) => (
            <article className="card" key={x.id}>
              <h2>{x.topic_vi}</h2>
              <p>{x.question_zh}</p>
              <p className="muted">{x.question_vi}</p>
              <div className="example-block">
                <p>{x.answer_zh}</p>
                <small>{x.answer_pinyin}</small>
                <p>{x.answer_vi}</p>
              </div>
              <Button onClick={() => speak(x.answer_zh, 'zh')}>
                Nghe câu trả lời mẫu
              </Button>
            </article>
          ))}
        </div>
      )}
      {mode === 'guide' && (
        <div className="stack">
          <article className="card">
            <h2>{data?.game_core_distinction.title_vi}</h2>
            {data?.game_core_distinction.roles.map((x) => (
              <div className="example-block" key={x.zh}>
                <h3>
                  {x.zh} — {x.role_vi}
                </h3>
                <small>{x.pinyin}</small>
                <p>{x.desc_vi}</p>
              </div>
            ))}
          </article>
          <article className="card">
            <h2>Cụm từ PM dùng ngay</h2>
            {data?.pm_action_phrases.map((x) => (
              <div className="example-block" key={x.zh}>
                <h3>
                  {x.zh} — {x.vi}
                </h3>
                <small>{x.pinyin}</small>
                <p>{x.context_vi}</p>
                <button
                  className="text-button"
                  onClick={() => speak(x.zh, 'zh')}
                >
                  Nghe phát âm
                </button>
              </div>
            ))}
          </article>
          <article className="card">
            <h2>Công cụ làm việc</h2>
            {data?.workplace_tools.map((x) => (
              <div className="example-block" key={x.tool}>
                <h3>
                  {x.tool} · {x.zh}
                </h3>
                <small>{x.pinyin}</small>
                <p>{x.usage_vi}</p>
              </div>
            ))}
          </article>
        </div>
      )}
    </>
  );
}
