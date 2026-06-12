import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.landing}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Ionicons name="flash" size={24} color={Colors.dark.text} /></View>
          <Typography variant="h3" weight="800">STRYFT</Typography>
        </View>
        <View style={styles.hero}>
          <Typography variant="caption" color={Colors.dark.primary} weight="700">YOUR FUTURE BODY, MAPPED</Typography>
          <Typography variant="h1" align="center" style={styles.heroTitle}>Build a plan that fits your body and your life.</Typography>
          <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.heroCopy}>
            Complete a short assessment to preview your personalized transformation roadmap.
          </Typography>
          <View style={styles.orbit}><Ionicons name="body" size={112} color={Colors.dark.primary} /></View>
        </View>
        <CustomButton title="Start Assessment" onPress={() => router.push('/assessment/gender')} showArrow />
        <TouchableOpacity onPress={() => router.push('/auth/signin')} style={styles.signIn}>
          <Typography variant="caption">Already have an account? <Typography variant="caption" color={Colors.dark.primary} weight="700">Sign in</Typography></Typography>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  landing: { flex: 1, padding: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 36, lineHeight: 43, marginTop: 14 },
  heroCopy: { lineHeight: 23, maxWidth: 330, marginTop: 10 },
  orbit: { width: 220, height: 220, borderRadius: 110, marginTop: 36, backgroundColor: 'rgba(255,102,0,0.10)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  signIn: { alignItems: 'center', paddingVertical: 8 },
});
