export const COSMETICS = [
  { id: 'starter-band', name: 'Starter Headband', price: 0, icon: 'remove-outline' as const, color: '#FF6600' },
  { id: 'warrior-aura', name: 'Warrior Aura', price: 40, icon: 'flame-outline' as const, color: '#FF7A36' },
  { id: 'lagos-kit', name: 'Lagos Training Kit', price: 65, icon: 'shirt-outline' as const, color: '#42D392' },
  { id: 'champion-cape', name: 'Champion Cape', price: 120, icon: 'shield-outline' as const, color: '#57A4FF' },
] as const;

export const REWARD_TRACK = [
  { id: 'level-1', level: 1, reward: 'Starter Headband', coins: 10 },
  { id: 'level-2', level: 2, reward: '25 Sweat Coins', coins: 25 },
  { id: 'level-3', level: 3, reward: 'Warrior Aura Discount', coins: 35 },
  { id: 'level-4', level: 4, reward: 'Rare Avatar Pose', coins: 50 },
] as const;
