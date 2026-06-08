import React from 'react';
import { useRouter } from 'expo-router';
import { SplashSlide } from '@/components/SplashSlide';

export default function SplashSlide1() {
  const router = useRouter();
  return (
    <SplashSlide
      headline="See Your Future Body Before You Start"
      subtext="Visualize your transformation with AI-powered 3D body predictions tailored to your goals."
      dotIndex={0}
      totalDots={3}
      onContinue={() => router.push('/splash/slide2')}
      onSkip={() => router.replace('/auth/signin')}
    />
  );
}
