import type { Language } from '../types';
export function speak(text: string, language: Language, rate = 0.9) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'zh' ? 'zh-CN' : 'vi-VN';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}
