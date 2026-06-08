import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useGameStore } from '@/store/useGameStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COSMETICS } from '@/constants/gameContent';

export default function AvatarScreen() {
  const router = useRouter();
  const game = useGameStore();
  const { sleepQuality } = useOnboardingStore();
  const level = Math.max(1, Math.floor(game.xp / 250) + 1);
  const progress = (game.xp % 250) / 250;
  const equipped = COSMETICS.find((item) => item.id === game.equippedCosmetic);
  const avatar = getAvatarState(game.todaysMissionComplete, game.completedMeals.length, game.latestCheckIn?.mood);
  const stats = {
    Strength: Math.min(99, 10 + game.workoutsCompleted * 5 + (game.todaysMissionComplete ? 3 : 0)),
    Endurance: Math.min(99, 10 + game.streak * 2),
    Wisdom: Math.min(99, 10 + game.completedMeals.length * 3 + game.checkInsCompleted * 4),
    Constitution: Math.min(99, 10 + (sleepQuality === 'Excellent' ? 12 : sleepQuality === 'Good' ? 8 : 4) + game.streak),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">AVATAR HUB</Typography><TouchableOpacity style={styles.back} onPress={() => router.push('/cosmetics')}><Ionicons name="shirt-outline" size={20} color={Colors.dark.text} /></TouchableOpacity></View>

        <View style={styles.avatarCard}>
          <View style={[styles.aura, { borderColor: equipped?.color ?? Colors.dark.primary, backgroundColor: `${equipped?.color ?? Colors.dark.primary}18` }]}>
            <Ionicons name={avatar.icon} size={132} color={equipped?.color ?? Colors.dark.primary} />
            {equipped && <View style={[styles.equipped, { backgroundColor: equipped.color }]}><Ionicons name={equipped.icon} size={18} color={Colors.dark.text} /></View>}
          </View>
          <Typography variant="caption" color={avatar.color} weight="700">{avatar.label.toUpperCase()}</Typography>
          <Typography variant="h2" align="center" style={styles.avatarTitle}>{avatar.title}</Typography>
          <Typography variant="caption" align="center">{avatar.message}</Typography>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelHeader}><View><Typography variant="caption">CURRENT LEVEL</Typography><Typography variant="h2" style={styles.levelValue}>Level {level}</Typography></View><View style={styles.coin}><Ionicons name="disc" size={18} color={Colors.dark.primary} /><Typography variant="body" weight="700" style={styles.coinText}>{game.sweatCoins}</Typography></View></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
          <Typography variant="caption" style={styles.xpText}>{game.xp % 250} / 250 XP to next level</Typography>
        </View>

        <View style={styles.section}><Typography variant="h3">RPG attributes</Typography><Typography variant="caption" color={Colors.dark.primary} weight="700">Live stats</Typography></View>
        <View style={styles.stats}>{Object.entries(stats).map(([name, value]) => <Stat key={name} name={name} value={value} />)}</View>

        <View style={styles.section}><Typography variant="h3">Equipped cosmetic</Typography></View>
        <TouchableOpacity style={styles.cosmeticCard} onPress={() => router.push('/cosmetics')}>
          <View style={[styles.cosmeticIcon, { backgroundColor: `${equipped?.color ?? Colors.dark.primary}22` }]}><Ionicons name={equipped?.icon ?? 'body-outline'} size={27} color={equipped?.color ?? Colors.dark.primary} /></View>
          <View style={styles.cosmeticText}><Typography variant="body" weight="700">{equipped?.name ?? 'No cosmetic equipped'}</Typography><Typography variant="caption" style={styles.caption}>Tap to browse cosmetics</Typography></View>
          <Ionicons name="chevron-forward" size={21} color={Colors.dark.textSecondary} />
        </TouchableOpacity>
        <CustomButton title="View Level Rewards" onPress={() => router.push('/rewards')} showArrow />
      </ScrollView>
    </SafeAreaView>
  );
}

function getAvatarState(workoutDone: boolean, meals: number, mood?: string) {
  if (workoutDone && meals >= 3) return { label: 'Thriving', title: 'Your avatar is glowing', message: 'Training and nutrition are aligned today.', icon: 'body' as const, color: '#42D392' };
  if (mood === 'Tired') return { label: 'Recovering', title: 'Recovery mode active', message: 'A lighter mission and quality sleep will help.', icon: 'bed-outline' as const, color: '#57A4FF' };
  if (workoutDone) return { label: 'Energized', title: 'Mission energy unlocked', message: 'Log your meals to strengthen today’s glow.', icon: 'body' as const, color: Colors.dark.primary };
  return { label: 'Ready', title: 'Your avatar is waiting', message: 'Complete today’s mission to evolve its state.', icon: 'body-outline' as const, color: Colors.dark.textSecondary };
}

function Stat({ name, value }: { name: string; value: number }) {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = { Strength: 'barbell', Endurance: 'heart', Wisdom: 'book', Constitution: 'shield' };
  return <View style={styles.stat}><View style={styles.statHeader}><Ionicons name={icons[name]} size={20} color={Colors.dark.primary} /><Typography variant="body" weight="700">{value}</Typography></View><Typography variant="caption" style={styles.statName}>{name}</Typography><View style={styles.statTrack}><View style={[styles.statFill, { width: `${value}%` }]} /></View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  avatarCard: { alignItems: 'center', padding: 22, borderRadius: 22, backgroundColor: Colors.dark.backgroundElement },
  aura: { width: 220, height: 220, borderRadius: 110, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  equipped: { position: 'absolute', right: 20, bottom: 20, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarTitle: { marginTop: 7 },
  levelCard: { padding: 18, borderRadius: 18, marginTop: 16, backgroundColor: Colors.dark.backgroundElement },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelValue: { marginTop: 5 },
  coin: { flexDirection: 'row', padding: 10, borderRadius: 14, backgroundColor: Colors.dark.backgroundSelected },
  coinText: { marginLeft: 6 },
  track: { height: 7, borderRadius: 4, marginTop: 12, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.dark.primary },
  xpText: { marginTop: 8 },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26, marginBottom: 10 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', padding: 15, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  statName: { marginTop: 14 },
  statTrack: { height: 5, borderRadius: 3, marginTop: 8, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden' },
  statFill: { height: '100%', backgroundColor: Colors.dark.primary },
  cosmeticCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  cosmeticIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cosmeticText: { flex: 1, marginLeft: 13 },
  caption: { marginTop: 5 },
});
