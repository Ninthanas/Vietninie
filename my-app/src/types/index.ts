export type Language = 'zh' | 'vi';
export interface Word {
  id: number;
  word: string;
  pinyin?: string;
  pronunciation_guide?: string;
  meaning_vi?: string;
  meaning_zh?: string;
  level: string;
  cefr?: string;
  topic: string;
  topic_key?: string;
  topic_label_vi: string;
  topic_label_zh: string;
  example_zh: string;
  example_vi: string;
  example_pinyin?: string;
  usage_note?: string;
  pronunciation?: string;
}
export interface Grammar {
  id: number;
  title: string;
  pattern: string;
  level: string;
  explanation: string;
  examples: { zh: string; vi: string; pinyin?: string }[];
  quiz?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}
export interface Conversation {
  id: number;
  title_vi: string;
  title_zh: string;
  level: string;
  scenario_vi: string;
  lines: {
    speaker: string;
    name: string;
    zh: string;
    vi: string;
    pinyin: string;
  }[];
}
export interface QuizResult {
  date: string;
  score: number;
  total: number;
  language: Language;
}
