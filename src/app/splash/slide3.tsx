import React from 'react';
import { useRouter } from 'expo-router';
import { SplashSlide } from '@/components/SplashSlide';

export default function SplashSlide3() {
  const router = useRouter();
  return (
    <SplashSlide
      headline="Your Transformation Starts Today"
      subtext="Personalized meal plans, smart workout programs, and AI coaching — all in one place."
      dotIndex={2}
      totalDots={3}
      onContinue={() => router.replace('/auth/signin')}
      onSkip={() => router.replace('/auth/signin')}
    />
  );
}
