import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useGameStore } from '@/store/useGameStore';

const DAYS = [
  { day: 'Mon', workout: 'Full Body Foundation', meal: 'Jollof + chicken', type: 'Strength' },
  { day: 'Tue', workout: 'Recovery Walk', meal: 'Yam porridge + fish', type: 'Recovery' },
  { day: 'Wed', workout: 'Lower Body Power', meal: 'Ofada rice + fish', type: 'Strength' },
  { day: 'Thu', workout: 'Mobility Reset', meal: 'Eba + okra soup', type: 'Recovery' },
  { day: 'Fri', workout: 'Upper Body Build', meal: 'Coconut rice + turkey', type: 'Strength' },
  { day: 'Sat', workout: 'Conditioning Quest', meal: 'Moi Moi + eggs', type: 'Cardio' },
  { day: 'Sun', workout: 'Weekly Check-in', meal: 'Flexible local plate', type: 'Check-in' },
];

export default function PlanScreen() {
  const router = useRouter();
  const { daysPerWeek } = useOnboardingStore();
  const { workoutsCompleted } = useGameStore();
  const [selected, setSelected] = useState(0);
  const item = DAYS[selected];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><View><Typography variant="caption" color={Colors.dark.primary} weight="700">WEEKLY ROADMAP</Typography><Typography variant="h1">Your plan</Typography></View><TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}><Ionicons name="notifications-outline" size={21} color={Colors.dark.text} /></TouchableOpacity></View>
        <View style={styles.progress}><Typography variant="body" weight="700">{workoutsCompleted}/{daysPerWeek} workouts complete</Typography><Typography variant="caption">Plan adapts after every check-in</Typography></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>{DAYS.map((entry, index) => <TouchableOpacity key={entry.day} style={[styles.day, selected === index && styles.dayActive]} onPress={() => setSelected(index)}><Typography variant="caption" weight="700">{entry.day}</Typography><View style={[styles.dot, entry.type === 'Recovery' && styles.recoveryDot]} /></TouchableOpacity>)}</ScrollView>
        <View style={styles.detailCard}><Typography variant="caption" color={Colors.dark.primary} weight="700">{item.type.toUpperCase()}</Typography><Typography variant="h2" style={styles.detailTitle}>{item.workout}</Typography><Typography variant="caption">30-45 min · Alternatives included · Progressive overload</Typography><TouchableOpacity style={styles.action} onPress={() => router.push(item.type === 'Check-in' ? '/checkin' : '/mission')}><Typography variant="body" weight="700">Open session</Typography><Ionicons name="arrow-forward" size={20} color={Colors.dark.text} /></TouchableOpacity></View>
        <View style={styles.section}><Typography variant="h3">Meal focus</Typography><TouchableOpacity onPress={() => router.push('/meals')}><Typography variant="caption" color={Colors.dark.primary} weight="700">Meal plan</Typography></TouchableOpacity></View>
        <TouchableOpacity style={styles.mealCard} onPress={() => router.push('/meals')}><Ionicons name="restaurant-outline" size={25} color={Colors.dark.primary} /><View style={styles.mealText}><Typography variant="body" weight="700">{item.meal}</Typography><Typography variant="caption">Localized macros and substitutions</Typography></View><Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} /></TouchableOpacity>
        <View style={styles.section}><Typography variant="h3">Plan tools</Typography></View>
        <View style={styles.tools}><Tool icon="camera-outline" label="Body scan" onPress={() => router.push('/scan')} /><Tool icon="shield-checkmark-outline" label="Safety" onPress={() => router.push('/safety')} /><Tool icon="people-outline" label="Challenges" onPress={() => router.push('/community')} /><Tool icon="diamond-outline" label="Premium" onPress={() => router.push('/premium')} /></View>
      </ScrollView>
      <FloatingTabBar />
    </SafeAreaView>
  );
}

function Tool({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.tool} onPress={onPress}><Ionicons name={icon} size={24} color={Colors.dark.primary} /><Typography variant="caption" weight="700" style={styles.toolLabel}>{label}</Typography></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  progress: { padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)', gap: 5 },
  days: { gap: 8, paddingVertical: 18 },
  day: { width: 58, height: 68, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  dayActive: { backgroundColor: Colors.dark.primary },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8, backgroundColor: '#42D392' },
  recoveryDot: { backgroundColor: '#57A4FF' },
  detailCard: { padding: 20, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement },
  detailTitle: { marginTop: 7 },
  action: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 15, marginTop: 18, backgroundColor: Colors.dark.primary },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26, marginBottom: 10 },
  mealCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  mealText: { flex: 1, marginLeft: 12, gap: 5 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tool: { width: '48%', padding: 18, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  toolLabel: { marginTop: 14 },
});
