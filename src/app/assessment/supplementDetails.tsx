import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { SelectionCard } from '@/components/SelectionCard';
import { CustomButton } from '@/components/CustomButton';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const OPTIONS = ['Protein Powder', 'Creatine', 'Pre-workout', 'Multivitamin', 'BCAAs', 'Other'];

export default function SupplementDetailsScreen() {
  const router = useRouter();
  const { supplements, setSupplements } = useOnboardingStore();

  const toggle = (value: string) => {
    setSupplements(
      supplements.includes(value)
        ? supplements.filter((item) => item !== value)
        : [...supplements, value],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={11} totalSteps={17} onBack={() => router.back()} />
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Specify the supplements you are on
        </Typography>
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {OPTIONS.map((option) => (
            <SelectionCard
              key={option}
              title={option}
              selected={supplements.includes(option)}
              onPress={() => toggle(option)}
            />
          ))}
        </ScrollView>
        <CustomButton
          title="Continue"
          onPress={() => router.push('/assessment/calorieGoal')}
          disabled={supplements.length === 0}
          showArrow
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24 },
  title: { marginTop: 20, marginBottom: 32 },
  options: { flex: 1 },
});
