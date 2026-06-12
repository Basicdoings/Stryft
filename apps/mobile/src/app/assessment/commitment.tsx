import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function CommitmentScreen() {
  const router = useRouter();
  const { daysPerWeek, setDaysPerWeek } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/assessment/mealExceptions');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={7} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          How many days/wk will you commit?
        </Typography>
        
        <View style={styles.levelContainer}>
          <Typography variant="h1" align="center" style={styles.hugeNumber}>
            {daysPerWeek}x
          </Typography>

          <View style={styles.pickerRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.circleBtn,
                  daysPerWeek === num && styles.circleBtnSelected
                ]}
                onPress={() => setDaysPerWeek(num)}
              >
                <Typography 
                  variant="body" 
                  weight={daysPerWeek === num ? 'bold' : 'normal'}
                  color={daysPerWeek === num ? Colors.dark.text : Colors.dark.textSecondary}
                >
                  {num}
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
