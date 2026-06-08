import React from 'react';
import { useRouter } from 'expo-router';
import { SplashSlide } from '@/components/SplashSlide';

export default function SplashSlide2() {
  const router = useRouter();
  return (
    <SplashSlide
      headline="AI Personal Body Predictions"
      subtext="Our engine analyzes your unique metrics to generate hyper-realistic results and a precise timeline."
      dotIndex={1}
      totalDots={3}
      onContinue={() => router.push('/splash/slide3')}
      onSkip={() => router.replace('/auth/signin')}
    />
  );
}
