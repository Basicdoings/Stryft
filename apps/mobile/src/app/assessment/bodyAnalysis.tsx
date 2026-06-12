import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ANALYSIS_ITEMS = [
  { label: 'Analyzing body composition...', icon: 'body-outline' as const },
  { label: 'Calculating calorie targets...', icon: 'flame-outline' as const },
  { label: 'Building workout plan...', icon: 'barbell-outline' as const },
  { label: 'Generating meal plan...', icon: 'nutrition-outline' as const },
  { label: 'Creating transformation roadmap...', icon: 'trending-up-outline' as const },
];

export default function BodyAnalysisScreen() {
  const router = useRouter();
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [itemAnims] = useState(() => ANALYSIS_ITEMS.map(() => new Animated.Value(0)));

  useEffect(() => {
    // Pulse animation for center circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Progress bar fill over 5s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    // Stagger checklist items
    const itemSequence = itemAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 900,
        useNativeDriver: true,
      })
    );
    Animated.stagger(900, itemSequence).start();

    // Navigate after analysis
    const timer = setTimeout(() => {
      router.replace('/assessment/prediction');
    }, 5500);

    return () => clearTimeout(timer);
  }, [itemAnims, progressAnim, pulseAnim, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Body Analysis
        </Typography>
        <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.subtitle}>
          Hold on, we are getting everything ready for you now...
        </Typography>

        {/* Pulsing orb */}
        <View style={styles.orbContainer}>
          <Animated.View style={[styles.orbOuter, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.orbMiddle}>
              <View style={styles.orbInner}>
                <Ionicons name="body" size={48} color={Colors.dark.primary} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Analysis checklist */}
        <View style={styles.checklist}>
          {ANALYSIS_ITEMS.map((item, index) => (
            <Animated.View
              key={item.label}
              style={[styles.checkItem, { opacity: itemAnims[index] }]}
            >
              <Ionicons name={item.icon} size={18} color={Colors.dark.primary} />
              <Typography variant="body" color={Colors.dark.textSecondary} style={styles.checkLabel}>
                {item.label}
              </Typography>
            </Animated.View>
          ))}
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
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 40,
    maxWidth: 280,
    lineHeight: 22,
  },
  orbContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 102, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbMiddle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  checklist: {
    width: '100%',
    gap: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkLabel: {
    fontSize: 14,
  },
});
