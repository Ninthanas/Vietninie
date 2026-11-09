export const env = {
  chatUrl:
    import.meta.env.VITE_CHAT_API_URL ||
    'https://vietninie-chat.onrender.com/api/chat',
  apiUrl: (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
};
