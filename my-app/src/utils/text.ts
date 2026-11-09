import DOMPurify from 'dompurify';
import traditional from '../assets/traditional.json';
export const toTraditional = (text: string) =>
  (traditional as Record<string, string>)[text] || text;
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();
export const safeHtml = (s: string) =>
  DOMPurify.sanitize(s, {
    ALLOWED_TAGS: ['strong', 'b', 'br', 'em'],
    ALLOWED_ATTR: [],
  });
