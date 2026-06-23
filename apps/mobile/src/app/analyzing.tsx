import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

const PROCESSING_STEPS = [
  { icon: 'scan-outline', title: 'Analyzing Topology', detail: 'Extracting 3D geometry from 2D images...' },
  { icon: 'fitness-outline', title: 'Muscle Gain Estimates', detail: 'Calculating hypertrophic potential...' },
  { icon: 'restaurant-outline', title: 'Meal Suggestions', detail: 'Aligning macro ratios with goals...' },
  { icon: 'body-outline', title: 'Rigging Skeleton', detail: 'Applying Mixamo anatomical structure...' },
  { icon: 'sparkles-outline', title: 'Morph Target Simulation', detail: 'Preparing future self predictions...' },
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Simulate the backend processing delay (Tripo3D pipeline)
    // We cycle through the steps every 3 seconds.
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(interval);
          // When finished, route to the base body reveal
          setTimeout(() => router.replace('/body-model'), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const currentStep = PROCESSING_STEPS[stepIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <View style={styles.pulseRing}>
            <Ionicons name="scan-circle-outline" size={120} color={Colors.dark.primary} style={styles.icon} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Typography variant="h1" align="center" style={styles.mainTitle}>
            Processing Scan
          </Typography>
          
          <View style={styles.stepBox}>
            <Animated.View 
              key={stepIndex}
              entering={SlideInRight.duration(500)} 
              exiting={SlideOutLeft.duration(500)}
              style={styles.stepContent}
            >
              <Ionicons name={currentStep.icon as any} size={32} color={Colors.dark.primary} />
              <Typography variant="h3" style={styles.stepTitle}>
                {currentStep.title}
              </Typography>
              <Typography variant="caption" color={Colors.dark.textSecondary} align="center">
                {currentStep.detail}
              </Typography>
            </Animated.View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  animationContainer: { height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  pulseRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(66,211,146,0.05)',
  },
  icon: { opacity: 0.8 },
  textContainer: { width: '100%', alignItems: 'center' },
  mainTitle: { marginBottom: 32 },
  stepBox: {
    height: 140,
    width: '100%',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stepTitle: { marginTop: 12, marginBottom: 8 },
});
