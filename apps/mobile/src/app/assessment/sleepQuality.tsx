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

const SLEEP_OPTIONS = [
  { id: 'Excellent', title: 'Excellent', subtitle: '7-9 hours' },
  { id: 'Good', title: 'Good', subtitle: '6-7 hours' },
  { id: 'Fair', title: 'Fair', subtitle: '5-6 hours' },
  { id: 'Poor', title: 'Poor', subtitle: '< 5 hours' },
];

export default function SleepQualityScreen() {
  const router = useRouter();
  const { sleepQuality, setSleepQuality } = useOnboardingStore();

  const handleContinue = () => {
    if (sleepQuality) {
      router.push('/assessment/measurements');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={13} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your sleep quality like?
        </Typography>
        
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {SLEEP_OPTIONS.map((item) => (
            <SelectionCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              selected={sleepQuality === item.id}
              onPress={() => setSleepQuality(item.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!sleepQuality}
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
