import { create } from 'zustand';
import type { Language, QuizResult } from '../types';
import { readStorage, writeStorage } from '../hooks/useLocalStorage';
interface State {
  language: Language;
  learned: number[];
  favorites: number[];
  history: QuizResult[];
  daily: Record<string, number>;
  setLanguage: (value: Language) => void;
  toggleLearned: (id: number) => void;
  toggleFavorite: (id: number) => void;
  saveQuiz: (score: number, total: number) => void;
  reload: () => void;
}
function ids(key: string) {
  return readStorage<unknown[]>(key, []).filter(
    (x): x is number => typeof x === 'number',
  );
}
function initialLanguage(): Language {
  try {
    return localStorage.getItem('sentruc_native_lang') === 'zh' ? 'vi' : 'zh';
  } catch {
    return 'zh';
  }
}
const initial = initialLanguage();
export const useAppStore = create<State>((set, get) => ({
  language: initial,
  learned: ids('sentruc_learned_' + initial),
  favorites: ids('sentruc_favorites_' + initial),
  history: readStorage<QuizResult[]>('vietninie_react_quiz_history', []),
  daily: readStorage('sentruc_daily_log', {}),
  setLanguage: (language) => {
    try {
      localStorage.setItem(
        'sentruc_native_lang',
        language === 'zh' ? 'vi' : 'zh',
      );
    } catch {
      /* Optional persistence. */
    }
    set({
      language,
      learned: ids('sentruc_learned_' + language),
      favorites: ids('sentruc_favorites_' + language),
    });
  },
  toggleLearned: (id) => {
    const state = get(),
      already = state.learned.includes(id),
      learned = already
        ? state.learned.filter((x) => x !== id)
        : [...state.learned, id];
    writeStorage('sentruc_learned_' + state.language, learned);
    const day = new Date().toLocaleDateString('en-CA');
    const daily = already
      ? state.daily
      : { ...state.daily, [day]: (state.daily[day] || 0) + 1 };
    writeStorage('sentruc_daily_log', daily);
    set({ learned, daily });
  },
  toggleFavorite: (id) => {
    const state = get(),
      favorites = state.favorites.includes(id)
        ? state.favorites.filter((x) => x !== id)
        : [...state.favorites, id];
    writeStorage('sentruc_favorites_' + state.language, favorites);
    set({ favorites });
  },
  saveQuiz: (score, total) => {
    const history = [
      {
        date: new Date().toISOString(),
        score,
        total,
        language: get().language,
      },
      ...get().history,
    ].slice(0, 50);
    writeStorage('vietninie_react_quiz_history', history);
    set({ history });
  },
  reload: () => {
    const { language } = get();
    set({
      learned: ids('sentruc_learned_' + language),
      favorites: ids('sentruc_favorites_' + language),
      daily: readStorage('sentruc_daily_log', {}),
      history: readStorage('vietninie_react_quiz_history', []),
    });
  },
}));
