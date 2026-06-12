import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TOP BAR OVERLAY */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <Typography variant="caption" color="#FF6B00" weight="700">DAILY QUEST</Typography>
          </View>
          <View style={styles.iconButton}>
            <Ionicons name="volume-high" size={20} color="#FFF" />
          </View>
        </View>

        {/* HERO IMAGE BANNER */}
        <View style={styles.heroBanner}>
          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop' }} style={styles.heroBg} imageStyle={{ borderRadius: 32 }}>
            <LinearGradientOverlay opacity={0.5} />
            <View style={styles.heroOverlay}>
              <Typography variant="h1" color="#FFF" style={styles.title}>Full Body Foundation</Typography>
              <Typography variant="body" color="rgba(255,255,255,0.85)" weight="600">28 min · Beginner · 12 sets · +120 XP</Typography>
            </View>
          </ImageBackground>
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Typography variant="body" color="#FFF" weight="700">{completedSets.length} / {allSetIds.length} sets complete</Typography>
            <Typography variant="h3" color="#FF6B00">{Math.round(progress * 100)}%</Typography>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* ACTIVE REST TIMER */}
        {restSeconds > 0 && (
          <View style={styles.restCard}>
            <View style={styles.restIcon}><Ionicons name="timer" size={24} color="#FF6B00" /></View>
            <View style={styles.restText}>
              <Typography variant="caption" color="#A1A1AA" weight="700">REST AFTER {restLabel.toUpperCase()}</Typography>
              <Typography variant="h2" color="#FFF" style={styles.restValue}>{formatTime(restSeconds)}</Typography>
            </View>
            <TouchableOpacity onPress={() => setRestSeconds((seconds) => seconds + 15)} style={styles.restAction}>
              <Typography variant="body" color="#42D392" weight="700">+15s</Typography>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRestSeconds(0)} style={styles.restAction}>
              <Typography variant="body" color="#A1A1AA" weight="700">Skip</Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* EXERCISE LIST */}
        <View style={styles.exerciseList}>
          {EXERCISES.map((exercise, exerciseIndex) => {
            const isExpanded = expanded === exercise.id;
            const isSwapped = swaps.includes(exercise.id);
            const displayName = isSwapped ? exercise.alternative : exercise.name;
            const completedCount = Array.from({ length: exercise.sets }, (_, index) => `${exercise.id}-${index}`).filter((id) => completedSets.includes(id)).length;
            const isDone = completedCount === exercise.sets;

            return (
              <View key={exercise.id} style={[styles.exercise, isDone && styles.exerciseDone]}>
                <TouchableOpacity style={styles.exerciseHeader} onPress={() => setExpanded(isExpanded ? null : exercise.id)} activeOpacity={0.8}>
                  <View style={styles.exerciseNumber}>
                    <Typography variant="body" color="#A1A1AA" weight="800">{exerciseIndex + 1}</Typography>
                  </View>
                  <View style={styles.exerciseIcon}>
                    <Ionicons name={exercise.icon as any} size={24} color={isDone ? '#42D392' : '#FFF'} />
                  </View>
                  <View style={styles.exerciseText}>
                    <Typography variant="body" color="#FFF" weight="800">{displayName}</Typography>
                    <Typography variant="caption" color="#A1A1AA" style={styles.exerciseDetail}>{exercise.sets} sets · {exercise.target} · {exercise.rest}s rest</Typography>
                  </View>
                  <Typography variant="h3" color={isDone ? '#42D392' : '#FF6B00'} style={{ marginRight: 12 }}>{completedCount}/{exercise.sets}</Typography>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#A1A1AA" />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.exerciseBody}>
                    <View style={styles.cueCard}>
                      <Ionicons name="bulb" size={22} color="#FFB44A" />
                      <Typography variant="caption" color="#FFF" weight="500" style={styles.cueText}>{exercise.cue}</Typography>
                    </View>
                    <View style={styles.setHeader}>
                      <Typography variant="caption" color="#A1A1AA" weight="700">SET</Typography>
                      <Typography variant="caption" color="#A1A1AA" weight="700">TARGET</Typography>
                      <Typography variant="caption" color="#A1A1AA" weight="700">DONE</Typography>
                    </View>
                    
                    {Array.from({ length: exercise.sets }, (_, setIndex) => {
                      const setId = `${exercise.id}-${setIndex}`;
                      const done = completedSets.includes(setId);
                      return (
                        <View key={setId} style={styles.setRow}>
                          <View style={styles.setNumber}>
                            <Typography variant="caption" color="#FFF" weight="800">{setIndex + 1}</Typography>
                          </View>
                          <Typography variant="body" color="#FFF" weight="700">{exercise.target}</Typography>
                          <TouchableOpacity style={[styles.setCheck, done && styles.setCheckDone]} onPress={() => completeSet(exercise, setIndex)} activeOpacity={0.7}>
                            {done ? <Ionicons name="checkmark" size={20} color="#111" /> : <Ionicons name="add" size={20} color="#A1A1AA" />}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                    
                    <TouchableOpacity style={styles.swap} onPress={() => setSwaps((current) => current.includes(exercise.id) ? current.filter((id) => id !== exercise.id) : [...current, exercise.id])} activeOpacity={0.7}>
                      <Ionicons name="swap-horizontal" size={20} color="#57A4FF" />
                      <Typography variant="body" color="#57A4FF" weight="700" style={styles.swapText}>
                        {isSwapped ? `Use ${exercise.name}` : `Swap for ${exercise.alternative}`}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 24 }}>
          <CustomButton 
            title={todaysMissionComplete ? 'View Reward' : 'Complete Mission'} 
            onPress={finish} 
            disabled={completedSets.length !== allSetIds.length} 
            showArrow 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinearGradientOverlay({ opacity = 0.3 }: { opacity?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${opacity})`, borderRadius: 32 }]} />
  );
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  content: { padding: 20, paddingBottom: 140 },
  
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: 'rgba(255,107,0,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },

  heroBanner: { height: 260, marginBottom: 24 },
  heroBg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  heroOverlay: { padding: 24 },
  title: { fontSize: 32, lineHeight: 36, marginBottom: 8, fontWeight: 'bold' },

  progressCard: { backgroundColor: '#1E1E1E', borderRadius: 24, padding: 24, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#333', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FF6B00' },

  restCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 20, backgroundColor: 'rgba(255,107,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)' },
  restIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  restText: { flex: 1, marginLeft: 16 },
  restValue: { marginTop: 4, marginBottom: 0, fontWeight: 'bold' },
  restAction: { paddingHorizontal: 12, paddingVertical: 8 },

  exerciseList: { gap: 16 },
  exercise: { borderRadius: 24, backgroundColor: '#1E1E1E', overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  exerciseDone: { borderColor: '#42D392' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  exerciseNumber: { width: 28, alignItems: 'center' },
  exerciseIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  exerciseText: { flex: 1, marginLeft: 16 },
  exerciseDetail: { marginTop: 4 },
  
  exerciseBody: { padding: 20, paddingTop: 0, backgroundColor: '#1A1A1A' },
  cueCard: { flexDirection: 'row', padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,180,74,0.1)', marginBottom: 16, marginTop: 12 },
  cueText: { flex: 1, lineHeight: 20, marginLeft: 12 },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 },
  
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 64, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  setNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  setCheck: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },
  setCheckDone: { borderColor: '#42D392', backgroundColor: '#42D392' },
  
  swap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 24, paddingBottom: 8 },
  swapText: { marginLeft: 8 },
});
