import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useGameStore } from '@/store/useGameStore';
import { ModelViewer } from '@/components/ModelViewer';
import { calculateTimelinePredictions, applyScenarioFactor } from '@/lib/predictionEngine';

type ScenarioId = 'conservative' | 'likely' | 'best';

const SCENARIOS = {
  conservative: { label: 'Conservative', factor: 0.6, color: '#57A4FF', confidence: 'High confidence' },
  likely: { label: 'Likely', factor: 1, color: '#FF6600', confidence: 'Most realistic' },
  best: { label: 'Best case', factor: 1.35, color: '#42D392', confidence: 'Requires high adherence' },
} as const;

export default function FutureSelfScreen() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const game = useGameStore();
  const [scenarioId, setScenarioId] = useState<ScenarioId>('likely');
  const [entranceComplete, setEntranceComplete] = useState(false);
  const scenario = SCENARIOS[scenarioId];
  const beforeWeight = game.latestCheckIn?.weight ?? onboarding.weight.value ?? 75;
  const beforeWaist = game.latestCheckIn?.waist ?? onboarding.measurements.waist ?? 86;
  const beforeBodyFat = game.latestCheckIn?.bodyFat ?? onboarding.measurements.bodyFat ?? 24;
  const totalWeeks = onboarding.timelineWeeks ?? 12;

  // Use the most advanced mesh available
  const { scanPipelineResult } = onboarding;
  const meshUrl = scanPipelineResult?.animated_mesh_url || 
                  scanPipelineResult?.rigged_mesh_url || 
                  scanPipelineResult?.generated_mesh_url;

  // Compute live morph targets based on user's biological profile
  const predictions = useMemo(() => calculateTimelinePredictions({
    fitnessLevel: onboarding.fitnessLevel === 1 ? 'beginner' : onboarding.fitnessLevel >= 4 ? 'advanced' : 'intermediate',
    timelineWeeks: totalWeeks as any,
    sleepQuality: (onboarding.sleepQuality?.toLowerCase() as any) || 'good',
    caloricStrategy: 'surplus',
    primaryGoalZone: (onboarding.primaryGoal?.toLowerCase() as any) || 'abs',
  }), [onboarding.fitnessLevel, totalWeeks, onboarding.sleepQuality, onboarding.primaryGoal]);

  const outcomes = useMemo(() => {
    // Prediction engine gives us changes, we apply the scenario factor
    const muscleGainKg = predictions.expectedMuscleGainKg * scenario.factor;
    const waistChangeCm = predictions.waistChangeCm * scenario.factor;
    const bodyFatChangePct = predictions.bodyFatChangePct * scenario.factor;

    // Weight change = muscle gain - fat loss (approx)
    const weightChangeKg = muscleGainKg + (beforeWeight * (bodyFatChangePct / 100));

    return {
      weight: beforeWeight + weightChangeKg,
      waist: beforeWaist + waistChangeCm,
      bodyFat: beforeBodyFat + bodyFatChangePct,
      zoneMorphs: applyScenarioFactor(predictions.zoneMorphs, scenario.factor),
    };
  }, [beforeBodyFat, beforeWaist, beforeWeight, scenario.factor, predictions]);

  const milestones = [
    { week: 1, title: 'Baseline established', detail: 'Measurements and roadmap locked', complete: true },
    { week: Math.max(2, Math.round(totalWeeks * 0.25)), title: 'Early momentum', detail: `Expected waist change: -${(1.5 * scenario.factor).toFixed(1)} cm`, complete: game.checkInsCompleted >= 1 },
    { week: Math.max(4, Math.round(totalWeeks * 0.5)), title: 'Visible progress', detail: `Expected body-fat change: -${(2.2 * scenario.factor).toFixed(1)}%`, complete: game.checkInsCompleted >= 2 },
    { week: totalWeeks, title: 'Future-self milestone', detail: `${scenario.label} outcome target`, complete: false },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">FUTURE SELF</Typography><View style={styles.back}><Ionicons name="sparkles-outline" size={20} color={Colors.dark.text} /></View></View>
        <Typography variant="h1" style={styles.title}>See where consistency leads</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Prototype outcomes based on your current inputs and selected scenario.</Typography>

        <View style={styles.comparison}>
          <BodyCard 
            label="Before" 
            icon="body-outline" 
            color={Colors.dark.textSecondary} 
            weight={`${beforeWeight.toFixed(1)} ${onboarding.weight.unit}`} 
            waist={`${beforeWaist.toFixed(1)} cm`} 
            bodyFat={`${beforeBodyFat.toFixed(1)}%`}
            meshUrl={meshUrl}
            // Before body has 0 morph weight
            zoneMorphs={{ abs: 0, glutes: 0, vTaper: 0, arms: 0, legs: 0 }}
          />
          <View style={styles.arrow}><Ionicons name="arrow-forward" size={24} color={Colors.dark.primary} /></View>
          <BodyCard 
            label={`After · ${totalWeeks}w`} 
            icon="body" 
            color={scenario.color} 
            weight={`${outcomes.weight.toFixed(1)} ${onboarding.weight.unit}`} 
            waist={`${outcomes.waist.toFixed(1)} cm`} 
            bodyFat={`${outcomes.bodyFat.toFixed(1)}%`}
            meshUrl={meshUrl}
            zoneMorphs={outcomes.zoneMorphs}
            onEntranceComplete={() => setEntranceComplete(true)}
          />
        </View>

        {entranceComplete && (
          <Animated.View entering={FadeIn.duration(800)}>
            <View style={styles.section}><Typography variant="h3">Outcome range</Typography><Typography variant="caption" color={scenario.color} weight="700">{scenario.confidence}</Typography></View>
            <View style={styles.tabs}>
              {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => <TouchableOpacity key={id} style={[styles.tab, scenarioId === id && { backgroundColor: SCENARIOS[id].color }]} onPress={() => setScenarioId(id)}><Typography variant="caption" weight="700" color={scenarioId === id ? Colors.dark.text : Colors.dark.textSecondary}>{SCENARIOS[id].label}</Typography></TouchableOpacity>)}
            </View>

            <View style={styles.metrics}>
              <Metric label="Weight change" value={`-${(beforeWeight - outcomes.weight).toFixed(1)} ${onboarding.weight.unit}`} icon="scale-outline" color={scenario.color} />
              <Metric label="Waist change" value={`-${(beforeWaist - outcomes.waist).toFixed(1)} cm`} icon="resize-outline" color={scenario.color} />
              <Metric label="Body-fat change" value={`-${(beforeBodyFat - outcomes.bodyFat).toFixed(1)}%`} icon="water-outline" color={scenario.color} />
            </View>

            <View style={styles.section}><Typography variant="h3">Milestone timeline</Typography><Typography variant="caption">{totalWeeks} weeks</Typography></View>
            <View>
              {milestones.map((milestone, index) => (
                <View key={`${milestone.week}-${milestone.title}`} style={styles.milestoneRow}>
                  <View style={styles.rail}><View style={[styles.node, milestone.complete && styles.nodeComplete]}>{milestone.complete ? <Ionicons name="checkmark" size={15} color={Colors.dark.text} /> : <Typography variant="caption" weight="700">{milestone.week}</Typography>}</View>{index < milestones.length - 1 && <View style={[styles.line, milestone.complete && styles.lineComplete]} />}</View>
                  <View style={[styles.milestone, milestone.complete && styles.milestoneComplete]}><Typography variant="caption" color={milestone.complete ? '#42D392' : Colors.dark.primary} weight="700">WEEK {milestone.week}</Typography><Typography variant="body" weight="700" style={styles.milestoneTitle}>{milestone.title}</Typography><Typography variant="caption">{milestone.detail}</Typography></View>
                </View>
              ))}
            </View>
            <View style={styles.disclaimer}><Ionicons name="information-circle-outline" size={20} color={Colors.dark.primary} /><Typography variant="caption" style={styles.disclaimerText}>This is a motivational prototype, not a medical or guaranteed body prediction. Results vary with adherence, recovery, and individual biology.</Typography></View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BodyCard({ label, icon, color, weight, waist, bodyFat, meshUrl, zoneMorphs, onEntranceComplete }: { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; weight: string; waist: string; bodyFat: string; meshUrl?: string | null; zoneMorphs?: any; onEntranceComplete?: () => void; }) {
  return (
    <View style={styles.bodyCard}>
      <Typography variant="caption" color={color} weight="700">{label.toUpperCase()}</Typography>
      <View style={[styles.bodyVisual, { backgroundColor: `${color}18`, borderColor: `${color}60` }]}>
        {meshUrl ? (
          <View style={styles.modelContainer}>
            <ModelViewer 
              modelUrl={meshUrl}
              zoneMorphs={zoneMorphs}
              rimLightColor={color}
              enableEntrance={true} // Enable cinematic entrance for future body
              activeState="idle"
              onEntranceComplete={onEntranceComplete}
            />
          </View>
        ) : (
          <Ionicons name={icon} size={80} color={color} />
        )}
      </View>
      <Typography variant="caption">Weight <Typography variant="caption" weight="700" color={Colors.dark.text}>{weight}</Typography></Typography>
      <Typography variant="caption">Waist <Typography variant="caption" weight="700" color={Colors.dark.text}>{waist}</Typography></Typography>
      <Typography variant="caption">Body fat <Typography variant="caption" weight="700" color={Colors.dark.text}>{bodyFat}</Typography></Typography>
    </View>
  );
}

function Metric({ label, value, icon, color }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; color: string }) {
  return <View style={styles.metric}><Ionicons name={icon} size={22} color={color} /><Typography variant="caption" style={styles.metricLabel}>{label}</Typography><Typography variant="body" weight="700">{value}</Typography></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  comparison: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  bodyCard: { flex: 1, gap: 6 },
  bodyVisual: { height: 260, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 8, overflow: 'hidden' },
  modelContainer: { width: '100%', height: '100%', backgroundColor: '#0A0A0A' },
  arrow: { width: 38, alignItems: 'center' },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 10 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 13 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 14 },
  metric: { flex: 1, minHeight: 112, padding: 13, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  metricLabel: { marginTop: 15, marginBottom: 5, fontSize: 11 },
  milestoneRow: { flexDirection: 'row' },
  rail: { width: 44, alignItems: 'center' },
  node: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
  nodeComplete: { backgroundColor: '#1E8E64' },
  line: { flex: 1, width: 3, minHeight: 82, backgroundColor: Colors.dark.backgroundSelected },
  lineComplete: { backgroundColor: '#1E8E64' },
  milestone: { flex: 1, padding: 15, borderRadius: 16, marginBottom: 14, backgroundColor: Colors.dark.backgroundElement },
  milestoneComplete: { borderWidth: 1, borderColor: 'rgba(66,211,146,0.35)' },
  milestoneTitle: { marginVertical: 5 },
  disclaimer: { flexDirection: 'row', padding: 16, marginTop: 12, borderRadius: 16, backgroundColor: 'rgba(255,102,0,0.08)' },
  disclaimerText: { flex: 1, marginLeft: 9, lineHeight: 18 },
});
