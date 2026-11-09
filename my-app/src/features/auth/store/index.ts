import { create } from 'zustand';
import type { User } from '../types';
function savedUser(): User | null {
  try {
    const user = JSON.parse(
      sessionStorage.getItem('vietninie_react_user') || 'null',
    );
    if (user?.expires_at && Date.parse(user.expires_at) <= Date.now())
      return null;
    return user;
  } catch {
    return null;
  }
}
export const useAuthStore = create<{
  user: User | null;
  setUser: (user: User | null) => void;
}>((set) => ({
  user: savedUser(),
  setUser: (user) => {
    try {
      if (user)
        sessionStorage.setItem('vietninie_react_user', JSON.stringify(user));
      else sessionStorage.removeItem('vietninie_react_user');
      localStorage.removeItem('vietninie_react_user');
    } catch {
      /* Memory state still works when storage is unavailable. */
    }
    set({ user });
  },
}));
