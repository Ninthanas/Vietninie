import { env } from '../config/env';
export const endpoints = {
  chat: env.apiUrl ? env.apiUrl + '/api/chat' : env.chatUrl,
  login: env.apiUrl + '/api/auth/login',
  register: env.apiUrl + '/api/auth/register',
};
