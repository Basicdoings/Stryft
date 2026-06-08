import React, { useState } from 'react';
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

export default function MealsScreen() {
  const router = useRouter();
  const { calorieGoal } = useOnboardingStore();
  const { completedMeals, toggleMeal, mealSubstitutions, setMealSubstitution } = useGameStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const totals = LOCAL_MEALS.reduce((sum, meal) => ({ calories: sum.calories + meal.calories, protein: sum.protein + meal.protein, carbs: sum.carbs + meal.carbs, fat: sum.fat + meal.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar onBack={() => router.back()} />
        <Typography variant="h1" style={styles.title}>Lagos-local meal plan</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Familiar ingredients, aligned with your daily target.</Typography>

        <View style={styles.summary}>
          <View style={styles.calorieRing}><Typography variant="h2" align="center">{totals.calories}</Typography><Typography variant="caption">of {calorieGoal ?? 1550} kcal</Typography></View>
          <View style={styles.macros}>
            <Macro label="Protein" value={`${totals.protein}g`} color="#42D392" />
            <Macro label="Carbs" value={`${totals.carbs}g`} color="#57A4FF" />
            <Macro label="Fat" value={`${totals.fat}g`} color="#FFB44A" />
          </View>
        </View>

        <View style={styles.section}><Typography variant="h3">Today&apos;s meals</Typography><Typography variant="caption" color={Colors.dark.primary} weight="700">{completedMeals.length}/4 logged</Typography></View>
        <View style={styles.meals}>
          {LOCAL_MEALS.map((meal) => {
            const done = completedMeals.includes(meal.id);
            const open = expanded === meal.id;
            const selectedName = mealSubstitutions[meal.id] ?? meal.name;
            return (
              <View key={meal.id} style={[styles.meal, done && styles.mealDone]}>
                <TouchableOpacity style={styles.mealHeader} onPress={() => setExpanded(open ? null : meal.id)}>
                  <View style={styles.mealIcon}><Ionicons name={meal.icon} size={24} color={done ? Colors.dark.primary : Colors.dark.textSecondary} /></View>
                  <View style={styles.mealText}><Typography variant="caption">{meal.type} · {meal.time}</Typography><Typography variant="body" weight="700" style={styles.mealName}>{selectedName}</Typography><Typography variant="caption">{meal.calories} kcal · P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g</Typography></View>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.dark.textSecondary} />
                </TouchableOpacity>
                {open && (
                  <View style={styles.details}>
                    <Typography variant="caption" weight="700">LOCAL SUBSTITUTIONS</Typography>
                    <TouchableOpacity style={[styles.substitution, !mealSubstitutions[meal.id] && styles.substitutionActive]} onPress={() => setMealSubstitution(meal.id, meal.name)}>
                      <Typography variant="body" weight="700">{meal.name}</Typography><Typography variant="caption">Original plan</Typography>
                    </TouchableOpacity>
                    {meal.substitutions.map((substitution) => (
                      <TouchableOpacity key={substitution.name} style={[styles.substitution, mealSubstitutions[meal.id] === substitution.name && styles.substitutionActive]} onPress={() => setMealSubstitution(meal.id, substitution.name)}>
                        <View><Typography variant="body" weight="700">{substitution.name}</Typography><Typography variant="caption" style={styles.subNote}>{substitution.note}</Typography></View>
                        <Typography variant="caption" color={Colors.dark.primary} weight="700">{substitution.calories} kcal</Typography>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.logButton} onPress={() => toggleMeal(meal.id)}><Ionicons name={done ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={Colors.dark.primary} /><Typography variant="caption" color={Colors.dark.primary} weight="700" style={styles.logText}>{done ? 'Meal logged' : 'Log this meal'}</Typography></TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <CustomButton title="Open Shopping List" onPress={() => router.push('/shopping-list')} showArrow />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({ onBack }: { onBack: () => void }) {
  return <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={onBack}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">MEAL PLAN</Typography><TouchableOpacity style={styles.back}><Ionicons name="calendar-outline" size={20} color={Colors.dark.text} /></TouchableOpacity></View>;
}

function Macro({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={styles.macro}><View style={[styles.macroDot, { backgroundColor: color }]} /><View><Typography variant="caption">{label}</Typography><Typography variant="body" weight="700">{value}</Typography></View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  summary: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, marginTop: 24, backgroundColor: Colors.dark.backgroundElement },
  calorieRing: { width: 105, height: 105, borderRadius: 53, borderWidth: 7, borderColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  macros: { flex: 1, marginLeft: 20, gap: 12 },
  macro: { flexDirection: 'row', alignItems: 'center' },
  macroDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 10 },
  meals: { gap: 12 },
  meal: { borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, borderWidth: 1, borderColor: Colors.dark.border, overflow: 'hidden' },
  mealDone: { borderColor: 'rgba(255,102,0,0.5)' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  mealIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.dark.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
  mealText: { flex: 1, marginLeft: 12 },
  mealName: { marginVertical: 4 },
  details: { padding: 14, paddingTop: 0 },
  substitution: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderRadius: 13, marginTop: 9, backgroundColor: Colors.dark.backgroundSelected, borderWidth: 1, borderColor: 'transparent' },
  substitutionActive: { borderColor: Colors.dark.primary, backgroundColor: 'rgba(255,102,0,0.08)' },
  subNote: { marginTop: 4 },
  logButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 15 },
  logText: { marginLeft: 7 },
});
