import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { SelectionCard } from '@/components/SelectionCard';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

const PREFERENCES = [
  { id: 'Cardio', title: 'Cardio' },
  { id: 'Weightlifting', title: 'Weightlifting' },
  { id: 'Yoga', title: 'Yoga' },
  { id: 'None', title: 'None' },
  { id: 'Other', title: 'Other' },
];

export default function ExercisePreferencesScreen() {
  const router = useRouter();
  const { exercisePreferences, setExercisePreferences } = useOnboardingStore();

  const handleContinue = () => {
    if (exercisePreferences.cardio) {
      router.push('/assessment/supplements');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={9} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Do you have a specific Exercise Preference?
        </Typography>
        
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {PREFERENCES.map((item) => (
            <SelectionCard
              key={item.id}
              title={item.title}
              selected={exercisePreferences.cardio === item.id}
              onPress={() => setExercisePreferences({ cardio: item.id })}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!exercisePreferences.cardio}
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
  options: {
    flex: 1,
  },
  footer: {
    paddingTop: 16,
  },
});
