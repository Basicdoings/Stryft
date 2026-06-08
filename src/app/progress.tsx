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
import { FloatingTabBar } from '@/components/FloatingTabBar';

const BAR_HEIGHTS = [34, 52, 40, 66, 58, 78, 72];

export default function ProgressScreen() {
  const router = useRouter();
  const game = useGameStore();
  const { daysPerWeek, weight, measurements } = useOnboardingStore();
  const adherence = Math.round(Math.min(100, game.workoutsCompleted / daysPerWeek * 100));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity>
          <Typography variant="caption" color={Colors.dark.primary} weight="700">WEEKLY PROGRESS</Typography>
          <View style={styles.back} />
        </View>
        <Typography variant="h1" style={styles.title}>This week&apos;s momentum</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Consistency matters more than perfection.</Typography>

        <View style={styles.stats}>
          <Stat value={`${adherence}%`} label="Adherence" icon="checkmark-circle" />
          <Stat value={`${game.workoutsCompleted}/${daysPerWeek}`} label="Workouts" icon="barbell" />
          <Stat value={`${game.streak}`} label="Day streak" icon="flame" />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}><View><Typography variant="body" weight="700">Activity trend</Typography><Typography variant="caption" style={styles.cardCaption}>Last 7 days</Typography></View><Ionicons name="trending-up" size={24} color={Colors.dark.primary} /></View>
          <View style={styles.chart}>
            {BAR_HEIGHTS.map((height, index) => <View key={index} style={styles.barSlot}><View style={[styles.bar, { height }, index === 6 && styles.barActive]} /><Typography variant="caption" style={styles.dayLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Typography></View>)}
          </View>
        </View>

        <View style={styles.weightCard}>
          <View><Typography variant="caption">Latest weight</Typography><Typography variant="h2" style={styles.weightValue}>{game.latestCheckIn?.weight ?? weight.value ?? '--'} {weight.unit}</Typography></View>
          <View style={styles.change}><Ionicons name="trending-down" size={18} color="#42D392" /><Typography variant="caption" color="#42D392" weight="700">On track</Typography></View>
        </View>

        {game.latestCheckIn && (
          <>
            <Typography variant="h3" style={styles.sectionTitle}>Predicted vs actual</Typography>
            <View style={styles.comparisonCard}>
              <Comparison label="Weight" predicted={`${Math.max(0, (weight.value ?? game.latestCheckIn.weight) - 0.8).toFixed(1)} ${weight.unit}`} actual={`${game.latestCheckIn.weight} ${weight.unit}`} />
              <Comparison label="Waist" predicted={`${Math.max(0, (measurements.waist ?? game.latestCheckIn.waist ?? 0) - 1.5).toFixed(1)} cm`} actual={game.latestCheckIn.waist ? `${game.latestCheckIn.waist} cm` : '--'} />
              <Comparison label="Body fat" predicted={measurements.bodyFat ? `${Math.max(0, measurements.bodyFat - 0.5).toFixed(1)}%` : '--'} actual={game.latestCheckIn.bodyFat ? `${game.latestCheckIn.bodyFat}%` : '--'} />
            </View>
          </>
        )}

        <Typography variant="h3" style={styles.sectionTitle}>Upcoming check-in</Typography>
        <View style={styles.checkInCard}>
          <View style={styles.calendar}><Typography variant="caption" weight="700">SUN</Typography><Typography variant="h2">14</Typography></View>
          <View style={styles.checkInText}><Typography variant="body" weight="700">Weekly progress review</Typography><Typography variant="caption" style={styles.cardCaption}>Photos, measurements, weight, and recovery</Typography></View>
          <Ionicons name="notifications-outline" size={23} color={Colors.dark.primary} />
        </View>
        <CustomButton title={game.latestCheckIn ? 'Update Check-in' : 'Complete Check-in Early'} onPress={() => router.push('/checkin')} showArrow />
        <CustomButton title="View Future-Self Prediction" onPress={() => router.push('/future-self')} variant="secondary" showArrow />
        <CustomButton title="Back to Today" onPress={() => router.replace('/today')} variant="secondary" />
      </ScrollView>
      <FloatingTabBar />
    </SafeAreaView>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return <View style={styles.stat}><Ionicons name={icon} size={22} color={Colors.dark.primary} /><Typography variant="h3" style={styles.statValue}>{value}</Typography><Typography variant="caption">{label}</Typography></View>;
}

function Comparison({ label, predicted, actual }: { label: string; predicted: string; actual: string }) {
  return <View style={styles.comparisonRow}><Typography variant="body" weight="700" style={styles.comparisonLabel}>{label}</Typography><View><Typography variant="caption">Predicted</Typography><Typography variant="body" weight="700">{predicted}</Typography></View><View><Typography variant="caption">Actual</Typography><Typography variant="body" color={Colors.dark.primary} weight="700">{actual}</Typography></View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 120 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  statValue: { marginTop: 16, marginBottom: 4 },
  chartCard: { borderRadius: 18, padding: 18, marginTop: 16, backgroundColor: Colors.dark.backgroundElement },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardCaption: { marginTop: 5 },
  chart: { height: 125, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18 },
  barSlot: { flex: 1, alignItems: 'center' },
  bar: { width: 18, borderRadius: 9, backgroundColor: Colors.dark.backgroundSelected },
  barActive: { backgroundColor: Colors.dark.primary },
  dayLabel: { marginTop: 8, fontSize: 11 },
  weightCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 18, padding: 18, marginTop: 16, backgroundColor: Colors.dark.backgroundElement },
  weightValue: { marginTop: 8 },
  change: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10, borderRadius: 13, backgroundColor: 'rgba(66,211,146,0.1)' },
  sectionTitle: { marginTop: 28 },
  comparisonCard: { borderRadius: 18, backgroundColor: Colors.dark.backgroundElement, overflow: 'hidden' },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  comparisonLabel: { flex: 1 },
  checkInCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  calendar: { width: 56, height: 62, borderRadius: 15, backgroundColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  checkInText: { flex: 1, marginLeft: 14 },
});
