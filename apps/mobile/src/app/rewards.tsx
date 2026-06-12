import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { REWARD_TRACK } from '@/constants/gameContent';
import { useGameStore } from '@/store/useGameStore';

export default function RewardsScreen() {
  const router = useRouter();
  const { xp, claimedRewards, claimReward } = useGameStore();
  const level = Math.max(1, Math.floor(xp / 250) + 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">LEVEL REWARDS</Typography><View style={styles.back}><Ionicons name="trophy-outline" size={20} color={Colors.dark.text} /></View></View>
        <Typography variant="h1" style={styles.title}>Your reward path</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Level up through missions, meals, and weekly check-ins.</Typography>
        <View style={styles.current}><View><Typography variant="caption">CURRENT LEVEL</Typography><Typography variant="h2" style={styles.currentValue}>Level {level}</Typography></View><Ionicons name="ribbon" size={44} color={Colors.dark.primary} /></View>
        <View style={styles.track}>
          {REWARD_TRACK.map((reward, index) => {
            const unlocked = level >= reward.level;
            const claimed = claimedRewards.includes(reward.id);
            return (
              <View key={reward.id} style={styles.rewardRow}>
                <View style={styles.rail}><View style={[styles.node, unlocked && styles.nodeUnlocked]}>{unlocked ? <Ionicons name="checkmark" size={17} color={Colors.dark.text} /> : <Typography variant="caption" weight="700">{reward.level}</Typography>}</View>{index < REWARD_TRACK.length - 1 && <View style={[styles.line, unlocked && styles.lineUnlocked]} />}</View>
                <View style={[styles.rewardCard, !unlocked && styles.locked]}>
                  <View style={styles.rewardIcon}><Ionicons name={unlocked ? 'gift-outline' : 'lock-closed-outline'} size={25} color={unlocked ? Colors.dark.primary : Colors.dark.textSecondary} /></View>
                  <View style={styles.rewardText}><Typography variant="caption">LEVEL {reward.level}</Typography><Typography variant="body" weight="700" style={styles.rewardName}>{reward.reward}</Typography><Typography variant="caption">Bonus: {reward.coins} coins</Typography></View>
                  <TouchableOpacity style={[styles.claim, (!unlocked || claimed) && styles.claimDisabled]} disabled={!unlocked || claimed} onPress={() => claimReward(reward.id, reward.coins)}><Typography variant="caption" weight="700" color={unlocked && !claimed ? Colors.dark.text : Colors.dark.textSecondary}>{claimed ? 'Claimed' : unlocked ? 'Claim' : 'Locked'}</Typography></TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  current: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 18, marginTop: 24, backgroundColor: 'rgba(255,102,0,0.09)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  currentValue: { marginTop: 5 },
  track: { marginTop: 24 },
  rewardRow: { flexDirection: 'row' },
  rail: { width: 42, alignItems: 'center' },
  node: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
  nodeUnlocked: { backgroundColor: Colors.dark.primary },
  line: { flex: 1, width: 3, minHeight: 85, backgroundColor: Colors.dark.backgroundSelected },
  lineUnlocked: { backgroundColor: Colors.dark.primary },
  rewardCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 14, backgroundColor: Colors.dark.backgroundElement },
  locked: { opacity: 0.55 },
  rewardIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.dark.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
  rewardText: { flex: 1, marginLeft: 12 },
  rewardName: { marginVertical: 3 },
  claim: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 13, backgroundColor: Colors.dark.primary },
  claimDisabled: { backgroundColor: Colors.dark.backgroundSelected },
});
