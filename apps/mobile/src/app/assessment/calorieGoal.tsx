import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CalorieGoalScreen() {
  const router = useRouter();
  const { calorieGoal, setCalorieGoal } = useOnboardingStore();
  
  const currentGoal = calorieGoal || 1550;

  const handleContinue = () => {
    setCalorieGoal(currentGoal);
    router.push('/assessment/sleepQuality');
  };

  const adjustCalories = (amount: number) => {
    setCalorieGoal(Math.min(4000, Math.max(1000, currentGoal + amount)));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={12} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is Your Calorie Goal per day?
        </Typography>
        
        <View style={styles.middleContainer}>
          <Typography variant="h1" align="center" style={styles.hugeNumber}>
            {currentGoal.toLocaleString()}
          </Typography>
          <Typography variant="body" align="center" color={Colors.dark.textSecondary}>
            calories daily
          </Typography>

          <View style={styles.adjustRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustCalories(-50)}>
              <Ionicons name="remove" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: Colors.dark.primary }]} onPress={() => adjustCalories(50)}>
              <Ionicons name="add" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            showArrow
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginTop: 20,
    marginBottom: 40,
  },
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hugeNumber: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  adjustRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 20,
  },
  adjustBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingTop: 16,
  },
});
