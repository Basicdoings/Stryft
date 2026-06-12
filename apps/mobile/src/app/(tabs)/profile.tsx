import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useGameStore } from '@/store/useGameStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const BAR_HEIGHTS = [34, 52, 40, 66, 58, 78, 72];

export default function ProgressScreen() {
  const router = useRouter();
  const game = useGameStore();
  const { daysPerWeek, weight, measurements } = useOnboardingStore();
  
  const adherence = Math.round(Math.min(100, game.workoutsCompleted / daysPerWeek * 100));
  const level = Math.max(1, Math.floor(game.xp / 250) + 1);

  // Mocked RPG Attributes for UI display
  const attributes = {
    str: 14 + Math.floor(game.xp / 500),
    end: 12 + Math.floor(game.workoutsCompleted / 2),
    wis: 10 + game.streak,
    con: 15,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Typography variant="caption" color="#FF6B00" weight="800">CHARACTER SHEET</Typography>
          <View style={styles.back} />
        </View>

        <Typography variant="h1" color="#FFF" style={styles.title}>Lvl {level} Titan</Typography>
        <Typography variant="body" color="#A1A1AA" weight="600" style={{ marginBottom: 28 }}>
          Consistency matters more than perfection.
        </Typography>

        {/* RPG ATTRIBUTES GRID */}
        <View style={styles.statsGrid}>
          <View style={styles.statsColumn}>
            <StatCard label="STR (Strength)" value={attributes.str} icon="barbell" color="#FF6B00" />
            <StatCard label="WIS (Wisdom)" value={attributes.wis} icon="book" color="#42D392" />
          </View>
          <View style={styles.statsColumn}>
            <StatCard label="END (Endurance)" value={attributes.end} icon="heart" color="#1E62FF" />
            <StatCard label="CON (Constitution)" value={attributes.con} icon="shield" color="#FFB44A" />
          </View>
        </View>

        {/* WEEKLY ACTIVITY CHART */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Typography variant="h3" color="#FFF">Activity Trend</Typography>
              <Typography variant="caption" color="#A1A1AA" weight="600" style={styles.cardCaption}>Last 7 days</Typography>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name="trending-up" size={20} color="#FF6B00" />
            </View>
          </View>
          
          <View style={styles.chart}>
            {BAR_HEIGHTS.map((height, index) => (
              <View key={index} style={styles.barSlot}>
                <View style={[styles.bar, { height: `${height}%`, backgroundColor: index === 6 ? '#FF6B00' : '#333' }]} />
                <Typography variant="caption" color="#A1A1AA" weight="700" style={styles.dayLabel}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {/* BIOMETRIC TRACKING */}
        <View style={styles.weightCard}>
          <View>
            <Typography variant="caption" color="#A1A1AA" weight="700">Latest Body Weight</Typography>
            <Typography variant="h2" color="#FFF" style={styles.weightValue}>
              {game.latestCheckIn?.weight ?? weight.value ?? '--'} {weight.unit}
            </Typography>
          </View>
          <View style={styles.changeBadge}>
            <Ionicons name="trending-down" size={16} color="#111" />
            <Typography variant="caption" color="#111" weight="800" style={{ marginLeft: 4 }}>On Track</Typography>
          </View>
        </View>

        {/* COMPARISON METRICS */}
        {game.latestCheckIn && (
          <View style={styles.comparisonCard}>
            <Typography variant="h3" color="#FFF" style={{ marginBottom: 16 }}>Predicted vs Actual</Typography>
            <Comparison 
              label="Weight" 
              predicted={`${Math.max(0, (weight.value ?? game.latestCheckIn.weight) - 0.8).toFixed(1)} ${weight.unit}`} 
              actual={`${game.latestCheckIn.weight} ${weight.unit}`} 
            />
            <Comparison 
              label="Waist" 
              predicted={`${Math.max(0, (measurements.waist ?? game.latestCheckIn.waist ?? 0) - 1.5).toFixed(1)} cm`} 
              actual={game.latestCheckIn.waist ? `${game.latestCheckIn.waist} cm` : '--'} 
            />
          </View>
        )}

        {/* ANTI-CHEAT CHECK-IN */}
        <View style={styles.checkInCard}>
          <View style={styles.calendarIcon}>
            <Typography variant="caption" color="#FFF" weight="800">SUN</Typography>
            <Typography variant="h2" color="#FFF">14</Typography>
          </View>
          <View style={styles.checkInText}>
            <Typography variant="body" color="#FFF" weight="800">Weekly Anti-Cheat Scan</Typography>
            <Typography variant="caption" color="#A1A1AA" weight="600" style={styles.cardCaption}>
              Photos, weight, and recovery logging
            </Typography>
          </View>
          <Ionicons name="camera" size={24} color="#FF6B00" />
        </View>

        {/* ACTIONS */}
        <View style={{ marginTop: 20 }}>
          <CustomButton 
            title={game.latestCheckIn ? 'Update Check-in' : 'Complete Scan Early'} 
            onPress={() => router.push('/checkin')} 
            showArrow 
          />
          <CustomButton 
            title="View 3D Prediction" 
            onPress={() => router.push('/future-self')} 
            variant="secondary" 
            showArrow 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#FFF" style={{ marginBottom: 16 }} />
      <Typography variant="h1" color="#FFF">{value}</Typography>
      <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="700">{label}</Typography>
    </View>
  );
}

function Comparison({ label, predicted, actual }: { label: string; predicted: string; actual: string }) {
  return (
    <View style={styles.comparisonRow}>
      <Typography variant="body" color="#FFF" weight="700" style={styles.comparisonLabel}>{label}</Typography>
      <View style={{ alignItems: 'flex-end', marginRight: 24 }}>
        <Typography variant="caption" color="#A1A1AA">Predicted</Typography>
        <Typography variant="body" color="#FFF" weight="800">{predicted}</Typography>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Typography variant="caption" color="#FF6B00">Actual</Typography>
        <Typography variant="body" color="#FF6B00" weight="800">{actual}</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  content: { padding: 20, paddingBottom: 140 },
  
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40, fontWeight: 'bold' },

  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statsColumn: { flex: 1, gap: 16 },
  statCard: { borderRadius: 28, padding: 20, minHeight: 140, justifyContent: 'center' },

  chartCard: { borderRadius: 28, padding: 24, marginBottom: 20, backgroundColor: '#1E1E1E' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCaption: { marginTop: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  chart: { height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24 },
  barSlot: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '40%', borderRadius: 8, backgroundColor: '#333' },
  dayLabel: { marginTop: 12, fontSize: 11 },

  weightCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 24, padding: 20, marginBottom: 20, backgroundColor: '#1E1E1E' },
  weightValue: { marginTop: 6, fontWeight: 'bold' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#42D392' },

  comparisonCard: { borderRadius: 24, backgroundColor: '#1E1E1E', padding: 24, marginBottom: 20 },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  comparisonLabel: { flex: 1 },

  checkInCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 28, backgroundColor: 'rgba(255,107,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)' },
  calendarIcon: { width: 64, height: 68, borderRadius: 20, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
  checkInText: { flex: 1, marginLeft: 16 },
});
