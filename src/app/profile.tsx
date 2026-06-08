import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useGameStore } from '@/store/useGameStore';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useOnboardingStore();
  const game = useGameStore();
  const level = Math.max(1, Math.floor(game.xp / 250) + 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">PROFILE</Typography><TouchableOpacity style={styles.back} onPress={() => router.push('/settings')}><Ionicons name="settings-outline" size={20} color={Colors.dark.text} /></TouchableOpacity></View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Ionicons name="person" size={42} color={Colors.dark.primary} /></View>
          <View style={styles.profileText}><Typography variant="h2">Stryft Athlete</Typography><Typography variant="caption">{profile.primaryGoal ?? 'Personal fitness'} · Level {level}</Typography></View>
          <View style={styles.level}><Typography variant="caption" weight="700">LVL {level}</Typography></View>
        </View>

        <View style={styles.stats}>
          <Stat value={`${game.streak}`} label="Day streak" />
          <Stat value={`${game.workoutsCompleted}`} label="Workouts" />
          <Stat value={`${game.checkInsCompleted}`} label="Check-ins" />
        </View>

        <Section title="Assessment answers" action="Edit any answer" />
        <EditRow icon="flag-outline" title="Goals" value={profile.primaryGoal ?? 'Not set'} onPress={() => router.push('/assessment/goal')} />
        <EditRow icon="body-outline" title="Body profile" value={`${profile.gender ?? '--'} · ${profile.age ?? '--'} years · ${profile.weight.value ?? '--'} ${profile.weight.unit}`} onPress={() => router.push('/assessment/weight')} />
        <EditRow icon="barbell-outline" title="Training preferences" value={`${profile.daysPerWeek} days · ${profile.exercisePreferences.cardio ?? 'No preference'}`} onPress={() => router.push('/assessment/commitment')} />
        <EditRow icon="restaurant-outline" title="Nutrition preferences" value={profile.mealExceptions.join(', ') || 'None'} onPress={() => router.push('/assessment/mealExceptions')} />
        <EditRow icon="moon-outline" title="Recovery" value={`${profile.sleepQuality ?? 'Not set'} sleep`} onPress={() => router.push('/assessment/sleepQuality')} />
        <EditRow icon="resize-outline" title="Measurements" value={`${profile.measurements.height ?? '--'} cm height · ${profile.measurements.waist ?? '--'} cm waist`} onPress={() => router.push('/assessment/measurements')} />

        <Section title="Account" />
        <EditRow icon="settings-outline" title="Settings and privacy" value="Units, notifications, data, account" onPress={() => router.push('/settings')} />
      </ScrollView>
      <FloatingTabBar />
    </SafeAreaView>
  );
}

function Section({ title, action }: { title: string; action?: string }) {
  return <View style={styles.section}><Typography variant="h3">{title}</Typography>{action && <Typography variant="caption" color={Colors.dark.primary} weight="700">{action}</Typography>}</View>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Typography variant="h3">{value}</Typography><Typography variant="caption">{label}</Typography></View>;
}

function EditRow({ icon, title, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.row} onPress={onPress}><View style={styles.rowIcon}><Ionicons name={icon} size={22} color={Colors.dark.primary} /></View><View style={styles.rowText}><Typography variant="body" weight="700">{title}</Typography><Typography variant="caption" style={styles.rowValue}>{value}</Typography></View><Ionicons name="chevron-forward" size={21} color={Colors.dark.textSecondary} /></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 120 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement },
  avatar: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,102,0,0.1)' },
  profileText: { flex: 1, marginLeft: 14 },
  level: { padding: 9, borderRadius: 14, backgroundColor: Colors.dark.primary },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', backgroundColor: Colors.dark.backgroundElement },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  rowIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundSelected },
  rowText: { flex: 1, marginLeft: 12 },
  rowValue: { marginTop: 5 },
});
