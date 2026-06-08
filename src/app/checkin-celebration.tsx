import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useGameStore } from '@/store/useGameStore';

export default function CheckInCelebrationScreen() {
  const router = useRouter();
  const { streak, latestCheckIn } = useGameStore();
  const [scale] = useState(() => new Animated.Value(0.5));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 75, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Animated.View style={[styles.flame, { opacity, transform: [{ scale }] }]}><Ionicons name="flame" size={100} color={Colors.dark.primary} /></Animated.View>
          <Typography variant="caption" color={Colors.dark.primary} weight="700">WEEKLY CHECK-IN COMPLETE</Typography>
          <Typography variant="h1" align="center" style={styles.title}>{streak}-day streak!</Typography>
          <Typography variant="body" align="center" color={Colors.dark.textSecondary}>You showed up, logged honestly, and kept your roadmap current.</Typography>
        </View>
        <Animated.View style={{ opacity }}>
          <View style={styles.rewards}>
            <Reward icon="flash" value="+60 XP" label="Experience" />
            <Reward icon="disc" value="+10" label="Sweat Coins" />
            <Reward icon="camera" value={latestCheckIn?.hasPhoto ? 'Added' : 'Skipped'} label="Progress photo" />
          </View>
          <View style={styles.summary}>
            <Typography variant="body" weight="700">Roadmap updated</Typography>
            <Typography variant="caption" style={styles.summaryText}>Your next prediction now reflects your actual weight, measurements, recovery, and weekly consistency.</Typography>
          </View>
          <CustomButton title="View Progress Report" onPress={() => router.replace('/progress')} showArrow />
          <CustomButton title="Back to Dashboard" onPress={() => router.replace('/')} variant="secondary" />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function Reward({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return <View style={styles.reward}><Ionicons name={icon} size={24} color={Colors.dark.primary} /><Typography variant="h3" style={styles.rewardValue}>{value}</Typography><Typography variant="caption" align="center">{label}</Typography></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flame: { width: 190, height: 190, borderRadius: 95, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,102,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.4)', marginBottom: 24 },
  title: { fontSize: 40, marginTop: 10 },
  rewards: { flexDirection: 'row', gap: 10 },
  reward: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', backgroundColor: Colors.dark.backgroundElement },
  rewardValue: { fontSize: 18, marginTop: 10 },
  summary: { padding: 18, borderRadius: 16, marginTop: 14, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)' },
  summaryText: { marginTop: 8, lineHeight: 19 },
});
