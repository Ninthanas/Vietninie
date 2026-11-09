import { useEffect, useState } from 'react';
import { getGrammar } from '../vocabulary/services/vocabularyApi';
import { useAppStore } from '../../store';
import type { Grammar } from '../../types';
import { speak } from '../../utils/speech';
import { Button } from '../../components/ui/Button';
export function GrammarList() {
  const language = useAppStore((s) => s.language);
  const [items, setItems] = useState<Grammar[]>([]),
    [level, setLevel] = useState(''),
    [error, setError] = useState(''),
    [answers, setAnswers] = useState<Record<number, number>>({});
  useEffect(() => {
    let active = true;
    setError('');
    setItems([]);
    setAnswers({});
    setLevel('');
    getGrammar(language)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [language]);
  return (
    <>
      <select
        aria-label="Lọc ngữ pháp theo cấp độ"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="">Tất cả trình độ</option>
        {[...new Set(items.map((g) => g.level))].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      {error && <p role="alert">{error}</p>}
      <div className="stack">
        {items
          .filter((g) => !level || g.level === level)
          .map((g) => (
            <details className="card grammar-card" key={g.id}>
              <summary>
                <span className="badge">{g.level}</span>
                <strong>{g.title}</strong>
                <span>＋</span>
              </summary>
              <div className="grammar-body">
                <p className="pattern">{g.pattern}</p>
                <p>{g.explanation}</p>
                {g.examples.map((ex, i) => (
                  <div className="example-block" key={i}>
                    <p>{language === 'zh' ? ex.zh : ex.vi}</p>
                    <small>{ex.pinyin}</small>
                    <p className="muted">{language === 'zh' ? ex.vi : ex.zh}</p>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        speak(language === 'zh' ? ex.zh : ex.vi, language)
                      }
                    >
                      Nghe ví dụ
                    </Button>
                  </div>
                ))}
                {g.quiz && (
                  <div>
                    <h3>{g.quiz.question}</h3>
                    <div className="quiz-options">
                      {g.quiz.options.map((option, i) => (
                        <button
                          key={option}
                          disabled={answers[g.id] !== undefined}
                          onClick={() => setAnswers({ ...answers, [g.id]: i })}
                          className={
                            answers[g.id] !== undefined &&
                            i === g.quiz?.answerIndex
                              ? 'correct'
                              : ''
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {answers[g.id] !== undefined && (
                      <p role="status">
                        {answers[g.id] === g.quiz.answerIndex
                          ? 'Chính xác! '
                          : 'Chưa đúng. '}
                        {g.quiz.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </details>
          ))}
      </div>
    </>
  );
}
