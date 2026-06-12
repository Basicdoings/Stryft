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
import { LOCAL_MEALS } from '@/constants/mealPlan';

export default function TodayScreen() {
  const router = useRouter();
  const { calorieGoal } = useOnboardingStore();
  const { todaysMissionComplete, completedMeals, toggleMeal, mealSubstitutions } = useGameStore();
  const consumed = LOCAL_MEALS.filter((meal) => completedMeals.includes(meal.id)).reduce((total, meal) => total + meal.calories, 0);
  const protein = LOCAL_MEALS.filter((meal) => completedMeals.includes(meal.id)).reduce((total, meal) => total + meal.protein, 0);
  const target = calorieGoal ?? 1550;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="TODAY'S PLAN" onBack={() => router.back()} />
        <Typography variant="h1" style={styles.title}>Your day at a glance</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Training and fuel, planned around your goal.</Typography>

        <View style={styles.macroCard}>
          <View style={styles.ring}>
            <Typography variant="h2" align="center">{consumed}</Typography>
            <Typography variant="caption" align="center">of {target} kcal</Typography>
          </View>
          <View style={styles.macroInfo}>
            <Typography variant="body" weight="700">Daily nutrition</Typography>
            <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, consumed / target * 100)}%` }]} /></View>
            <Typography variant="caption">{protein}g protein logged · {target - consumed > 0 ? `${target - consumed} kcal remaining` : 'Target reached'}</Typography>
          </View>
        </View>

        <Section title="Today's workout" />
        <TouchableOpacity style={styles.workout} onPress={() => router.push(todaysMissionComplete ? '/reward' : '/mission')}>
          <View style={[styles.workoutIcon, todaysMissionComplete && styles.completeIcon]}><Ionicons name={todaysMissionComplete ? 'checkmark' : 'barbell'} size={28} color={Colors.dark.text} /></View>
          <View style={styles.workoutText}>
            <Typography variant="body" weight="700">Full Body Foundation</Typography>
            <Typography variant="caption" style={styles.detail}>28 min · 4 exercises · +120 XP</Typography>
          </View>
          <Typography variant="caption" color={todaysMissionComplete ? '#42D392' : Colors.dark.primary} weight="700">{todaysMissionComplete ? 'Done' : 'Start'}</Typography>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/meals')}><Section title="Today's meals" action={`${completedMeals.length}/${LOCAL_MEALS.length} logged`} /></TouchableOpacity>
        <View style={styles.meals}>
          {LOCAL_MEALS.map((meal) => {
            const done = completedMeals.includes(meal.id);
            return (
              <TouchableOpacity key={meal.id} style={[styles.meal, done && styles.mealDone]} onPress={() => toggleMeal(meal.id)}>
                <View style={styles.mealIcon}><Ionicons name={meal.icon} size={23} color={done ? Colors.dark.primary : Colors.dark.textSecondary} /></View>
                <View style={styles.mealText}>
                  <Typography variant="caption">{meal.time}</Typography>
                  <Typography variant="body" weight="700" style={styles.mealName}>{mealSubstitutions[meal.id] ?? meal.name}</Typography>
                  <Typography variant="caption">{meal.calories} kcal · {meal.protein}g protein</Typography>
                </View>
                <View style={[styles.check, done && styles.checkDone]}>{done && <Ionicons name="checkmark" size={16} color={Colors.dark.text} />}</View>
              </TouchableOpacity>
            );
          })}
        </View>
        <CustomButton title="Open Full Meal Plan" onPress={() => router.push('/meals')} showArrow />
        <CustomButton title="View Weekly Progress" onPress={() => router.push('/progress')} variant="secondary" showArrow />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={onBack}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">{title}</Typography><View style={styles.back} /></View>;
}

function Section({ title, action }: { title: string; action?: string }) {
  return <View style={styles.section}><Typography variant="h3">{title}</Typography>{action && <Typography variant="caption" color={Colors.dark.primary} weight="700">{action}</Typography>}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  macroCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 18, marginTop: 24, backgroundColor: Colors.dark.backgroundElement },
  ring: { width: 94, height: 94, borderRadius: 47, borderWidth: 7, borderColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  macroInfo: { flex: 1, marginLeft: 18, gap: 10 },
  track: { height: 6, borderRadius: 3, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.dark.primary },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 10 },
  workout: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  workoutIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  completeIcon: { backgroundColor: '#1E8E64' },
  workoutText: { flex: 1, marginLeft: 14 },
  detail: { marginTop: 5 },
  meals: { gap: 10 },
  meal: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, borderWidth: 1, borderColor: Colors.dark.border },
  mealDone: { borderColor: 'rgba(255,102,0,0.5)', backgroundColor: 'rgba(255,102,0,0.07)' },
  mealIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundSelected },
  mealText: { flex: 1, marginLeft: 12 },
  mealName: { marginVertical: 4 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { borderColor: Colors.dark.primary, backgroundColor: Colors.dark.primary },
});
