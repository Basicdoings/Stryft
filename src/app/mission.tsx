import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useGameStore } from '@/store/useGameStore';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  target: string;
  rest: number;
  cue: string;
  alternative: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const EXERCISES: Exercise[] = [
  { id: 'squat', name: 'Goblet Squat', sets: 3, target: '12 reps', rest: 60, cue: 'Keep your chest tall, brace your core, and drive through your whole foot.', alternative: 'Bodyweight Squat', icon: 'body-outline' },
  { id: 'pushup', name: 'Push-up', sets: 3, target: '10 reps', rest: 60, cue: 'Keep a straight line from head to heel and lower your chest between your hands.', alternative: 'Incline Push-up', icon: 'fitness-outline' },
  { id: 'lunge', name: 'Reverse Lunge', sets: 3, target: '10 / side', rest: 45, cue: 'Step back softly, keep your front knee stacked, and push through the front heel.', alternative: 'Supported Split Squat', icon: 'walk-outline' },
  { id: 'plank', name: 'Plank Hold', sets: 3, target: '30 sec', rest: 45, cue: 'Squeeze your glutes, pull ribs down, and keep your neck relaxed.', alternative: 'Elevated Plank', icon: 'timer-outline' },
];

export default function MissionScreen() {
  const router = useRouter();
  const { todaysMissionComplete, completeMission } = useGameStore();
  const allSetIds = useMemo(() => EXERCISES.flatMap((exercise) => Array.from({ length: exercise.sets }, (_, index) => `${exercise.id}-${index}`)), []);
  const [completedSets, setCompletedSets] = useState<string[]>(todaysMissionComplete ? allSetIds : []);
  const [expanded, setExpanded] = useState<string | null>(EXERCISES[0].id);
  const [swaps, setSwaps] = useState<string[]>([]);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restLabel, setRestLabel] = useState('');
  const progress = completedSets.length / allSetIds.length;

  useEffect(() => {
    if (restSeconds <= 0) return;
    const timer = setInterval(() => setRestSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [restSeconds]);

  const completeSet = (exercise: Exercise, setIndex: number) => {
    const id = `${exercise.id}-${setIndex}`;
    if (completedSets.includes(id)) {
      setCompletedSets((current) => current.filter((setId) => setId !== id));
      return;
    }
    setCompletedSets((current) => [...current, id]);
    if (setIndex < exercise.sets - 1) {
      setRestLabel(exercise.name);
      setRestSeconds(exercise.rest);
    }
  };

  const finish = () => {
    completeMission();
    router.replace('/reward');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity>
          <Typography variant="caption" color={Colors.dark.primary} weight="700">GUIDED MISSION</Typography>
          <View style={styles.iconButton}><Ionicons name="volume-high-outline" size={20} color={Colors.dark.text} /></View>
        </View>

        <Typography variant="h1" style={styles.title}>Full Body Foundation</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>28 min · Beginner · 12 working sets · +120 XP</Typography>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}><Typography variant="body" weight="700">{completedSets.length}/{allSetIds.length} sets complete</Typography><Typography variant="body" color={Colors.dark.primary} weight="700">{Math.round(progress * 100)}%</Typography></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
        </View>

        {restSeconds > 0 && (
          <View style={styles.restCard}>
            <View style={styles.restIcon}><Ionicons name="timer-outline" size={26} color={Colors.dark.primary} /></View>
            <View style={styles.restText}><Typography variant="caption">REST AFTER {restLabel.toUpperCase()}</Typography><Typography variant="h2" style={styles.restValue}>{formatTime(restSeconds)}</Typography></View>
            <TouchableOpacity onPress={() => setRestSeconds((seconds) => seconds + 15)} style={styles.restAction}><Typography variant="caption" color={Colors.dark.primary} weight="700">+15s</Typography></TouchableOpacity>
            <TouchableOpacity onPress={() => setRestSeconds(0)} style={styles.restAction}><Typography variant="caption" color={Colors.dark.text} weight="700">Skip</Typography></TouchableOpacity>
          </View>
        )}

        <View style={styles.exerciseList}>
          {EXERCISES.map((exercise, exerciseIndex) => {
            const isExpanded = expanded === exercise.id;
            const isSwapped = swaps.includes(exercise.id);
            const displayName = isSwapped ? exercise.alternative : exercise.name;
            const completedCount = Array.from({ length: exercise.sets }, (_, index) => `${exercise.id}-${index}`).filter((id) => completedSets.includes(id)).length;
            return (
              <View key={exercise.id} style={[styles.exercise, completedCount === exercise.sets && styles.exerciseDone]}>
                <TouchableOpacity style={styles.exerciseHeader} onPress={() => setExpanded(isExpanded ? null : exercise.id)}>
                  <View style={styles.exerciseNumber}><Typography variant="caption" weight="700">{exerciseIndex + 1}</Typography></View>
                  <View style={styles.exerciseIcon}><Ionicons name={exercise.icon} size={24} color={completedCount === exercise.sets ? Colors.dark.primary : Colors.dark.textSecondary} /></View>
                  <View style={styles.exerciseText}><Typography variant="body" weight="700">{displayName}</Typography><Typography variant="caption" style={styles.exerciseDetail}>{exercise.sets} sets · {exercise.target} · {exercise.rest}s rest</Typography></View>
                  <Typography variant="caption" color={Colors.dark.primary} weight="700">{completedCount}/{exercise.sets}</Typography>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.dark.textSecondary} />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.exerciseBody}>
                    <View style={styles.cueCard}><Ionicons name="bulb-outline" size={20} color={Colors.dark.primary} /><Typography variant="caption" style={styles.cueText}>{exercise.cue}</Typography></View>
                    <View style={styles.setHeader}><Typography variant="caption" weight="700">SETS</Typography><Typography variant="caption" weight="700">TARGET</Typography><Typography variant="caption" weight="700">DONE</Typography></View>
                    {Array.from({ length: exercise.sets }, (_, setIndex) => {
                      const setId = `${exercise.id}-${setIndex}`;
                      const done = completedSets.includes(setId);
                      return (
                        <View key={setId} style={styles.setRow}>
                          <View style={styles.setNumber}><Typography variant="caption" weight="700">{setIndex + 1}</Typography></View>
                          <Typography variant="body" weight="600">{exercise.target}</Typography>
                          <TouchableOpacity style={[styles.setCheck, done && styles.setCheckDone]} onPress={() => completeSet(exercise, setIndex)}>
                            {done ? <Ionicons name="checkmark" size={18} color={Colors.dark.text} /> : <Ionicons name="add" size={18} color={Colors.dark.textSecondary} />}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                    <TouchableOpacity style={styles.swap} onPress={() => setSwaps((current) => current.includes(exercise.id) ? current.filter((id) => id !== exercise.id) : [...current, exercise.id])}>
                      <Ionicons name="swap-horizontal" size={18} color={Colors.dark.primary} />
                      <Typography variant="caption" color={Colors.dark.primary} weight="700" style={styles.swapText}>{isSwapped ? `Use ${exercise.name}` : `Swap for ${exercise.alternative}`}</Typography>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <CustomButton title={todaysMissionComplete ? 'View Reward' : 'Complete Mission'} onPress={finish} disabled={completedSets.length !== allSetIds.length} showArrow />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  progressCard: { backgroundColor: Colors.dark.backgroundElement, borderRadius: 16, padding: 18, marginTop: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  track: { height: 7, borderRadius: 4, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.dark.primary },
  restCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginTop: 14, backgroundColor: 'rgba(255,102,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.35)' },
  restIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  restText: { flex: 1, marginLeft: 12 },
  restValue: { marginTop: 3, marginBottom: 0 },
  restAction: { padding: 10 },
  exerciseList: { gap: 12, marginTop: 20 },
  exercise: { borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, borderWidth: 1, borderColor: Colors.dark.border, overflow: 'hidden' },
  exerciseDone: { borderColor: 'rgba(255,102,0,0.55)', backgroundColor: 'rgba(255,102,0,0.06)' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  exerciseNumber: { width: 24 },
  exerciseIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.dark.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
  exerciseText: { flex: 1, marginLeft: 12 },
  exerciseDetail: { marginTop: 5 },
  exerciseBody: { padding: 14, paddingTop: 0 },
  cueCard: { flexDirection: 'row', padding: 12, borderRadius: 13, backgroundColor: Colors.dark.backgroundSelected },
  cueText: { flex: 1, lineHeight: 18, marginLeft: 9 },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 16, marginBottom: 7 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  setNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.dark.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
  setCheck: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
  setCheckDone: { borderColor: Colors.dark.primary, backgroundColor: Colors.dark.primary },
  swap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 14 },
  swapText: { marginLeft: 7 },
});
