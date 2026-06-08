import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useGameStore } from '@/store/useGameStore';

export default function RewardScreen() {
  const router = useRouter();
  const { xp, streak } = useGameStore();
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const levelProgress = (xp % 250) / 250;
  const [glowScale] = useState(() => new Animated.Value(0.65));
  const [contentY] = useState(() => new Animated.Value(36));
  const [contentOpacity] = useState(() => new Animated.Value(0));
  const [xpProgress] = useState(() => new Animated.Value(0));
  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    const listener = xpProgress.addListener(({ value }) => setDisplayXp(Math.round(value * 120)));
    Animated.sequence([
      Animated.spring(glowScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(contentY, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(xpProgress, { toValue: 1, duration: 1100, useNativeDriver: false }),
      ]),
    ]).start();
    return () => xpProgress.removeListener(listener);
  }, [contentOpacity, contentY, glowScale, xpProgress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.celebration}>
          <Animated.View style={[styles.glow, { transform: [{ scale: glowScale }] }]}>
            <View style={styles.innerGlow}><Ionicons name="trophy" size={88} color={Colors.dark.primary} /></View>
          </Animated.View>
          <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }], alignItems: 'center' }}>
            <Typography variant="caption" color={Colors.dark.primary} weight="700">MISSION COMPLETE</Typography>
            <Typography variant="h1" align="center" style={styles.title}>Strong work.</Typography>
            <Typography variant="body" align="center" color={Colors.dark.textSecondary}>Your consistency just moved your future self closer.</Typography>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }] }}>
          <View style={styles.xpBurst}>
            <Ionicons name="flash" size={26} color={Colors.dark.primary} />
            <Typography variant="h1" color={Colors.dark.primary} style={styles.xpValue}>+{displayXp} XP</Typography>
          </View>
          <View style={styles.rewards}>
            <Reward icon="disc" value="+25" label="Sweat Coins" />
            <Reward icon="flame" value={`${streak} days`} label="Current streak" />
            <Reward icon="barbell" value="12 sets" label="Volume logged" />
          </View>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}><Typography variant="body" weight="700">Level {level}</Typography><Typography variant="caption">{xp} total XP</Typography></View>
            <View style={styles.track}><Animated.View style={[styles.fill, { width: xpProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${levelProgress * 100}%`] }) }]} /></View>
          </View>
          <View style={styles.actions}>
            <CustomButton title="Log Progress Check-in" onPress={() => router.replace('/checkin')} showArrow />
            <CustomButton title="Back to Dashboard" onPress={() => router.replace('/')} variant="secondary" />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function Reward({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return <View style={styles.reward}><Ionicons name={icon} size={25} color={Colors.dark.primary} /><Typography variant="h3" style={styles.rewardValue}>{value}</Typography><Typography variant="caption" align="center">{label}</Typography></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24 },
  celebration: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: { width: 190, height: 190, borderRadius: 95, marginBottom: 24, backgroundColor: 'rgba(255,102,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  innerGlow: { width: 145, height: 145, borderRadius: 73, backgroundColor: 'rgba(255,102,0,0.14)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 40, marginTop: 10 },
  xpBurst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  xpValue: { fontSize: 34, marginLeft: 8, marginBottom: 0 },
  rewards: { flexDirection: 'row', gap: 10 },
  reward: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  rewardValue: { fontSize: 18, marginTop: 10 },
  levelCard: { padding: 18, borderRadius: 16, marginTop: 14, backgroundColor: Colors.dark.backgroundElement },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  track: { height: 7, borderRadius: 4, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.dark.primary },
  actions: { marginTop: 6 },
});
