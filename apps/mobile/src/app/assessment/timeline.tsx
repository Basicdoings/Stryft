import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { SelectionCard } from '@/components/SelectionCard';
import { CustomButton } from '@/components/CustomButton';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const OPTIONS = [
  { weeks: 8, subtitle: 'Focused sprint' },
  { weeks: 12, subtitle: 'Recommended balance' },
  { weeks: 16, subtitle: 'Steady and sustainable' },
];

export default function TimelineScreen() {
  const router = useRouter();
  const { timelineWeeks, setTimelineWeeks } = useOnboardingStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={15} totalSteps={18} onBack={() => router.back()} />
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Choose your transformation timeline
        </Typography>
        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <SelectionCard
              key={option.weeks}
              title={`${option.weeks} weeks`}
              subtitle={option.subtitle}
              selected={timelineWeeks === option.weeks}
              onPress={() => setTimelineWeeks(option.weeks)}
            />
          ))}
        </View>
        <CustomButton
          title="Continue to Scan"
          onPress={() => router.push('/assessment/scan' as never)}
          disabled={!timelineWeeks}
          showArrow
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24 },
  title: { marginTop: 20, marginBottom: 40 },
  options: { flex: 1 },
});
