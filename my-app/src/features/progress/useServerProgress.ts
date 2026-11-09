import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useAppStore } from '../../store';
import { env } from '../../config/env';
import { apiClient } from '../../services/apiClient';
import type { Language, QuizResult } from '../../types';

interface CloudProgress {
  language: Language;
  words: {
    word_id: number;
    learned: boolean;
    favorite: boolean;
    updated_at: string;
  }[];
}
interface CloudQuiz {
  language: Language;
  score: number;
  total: number;
  taken_at: string;
}

export function useServerProgress() {
  const { user } = useAuth();
  const language = useAppStore((s) => s.language);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!env.apiUrl || !user) {
      setError('');
      useAppStore.setState({ serverLoading: false });
      useAppStore.getState().reload();
      return;
    }
    let disposed = false;
    let unsubscribe = () => {};
    let queue = Promise.resolve();
    const headers = { Authorization: 'Bearer ' + user.access_token };
    useAppStore.setState({
      serverLoading: true,
      learned: [],
      favorites: [],
      history: [],
      daily: {},
    });
    setError('');
    Promise.all([
      apiClient<CloudProgress>(
        env.apiUrl + '/api/progress/me?language=' + language,
        { headers },
      ),
      apiClient<CloudQuiz[]>(env.apiUrl + '/api/progress/me/quiz-scores', {
        headers,
      }),
    ])
      .then(([progress, quizzes]) => {
        if (disposed) return;
        const history: QuizResult[] = quizzes.map((q) => ({
          date: q.taken_at,
          language: q.language,
          score: q.score,
          total: q.total,
        }));
        const daily: Record<string, number> = {};
        for (const word of progress.words.filter((w) => w.learned)) {
          const key = new Date(word.updated_at).toLocaleDateString('en-CA');
          daily[key] = (daily[key] || 0) + 1;
        }
        useAppStore.setState({
          serverLoading: false,
          learned: progress.words
            .filter((w) => w.learned)
            .map((w) => w.word_id),
          favorites: progress.words
            .filter((w) => w.favorite)
            .map((w) => w.word_id),
          history,
          daily,
        });
        const send = (url: string, method: string, body: unknown) => {
          queue = queue.then(async () => {
            if (disposed) return;
            try {
              await apiClient(url, {
                method,
                body: JSON.stringify(body),
                headers,
              });
              if (!disposed) setError('');
            } catch (e) {
              if (!disposed)
                setError(
                  e instanceof Error ? e.message : 'Chưa thể đồng bộ tiến độ',
                );
            }
          });
        };
        unsubscribe = useAppStore.subscribe((state, previous) => {
          if (state.language !== language) return;
          const ids = new Set([
            ...state.learned,
            ...previous.learned,
            ...state.favorites,
            ...previous.favorites,
          ]);
          for (const id of ids) {
            const learned = state.learned.includes(id),
              favorite = state.favorites.includes(id);
            if (
              learned !== previous.learned.includes(id) ||
              favorite !== previous.favorites.includes(id)
            )
              send(
                env.apiUrl +
                  '/api/progress/me/vocabulary/' +
                  id +
                  '?language=' +
                  language,
                'PUT',
                { learned, favorite },
              );
          }
          if (
            state.history !== previous.history &&
            state.history[0] &&
            state.history[0] !== previous.history[0]
          ) {
            const item = state.history[0];
            send(env.apiUrl + '/api/progress/me/quiz-scores', 'POST', {
              language: item.language,
              score: item.score,
              total: item.total,
            });
          }
        });
      })
      .catch((e) => {
        if (!disposed) {
          useAppStore.setState({ serverLoading: false });
          setError(e instanceof Error ? e.message : 'Chưa thể tải tiến độ');
        }
      });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [user, language]);
  return error;
}
