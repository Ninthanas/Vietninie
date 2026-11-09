import { apiClient } from '../../../services/apiClient';
import { env } from '../../../config/env';
import type { Word, Language, Grammar, Conversation } from '../../../types';
const cache = new Map<string, Promise<unknown>>();
export function loadData<T>(filename: string): Promise<T> {
  if (!cache.has(filename)) {
    const request = apiClient<T>(
      env.apiUrl
        ? env.apiUrl + '/api/data/' + filename
        : import.meta.env.BASE_URL + 'data/' + filename,
    ).catch((error) => {
      cache.delete(filename);
      throw error;
    });
    cache.set(filename, request);
  }
  return cache.get(filename) as Promise<T>;
}
export const getVocabulary = (language: Language) =>
  loadData<Word[]>(
    language === 'zh'
      ? 'chinese-vocabulary.json'
      : 'vietnamese-vocabulary.json',
  );
export const getGrammar = (language: Language) =>
  loadData<Grammar[]>(
    language === 'zh' ? 'chinese-grammar.json' : 'vietnamese-grammar.json',
  );
export const getConversations = () =>
  loadData<Conversation[]>('conversations.json');
