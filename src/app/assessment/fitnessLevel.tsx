import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

const LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Novice' },
  { value: 3, label: 'Intermediate' },
  { value: 4, label: 'Advanced' },
  { value: 5, label: 'Elite' },
];

export default function FitnessLevelScreen() {
  const router = useRouter();
  const { fitnessLevel, setFitnessLevel } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/assessment/limitations');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={5} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          How would you rate your fitness level?
        </Typography>
        
        <View style={styles.levelContainer}>
          <Typography variant="h1" align="center" style={styles.hugeNumber}>
            {fitnessLevel}
          </Typography>
          <Typography variant="h3" align="center" color={Colors.dark.primary}>
            {LEVELS.find(l => l.value === fitnessLevel)?.label}
          </Typography>

          <View style={styles.pickerRow}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.circleBtn,
                  fitnessLevel === level.value && styles.circleBtnSelected
                ]}
                onPress={() => setFitnessLevel(level.value)}
              >
                <Typography 
                  variant="body" 
                  weight={fitnessLevel === level.value ? 'bold' : 'normal'}
                  color={fitnessLevel === level.value ? Colors.dark.text : Colors.dark.textSecondary}
                >
                  {level.value}
                </Typography>
              </TouchableOpacity>
            ))}
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
  levelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hugeNumber: {
    fontSize: 96,
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    marginTop: 50,
    justifyContent: 'space-between',
    width: '100%',
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnSelected: {
    backgroundColor: Colors.dark.primary,
  },
  footer: {
    paddingTop: 16,
  },
});
