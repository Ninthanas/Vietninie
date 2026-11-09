import { create } from 'zustand';
import { readStorage, writeStorage } from '../../../hooks/useLocalStorage';
import type { User } from '../types';
export const useAuthStore = create<{
  user: User | null;
  setUser: (user: User | null) => void;
}>((set) => ({
  user: readStorage<User | null>('vietninie_react_user', null),
  setUser: (user) => {
    writeStorage('vietninie_react_user', user);
    set({ user });
  },
}));
