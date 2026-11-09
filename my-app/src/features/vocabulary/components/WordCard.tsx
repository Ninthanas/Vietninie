import { Link } from 'react-router-dom';
import { Volume2, Star, Check } from 'lucide-react';
import { useAppStore } from '../../../store';
import { speak } from '../../../utils/speech';
import type { Word } from '../../../types';
export function WordCard({ word }: { word: Word }) {
  const { language, learned, favorites, toggleFavorite, toggleLearned } =
    useAppStore();
  return (
    <article className="card word-card">
      <div className="row spread">
        <span className="badge">{word.level}</span>
        <button
          className="icon-button"
          aria-label={'Lưu từ ' + word.word}
          aria-pressed={favorites.includes(word.id)}
          onClick={() => toggleFavorite(word.id)}
        >
          <Star
            size={18}
            fill={favorites.includes(word.id) ? 'currentColor' : 'none'}
          />
        </button>
      </div>
      <Link to={'/vocabulary/' + word.id} className="word-title">
        {word.word}
      </Link>
      <p className="pinyin">{word.pinyin || word.pronunciation_guide}</p>
      <h3>{word.meaning_vi || word.meaning_zh}</h3>
      <p className="word-example">
        {language === 'zh' ? word.example_zh : word.example_vi}
      </p>
      <div className="row spread">
        <button
          className="text-button"
          onClick={() => speak(word.word, language)}
        >
          <Volume2 size={17} /> Nghe phát âm
        </button>
        <button
          className={
            'icon-button ' + (learned.includes(word.id) ? 'learned' : '')
          }
          aria-label={'Đánh dấu đã học ' + word.word}
          aria-pressed={learned.includes(word.id)}
          onClick={() => toggleLearned(word.id)}
        >
          <Check size={18} />
        </button>
      </div>
    </article>
  );
}
