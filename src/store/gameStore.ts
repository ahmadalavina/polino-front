import { create } from 'zustand';

interface GameState {
  coins: number;
  xp: number;
  hearts: number;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  addHearts: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendXp: (amount: number) => boolean;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  coins: 0,
  xp: 0,
  hearts: 5,

  addCoins: (amount) =>
    set((state) => ({ coins: state.coins + amount })),

  addXp: (amount) =>
    set((state) => ({ xp: state.xp + amount })),

  addHearts: (amount) =>
    set((state) => ({ hearts: state.hearts + amount })),

  spendCoins: (amount) =>
    set((state) => {
      if (state.coins >= amount) {
        return { coins: state.coins - amount };
      }
      return state;
    }),

  spendXp: (amount) =>
    set((state) => {
      if (state.xp >= amount) {
        return { xp: state.xp - amount };
      }
      return state;
    }),

  reset: () =>
    set({ coins: 0, xp: 0, hearts: 5 }),
}));
