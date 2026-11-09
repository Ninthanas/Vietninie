import { useEffect, useState } from 'react';
import { getVocabulary } from '../services/vocabularyApi';
import { useAppStore } from '../../../store';
import type { Word } from '../../../types';
export function useVocabulary() {
  const language = useAppStore((s) => s.language);
  const [words, setWords] = useState<Word[]>([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getVocabulary(language)
      .then((data) => {
        if (active) setWords(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language]);
  return { words, error, loading };
}
