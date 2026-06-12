import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

const ROUTES = [
  { name: 'Main App Tabs', path: '/(tabs)' },
  { name: 'Landing Screen', path: '/landing' },
  { name: 'Sign In', path: '/auth/signin' },
  { name: 'Sign Up', path: '/auth/signup' },
  { name: 'Forgot Password', path: '/auth/forgot' },
  { name: 'Avatar 3D Studio', path: '/avatar' },
  { name: 'Mission (Workout)', path: '/mission' },
  { name: 'Meals (Nutrition)', path: '/meals' },
  { name: 'Check-in Flow', path: '/checkin' },
  { name: 'Rewards / Store', path: '/rewards' },
  { name: 'Future Self 3D', path: '/future-self' },
  { name: 'Onboarding Start', path: '/assessment/gender' },
];

export default function SitemapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" color="#FFF">Developer Sitemap</Typography>
          <Typography variant="body" color={Colors.dark.textSecondary}>
            Manually navigate and style screens.
          </Typography>
        </View>

        <View style={styles.grid}>
          {ROUTES.map((route) => (
            <View key={route.path} style={styles.buttonWrapper}>
              <CustomButton
                title={route.name}
                onPress={() => router.push(route.path as any)}
                variant="secondary"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  grid: {
    gap: 16,
  },
  buttonWrapper: {
    width: '100%',
  },
});
