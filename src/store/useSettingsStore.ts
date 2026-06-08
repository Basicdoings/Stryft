import { create } from 'zustand';

interface SettingsState {
  notifications: {
    workouts: boolean;
    meals: boolean;
    checkIns: boolean;
    motivation: boolean;
  };
  quietHours: boolean;
  analytics: boolean;
  personalizedAI: boolean;
  profileVisibility: 'Private' | 'Friends' | 'Public';
  exported: boolean;
  toggleNotification: (key: keyof SettingsState['notifications']) => void;
  toggleQuietHours: () => void;
  toggleAnalytics: () => void;
  togglePersonalizedAI: () => void;
  setProfileVisibility: (value: SettingsState['profileVisibility']) => void;
  markExported: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notifications: { workouts: true, meals: false, checkIns: true, motivation: true },
  quietHours: true,
  analytics: true,
  personalizedAI: true,
  profileVisibility: 'Private',
  exported: false,
  toggleNotification: (key) => set((state) => ({ notifications: { ...state.notifications, [key]: !state.notifications[key] } })),
  toggleQuietHours: () => set((state) => ({ quietHours: !state.quietHours })),
  toggleAnalytics: () => set((state) => ({ analytics: !state.analytics })),
  togglePersonalizedAI: () => set((state) => ({ personalizedAI: !state.personalizedAI })),
  setProfileVisibility: (profileVisibility) => set({ profileVisibility }),
  markExported: () => set({ exported: true }),
}));
