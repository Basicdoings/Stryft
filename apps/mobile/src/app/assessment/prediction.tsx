import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function PredictionScreen() {
  const router = useRouter();
  const { primaryGoal, timelineWeeks, calorieGoal, daysPerWeek, scanPipelineResult } = useOnboardingStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Your Prediction" step={17} totalSteps={18} showBack={false} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.aura}>
            <Ionicons name="body" size={96} color={Colors.dark.primary} />
          </View>
          <Typography variant="h2" align="center">Your roadmap is ready</Typography>
          <Typography variant="body" align="center" color={Colors.dark.textSecondary}>
            A personalized prototype plan built around your inputs.
          </Typography>
        </View>
        <View style={styles.grid}>
          <Stat label="Primary goal" value={primaryGoal ?? 'Fitness'} />
          <Stat label="Timeline" value={`${timelineWeeks ?? 12} weeks`} />
          <Stat label="Daily target" value={`${calorieGoal ?? 1550} kcal`} />
          <Stat label="Training" value={`${daysPerWeek} days/week`} />
        </View>

        {scanPipelineResult?.generated_mesh_url && (
          <View style={{ marginTop: 16 }}>
            <CustomButton 
              title="View 3D Base Mesh" 
              onPress={() => router.push('/body-model')} 
              variant="secondary"
            />
          </View>
        )}

        <View style={styles.note}>
          <Ionicons name="sparkles" size={20} color={Colors.dark.primary} />
          <Typography variant="caption" style={styles.noteText}>
            Your expected milestones will adapt as you complete weekly check-ins.
          </Typography>
        </View>
        <CustomButton title="Choose My Journey" onPress={() => router.push('/assessment/journey')} showArrow />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Typography variant="caption">{label}</Typography>
      <Typography variant="body" weight="700" style={styles.statValue}>{value}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  aura: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,102,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', padding: 16, borderRadius: 14, backgroundColor: Colors.dark.backgroundElement },
  statValue: { marginTop: 6 },
  note: { flexDirection: 'row', padding: 16, marginTop: 16, borderRadius: 14, backgroundColor: 'rgba(255,102,0,0.08)' },
  noteText: { flex: 1, marginLeft: 10, lineHeight: 18 },
});
