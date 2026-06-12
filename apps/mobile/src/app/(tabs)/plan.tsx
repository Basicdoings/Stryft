import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  
  const totals = LOCAL_MEALS.reduce((sum, meal) => ({ 
    calories: sum.calories + meal.calories, 
    protein: sum.protein + meal.protein, 
    carbs: sum.carbs + meal.carbs, 
    fat: sum.fat + meal.fat 
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <TopBar onBack={() => router.back()} />
        <View style={styles.headerBlock}>
          <Typography variant="h1" color="#FFF" style={styles.title}>Localized Fuel</Typography>
          <Typography variant="body" color="#A1A1AA" weight="600">AI-tailored Nigerian meal plan</Typography>
        </View>

        {/* SUMMARY METRICS (Matching Figma style) */}
        <View style={styles.metricsRow}>
           <View style={[styles.metricCard, styles.metricOrange]}>
             <Ionicons name="flame" size={26} color="#FFF" style={styles.metricIcon} />
             <Typography variant="h1" color="#FFF">{totals.calories}</Typography>
             <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="700">of {calorieGoal ?? 1550} kcal</Typography>
           </View>
           <View style={[styles.metricCard, styles.metricDark]}>
             <Typography variant="caption" color="#A1A1AA" weight="700" style={{ marginBottom: 8 }}>MACROS</Typography>
             <MacroRow label="Protein" value={`${totals.protein}g`} color="#42D392" />
             <MacroRow label="Carbs" value={`${totals.carbs}g`} color="#57A4FF" />
             <MacroRow label="Fat" value={`${totals.fat}g`} color="#FFB44A" />
           </View>
        </View>

        <View style={styles.sectionHeader}>
          <Typography variant="h3" color="#FFF">Today's Fuel ({completedMeals.length}/4)</Typography>
        </View>

        {/* MEAL CARDS (Figma ImageBackground style) */}
        <View style={styles.meals}>
          {LOCAL_MEALS.map((meal, index) => {
            const done = completedMeals.includes(meal.id);
            const open = expanded === meal.id;
            const selectedName = mealSubstitutions[meal.id] ?? meal.name;
            // Use different placeholder images per meal index
            const bgImage = `https://images.unsplash.com/photo-${index % 2 === 0 ? '1512621776951-a57141f2eefd' : '1546069901-ba6e2c91fce4'}?q=80&w=600&auto=format&fit=crop`;

            return (
              <View key={meal.id} style={[styles.mealWrapper, done && styles.mealWrapperDone]}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded(open ? null : meal.id)}>
                  <ImageBackground source={{ uri: bgImage }} style={styles.mealBg} imageStyle={{ borderRadius: 24 }}>
                    <LinearGradientOverlay />
                    <View style={styles.mealOverlay}>
                      <View style={styles.mealTop}>
                        <View style={styles.mealTag}>
                          <Ionicons name={meal.icon as any} size={14} color="#FFF" />
                          <Typography variant="caption" color="#FFF" weight="700" style={{ marginLeft: 6 }}>{meal.type}</Typography>
                        </View>
                        {done && (
                          <View style={styles.doneBadge}>
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          </View>
                        )}
                      </View>

                      <View style={styles.mealBottom}>
                        <View style={{ flex: 1 }}>
                          <Typography variant="h3" color="#FFF">{selectedName}</Typography>
                          <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="600">{meal.time} · P {meal.protein}g</Typography>
                        </View>
                        <View style={styles.dietCalBadge}>
                          <Typography variant="caption" style={styles.dietCalText}>{meal.calories} kcal</Typography>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>

                {/* SUBSTITUTIONS & LOGGING PANEL */}
                {open && (
                  <View style={styles.details}>
                    <Typography variant="caption" color="#A1A1AA" weight="700" style={{ marginBottom: 12 }}>LOCAL SUBSTITUTIONS</Typography>
                    
                    <TouchableOpacity style={[styles.substitution, !mealSubstitutions[meal.id] && styles.substitutionActive]} onPress={() => setMealSubstitution(meal.id, meal.name)} activeOpacity={0.7}>
                      <Typography variant="body" color="#FFF" weight="700">{meal.name}</Typography>
                      <Typography variant="caption" color="#A1A1AA">Original plan</Typography>
                    </TouchableOpacity>
                    
                    {meal.substitutions.map((substitution) => (
                      <TouchableOpacity key={substitution.name} style={[styles.substitution, mealSubstitutions[meal.id] === substitution.name && styles.substitutionActive]} onPress={() => setMealSubstitution(meal.id, substitution.name)} activeOpacity={0.7}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Typography variant="body" color="#FFF" weight="700">{substitution.name}</Typography>
                          <Typography variant="caption" color="#A1A1AA" style={styles.subNote}>{substitution.note}</Typography>
                        </View>
                        <View style={styles.subCalBadge}>
                          <Typography variant="caption" color="#FF6B00" weight="800">{substitution.calories} kcal</Typography>
                        </View>
                      </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity style={[styles.logButton, done && styles.logButtonDone]} onPress={() => toggleMeal(meal.id)} activeOpacity={0.8}>
                      <Ionicons name={done ? 'checkmark-circle' : 'restaurant'} size={20} color={done ? '#42D392' : '#FFF'} />
                      <Typography variant="body" color={done ? '#42D392' : '#FFF'} weight="800" style={styles.logText}>
                        {done ? 'Meal Logged' : 'Log This Meal'}
                      </Typography>
                    </TouchableOpacity>
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

function LinearGradientOverlay() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24 }]} />
  );
}

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.back}>
        <Ionicons name="calendar-outline" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

function MacroRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.macroRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Typography variant="caption" color="#A1A1AA" weight="600">{label}</Typography>
      </View>
      <Typography variant="body" color="#FFF" weight="800">{value}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  content: { padding: 20, paddingBottom: 140 },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  
  headerBlock: { marginBottom: 32 },
  title: { fontSize: 32, marginBottom: 4, fontWeight: 'bold' },

  metricsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  metricCard: { flex: 1, borderRadius: 28, padding: 22, minHeight: 140 },
  metricOrange: { backgroundColor: '#FF6B00', justifyContent: 'center' },
  metricDark: { backgroundColor: '#1E1E1E', justifyContent: 'center' },
  metricIcon: { marginBottom: 12 },
  
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },

  sectionHeader: { marginBottom: 16 },
  
  meals: { gap: 16, marginBottom: 24 },
  mealWrapper: { borderRadius: 24, backgroundColor: '#1E1E1E', overflow: 'hidden' },
  mealWrapperDone: { borderWidth: 2, borderColor: '#42D392' },
  
  mealBg: { width: '100%', height: 160 },
  mealOverlay: { flex: 1, padding: 16, justifyContent: 'space-between' },
  mealTop: { flexDirection: 'row', justifyContent: 'space-between' },
  mealTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  doneBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#42D392', alignItems: 'center', justifyContent: 'center' },
  
  mealBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  dietCalBadge: { backgroundColor: '#FF6B00', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  dietCalText: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },

  details: { padding: 20, backgroundColor: '#1E1E1E' },
  substitution: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, backgroundColor: '#111111', borderWidth: 2, borderColor: 'transparent' },
  substitutionActive: { borderColor: '#FF6B00', backgroundColor: 'rgba(255,107,0,0.05)' },
  subNote: { marginTop: 4 },
  subCalBadge: { backgroundColor: 'rgba(255,107,0,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  
  logButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, paddingVertical: 16, borderRadius: 16, backgroundColor: '#FF6B00' },
  logButtonDone: { backgroundColor: 'rgba(66,211,146,0.15)' },
  logText: { marginLeft: 8 },
});
