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

const MALE_GOALS = [
  { id: 'Male Chest Development', title: 'Build Chest', subtitle: 'Chest size and upper-body definition', icon: 'shirt' as const },
  { id: 'Male Arms Development', title: 'Build Bigger Arms', subtitle: 'Biceps, triceps, and forearms', icon: 'barbell' as const },
  { id: 'Male Broad Shoulders', title: 'Broader Shoulders', subtitle: 'Shoulders, upper back, and V-taper', icon: 'body' as const },
  { id: 'Male Core Definition', title: 'Defined Abs & Core', subtitle: 'Reduce waist and improve core definition', icon: 'fitness' as const },
  { id: 'Male Lower Body', title: 'Build Legs', subtitle: 'Quads, hamstrings, calves, and glutes', icon: 'walk' as const },
  { id: 'Male Full Body', title: 'Full-Body Muscle', subtitle: 'Balanced strength and muscle development', icon: 'accessibility' as const },
];

const FEMALE_GOALS = [
  { id: 'Female Glutes Development', title: 'Build Glutes', subtitle: 'Glute size, shape, and lower-body strength', icon: 'body' as const },
  { id: 'Female Flat Tummy', title: 'Flat Tummy & Core', subtitle: 'Waist reduction and core definition', icon: 'fitness' as const },
  { id: 'Female Legs Development', title: 'Tone Legs & Thighs', subtitle: 'Quads, hamstrings, and calves', icon: 'walk' as const },
  { id: 'Female Upper Body Tone', title: 'Tone Arms & Upper Body', subtitle: 'Arms, shoulders, back, and posture', icon: 'barbell' as const },
  { id: 'Female Hourglass', title: 'Hourglass Shape', subtitle: 'Glutes, waist, shoulders, and posture', icon: 'woman' as const },
  { id: 'Female Full Body', title: 'Full-Body Tone', subtitle: 'Balanced body composition and strength', icon: 'accessibility' as const },
];

const NEUTRAL_GOALS = [
  { id: 'Neutral Muscle', title: 'Build Muscle', subtitle: 'Increase total-body strength and muscle', icon: 'barbell' as const },
  { id: 'Neutral Fat Loss', title: 'Lose Body Fat', subtitle: 'Improve overall body composition', icon: 'flame' as const },
  { id: 'Neutral Core', title: 'Strengthen Core', subtitle: 'Core strength, stability, and waist target', icon: 'fitness' as const },
  { id: 'Neutral Lower Body', title: 'Build Lower Body', subtitle: 'Glutes, legs, and lower-body strength', icon: 'walk' as const },
  { id: 'Neutral Upper Body', title: 'Build Upper Body', subtitle: 'Chest, back, shoulders, and arms', icon: 'body' as const },
  { id: 'Neutral Full Body', title: 'Improve Full-Body Fitness', subtitle: 'Balanced strength, endurance, and tone', icon: 'accessibility' as const },
];

export default function GoalScreen() {
  const router = useRouter();
  const { gender, primaryGoal, setPrimaryGoal } = useOnboardingStore();
  const goals = gender === 'Male' ? MALE_GOALS : gender === 'Female' ? FEMALE_GOALS : NEUTRAL_GOALS;

  const handleContinue = () => {
    if (primaryGoal) {
      router.push('/assessment/weight');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={2} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your primary body target?
        </Typography>
        <Typography variant="caption" align="center" style={styles.subtitle}>
          {gender === 'Male' ? 'Targets tailored for male body-transformation goals.' : gender === 'Female' ? 'Targets tailored for female body-transformation goals.' : 'Choose the body-transformation target that fits you best.'}
        </Typography>
        
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {goals.map((goal) => (
            <SelectionCard
              key={goal.id}
              title={goal.title}
              subtitle={goal.subtitle}
              selected={primaryGoal === goal.id}
              onPress={() => setPrimaryGoal(goal.id)}
              iconName={goal.icon}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!primaryGoal}
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
    marginBottom: 8,
  },
  subtitle: { marginBottom: 28, lineHeight: 19 },
  options: {
    flex: 1,
  },
  footer: {
    paddingTop: 16,
  },
});
