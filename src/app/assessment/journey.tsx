import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const JOURNEYS = [
  {
    id: 'warrior',
    label: 'Warrior',
    description: 'High intensity, maximum results',
    icon: 'flame' as const,
    color: '#FF4500',
  },
  {
    id: 'athlete',
    label: 'Athlete',
    description: 'Balanced strength & endurance',
    icon: 'barbell' as const,
    color: Colors.dark.primary,
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Healthy, sustainable & steady',
    icon: 'leaf' as const,
    color: '#00C853',
  },
];

export default function JourneyScreen() {
  const router = useRouter();
  const { journey, setJourney, completeOnboarding } = useOnboardingStore();
  const [selected, setSelected] = useState<string | null>(journey);

  const handleContinue = () => {
    if (selected) {
      setJourney(selected);
      completeOnboarding();
      router.replace('/');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Choose your Journey
        </Typography>
        <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.subtitle}>
          This helps us showcase the workout plans best for you.
        </Typography>

        <View style={styles.cardsRow}>
          {JOURNEYS.map((journey) => {
            const isSelected = selected === journey.id;
            return (
              <TouchableOpacity
                key={journey.id}
                style={[
                  styles.journeyCard,
                  isSelected && { borderColor: journey.color, borderWidth: 2 },
                ]}
                onPress={() => setSelected(journey.id)}
                activeOpacity={0.8}
              >
                {/* Glow bg */}
                {isSelected && (
                  <View
                    style={[
                      styles.cardGlow,
                      { backgroundColor: journey.color + '22' },
                    ]}
                  />
                )}

                <View style={[styles.iconCircle, { backgroundColor: journey.color + '22' }]}>
                  <Ionicons name={journey.icon} size={32} color={journey.color} />
                </View>

                <Typography
                  variant="h3"
                  align="center"
                  color={isSelected ? journey.color : Colors.dark.text}
                  style={styles.cardLabel}
                >
                  {journey.label}
                </Typography>
                <Typography
                  variant="caption"
                  align="center"
                  style={styles.cardDesc}
                >
                  {journey.description}
                </Typography>

                {isSelected && (
                  <View style={[styles.selectedTick, { backgroundColor: journey.color }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Prefer to skip this"
            onPress={handleSkip}
            variant="secondary"
          />
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
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
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 40,
    lineHeight: 22,
    maxWidth: 280,
    alignSelf: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flex: 1,
  },
  journeyCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardDesc: {
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 11,
  },
  selectedTick: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 16,
    gap: 0,
  },
});
