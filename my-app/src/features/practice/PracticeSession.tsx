import { useState } from 'react';
import { Volume2, RotateCw } from 'lucide-react';
import { useVocabulary } from '../vocabulary';
import { useAppStore } from '../../store';
import type { Word } from '../../types';
import { speak } from '../../utils/speech';
import { Button } from '../../components/ui/Button';
interface Question {
  word: Word;
  options: Word[];
}
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function PracticeSession({
  listening = false,
}: {
  listening?: boolean;
}) {
  const { words, loading, error } = useVocabulary();
  const { language, saveQuiz } = useAppStore();
  const [level, setLevel] = useState(''),
    [questions, setQuestions] = useState<Question[]>([]),
    [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null),
    [score, setScore] = useState(0),
    [finished, setFinished] = useState(false);
  const pool = words.filter((w) => !level || w.level === level),
    current = questions[index];
  function start() {
    setQuestions(
      shuffle(pool)
        .slice(0, 10)
        .map((word) => ({
          word,
          options: shuffle([
            word,
            ...shuffle(
              pool.filter(
                (w) =>
                  w.id !== word.id &&
                  (w.meaning_vi || w.meaning_zh) !==
                    (word.meaning_vi || word.meaning_zh),
              ),
            ).slice(0, 3),
          ]),
        })),
    );
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }
  function reset() {
    setQuestions([]);
    setFinished(false);
    setIndex(0);
    setScore(0);
    setSelected(null);
  }
  function answer(id: number) {
    if (selected !== null) return;
    setSelected(id);
    if (id === current.word.id) setScore((s) => s + 1);
  }
  function next() {
    if (index === questions.length - 1) {
      saveQuiz(score, questions.length);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }
  if (loading) return <p>Đang chuẩn bị bài luyện…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (finished)
    return (
      <div className="card result-card">
        <span className="result-icon">✦</span>
        <h2>Thêm một bước tiến!</h2>
        <p className="result-score">
          {score}
          <small>/{questions.length}</small>
        </p>
        <p>Kết quả đã được lưu vào hành trình học của bạn.</p>
        <Button onClick={reset}>
          <RotateCw size={18} /> Luyện lại
        </Button>
      </div>
    );
  if (!current)
    return (
      <div className="card practice-intro">
        <span className="goal-icon">
          <Volume2 size={30} />
        </span>
        <h2>
          {listening
            ? 'Lắng nghe và chọn nghĩa đúng'
            : 'Bạn đã nhớ được bao nhiêu?'}
        </h2>
        <p>Mỗi lượt tối đa 10 câu. Câu hỏi và đáp án cùng trình độ đã chọn.</p>
        <label>
          Trình độ
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Tất cả trình độ</option>
            {[...new Set(words.map((w) => w.level))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <Button disabled={pool.length < 4} onClick={start}>
          Bắt đầu luyện tập
        </Button>
      </div>
    );
  return (
    <section className="card practice-card">
      <div className="row spread">
        <span>
          Câu {index + 1} / {questions.length}
        </span>
        <button className="text-button" onClick={reset}>
          Chọn lại
        </button>
      </div>
      <progress
        aria-label="Tiến độ bài luyện"
        max={questions.length}
        value={index}
      />
      <span className="badge">{current.word.level}</span>
      {listening ? (
        <button
          className="listen-orb"
          aria-label="Nghe từ cần đoán"
          onClick={() => speak(current.word.word, language)}
        >
          <Volume2 size={36} />
        </button>
      ) : (
        <>
          <h2 className="quiz-word">{current.word.word}</h2>
          <p className="pinyin">
            {current.word.pinyin || current.word.pronunciation_guide}
          </p>
        </>
      )}
      <p>
        {listening
          ? 'Bấm nút loa, lắng nghe và chọn nghĩa phù hợp.'
          : 'Chọn nghĩa đúng của từ này.'}
      </p>
      <div className="quiz-options">
        {current.options.map((option) => (
          <button
            key={option.id}
            disabled={selected !== null}
            className={
              selected !== null
                ? option.id === current.word.id
                  ? 'correct'
                  : selected === option.id
                    ? 'incorrect'
                    : ''
                : ''
            }
            onClick={() => answer(option.id)}
          >
            {option.meaning_vi || option.meaning_zh}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="answer-feedback" role="status">
          <strong>
            {selected === current.word.id
              ? 'Chính xác!'
              : 'Mình cùng ghi nhớ lại nhé.'}
          </strong>
          <p>
            {current.word.word} —{' '}
            {current.word.meaning_vi || current.word.meaning_zh}
          </p>
          <Button onClick={next}>
            {index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
          </Button>
        </div>
      )}
    </section>
  );
}
