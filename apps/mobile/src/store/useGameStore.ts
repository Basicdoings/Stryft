import { create } from 'zustand';

interface CheckIn {
  weight: number;
  waist: number | null;
  chest: number | null;
  hips: number | null;
  arms: number | null;
  bodyFat: number | null;
  hasPhoto: boolean;
  mood: string;
  note: string;
}

interface GameState {
  xp: number;
  sweatCoins: number;
  streak: number;
  workoutsCompleted: number;
  todaysMissionComplete: boolean;
  completedMeals: string[];
  mealSubstitutions: Record<string, string>;
  checkedShoppingItems: string[];
  latestCheckIn: CheckIn | null;
  checkInsCompleted: number;
  ownedCosmetics: string[];
  equippedCosmetic: string | null;
  claimedRewards: string[];
  completeMission: () => void;
  toggleMeal: (mealId: string) => void;
  setMealSubstitution: (mealId: string, substitution: string) => void;
  toggleShoppingItem: (item: string) => void;
  submitCheckIn: (checkIn: CheckIn) => void;
  buyCosmetic: (id: string, price: number) => void;
  equipCosmetic: (id: string | null) => void;
  claimReward: (id: string, coins: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  xp: 80,
  sweatCoins: 30,
  streak: 2,
  workoutsCompleted: 0,
  todaysMissionComplete: false,
  completedMeals: [],
  mealSubstitutions: {},
  checkedShoppingItems: [],
  latestCheckIn: null,
  checkInsCompleted: 0,
  ownedCosmetics: ['starter-band'],
  equippedCosmetic: 'starter-band',
  claimedRewards: [],
  completeMission: () =>
    set((state) => {
      if (state.todaysMissionComplete) return state;
      return {
        xp: state.xp + 120,
        sweatCoins: state.sweatCoins + 25,
        streak: state.streak + 1,
        workoutsCompleted: state.workoutsCompleted + 1,
        todaysMissionComplete: true,
      };
    }),
  toggleMeal: (mealId) =>
    set((state) => ({
      completedMeals: state.completedMeals.includes(mealId)
        ? state.completedMeals.filter((id) => id !== mealId)
        : [...state.completedMeals, mealId],
    })),
  setMealSubstitution: (mealId, substitution) =>
    set((state) => ({ mealSubstitutions: { ...state.mealSubstitutions, [mealId]: substitution } })),
  toggleShoppingItem: (item) =>
    set((state) => ({
      checkedShoppingItems: state.checkedShoppingItems.includes(item)
        ? state.checkedShoppingItems.filter((value) => value !== item)
        : [...state.checkedShoppingItems, item],
    })),
  submitCheckIn: (latestCheckIn) =>
    set((state) => ({
      latestCheckIn,
      checkInsCompleted: state.checkInsCompleted + 1,
      streak: state.latestCheckIn ? state.streak : state.streak + 1,
      xp: state.latestCheckIn ? state.xp : state.xp + 60,
      sweatCoins: state.latestCheckIn ? state.sweatCoins : state.sweatCoins + 10,
    })),
  buyCosmetic: (id, price) =>
    set((state) => state.ownedCosmetics.includes(id) || state.sweatCoins < price ? state : {
      sweatCoins: state.sweatCoins - price,
      ownedCosmetics: [...state.ownedCosmetics, id],
    }),
  equipCosmetic: (equippedCosmetic) => set({ equippedCosmetic }),
  claimReward: (id, coins) =>
    set((state) => state.claimedRewards.includes(id) ? state : {
      sweatCoins: state.sweatCoins + coins,
      claimedRewards: [...state.claimedRewards, id],
    }),
}));
