import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashSlideProps {
  headline: string;
  subtext: string;
  onContinue: () => void;
  onSkip: () => void;
  dotIndex: number;
  totalDots: number;
}

export function SplashSlide({
  headline,
  subtext,
  onContinue,
  onSkip,
  dotIndex,
  totalDots,
}: SplashSlideProps) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      {/* IMAGE PLACEHOLDER — replace View below with <Image source={...} style={styles.heroImage} /> */}
      <View style={styles.heroImage} />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(18,18,18,0.6)', Colors.dark.background]}
        style={styles.gradient}
        locations={[0.3, 0.65, 1]}
      />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <Typography variant="caption" color={Colors.dark.textSecondary}>Skip</Typography>
      </TouchableOpacity>

      {/* Bottom content */}
      <Animated.View
        style={[
          styles.bottomContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Typography variant="h2" align="center" style={styles.headline}>
          {headline}
        </Typography>
        <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.subtext}>
          {subtext}
        </Typography>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === dotIndex && styles.dotActive]}
            />
          ))}
        </View>

        <CustomButton title="Continue" onPress={onContinue} showArrow />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  heroImage: {
    width,
    height: height * 0.65,
    backgroundColor: Colors.dark.backgroundElement, // Replace with your Image
  },
  gradient: {
    position: 'absolute',
    top: height * 0.25,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  headline: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 12,
  },
  subtext: {
    lineHeight: 22,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.dark.primary,
  },
});
