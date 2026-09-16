import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/lib/api';
import { useGameStore } from './gameStore';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setToken: (token: string, refreshToken: string) => void;
  setProfile: (profile: UserProfile) => void;
  logout: () => void;
  hasCompletedProfile: (profile: unknown) => boolean;
  syncGameBalance: (profile: UserProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      profile: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: (hydrated) => set({ hydrated }),

      setToken: (token, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ token, refreshToken, isAuthenticated: true });
      },

      setProfile: (profile) => {
        set({ profile });
        get().syncGameBalance(profile);
      },

      syncGameBalance: (profile) => {
        if (profile?.xp !== undefined && profile?.coins !== undefined) {
          const gameStore = useGameStore.getState();
          if (profile.xp > gameStore.xp || profile.coins > gameStore.coins) {
            useGameStore.setState({
              xp: profile.xp,
              coins: profile.coins,
            });
          }
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        useGameStore.getState().reset();
        set({ token: null, refreshToken: null, profile: null, isAuthenticated: false });
      },

      hasCompletedProfile: (profile) => {
        if (!profile || typeof profile !== 'object') return false;
        const value = profile as Record<string, unknown>;
        return Boolean(
          value.nickname ||
            value.firstName ||
            value.name ||
            value.grade ||
            value.avatarId,
        );
      },
    }),
    {
      name: 'poolino-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.profile) {
            state.syncGameBalance(state.profile);
          }
        }
      },
    },
  ),
);
