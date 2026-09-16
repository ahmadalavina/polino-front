import { create } from 'zustand';

export interface GameBalance {
  xp: number;
  coins: number;
}

interface GameState {
  coins: number;
  xp: number;
  hearts: number;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  addHearts: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendXp: (amount: number) => boolean;
  setBalance: (balance: GameBalance) => void;
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
    //@ts-ignore
    set((state) => {
      if (state.coins >= amount) {
        return { coins: state.coins - amount };
      }
      return state;
    }),

  spendXp: (amount) =>
    //@ts-ignore
    set((state) => {
      if (state.xp >= amount) {
        return { xp: state.xp - amount };
      }
      return state;
    }),

  setBalance: (balance) =>
    set((state) => ({
      xp: balance.xp,
      coins: balance.coins,
    })),

  reset: () =>
    set({ coins: 0, xp: 0, hearts: 5 }),
}));
