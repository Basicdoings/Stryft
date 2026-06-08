import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

const CHALLENGES = [
  { id: 'lagos', title: 'Lagos 30-Day Stryft', members: '2.4k athletes', reward: '300 coins', icon: 'flame-outline' as const },
  { id: 'steps', title: 'Weekend Step Quest', members: '846 athletes', reward: '100 XP', icon: 'walk-outline' as const },
  { id: 'meal', title: 'Local Meal Prep Guild', members: '512 athletes', reward: 'Rare badge', icon: 'restaurant-outline' as const },
];

export default function CommunityScreen() {
  const router = useRouter();
  const [joined, setJoined] = useState<string[]>([]);
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">COMMUNITY</Typography><View style={styles.back}><Ionicons name="people-outline" size={20} color={Colors.dark.text} /></View></View><Typography variant="h1" style={styles.title}>Challenges and guilds</Typography><Typography variant="body" color={Colors.dark.textSecondary}>Prototype social motivation with privacy-first profiles.</Typography><View style={styles.leader}><Ionicons name="trophy" size={42} color={Colors.dark.primary} /><View style={styles.leaderText}><Typography variant="body" weight="700">Weekly leaderboard</Typography><Typography variant="caption">You are #18 in Lagos Beginners</Typography></View><Typography variant="h3">#18</Typography></View>{CHALLENGES.map((challenge) => <View key={challenge.id} style={styles.card}><View style={styles.icon}><Ionicons name={challenge.icon} size={28} color={Colors.dark.primary} /></View><View style={styles.text}><Typography variant="body" weight="700">{challenge.title}</Typography><Typography variant="caption" style={styles.caption}>{challenge.members} · {challenge.reward}</Typography></View><TouchableOpacity style={[styles.join, joined.includes(challenge.id) && styles.joined]} onPress={() => setJoined((current) => current.includes(challenge.id) ? current.filter((id) => id !== challenge.id) : [...current, challenge.id])}><Typography variant="caption" weight="700">{joined.includes(challenge.id) ? 'Joined' : 'Join'}</Typography></TouchableOpacity></View>)}<View style={styles.note}><Ionicons name="shield-checkmark-outline" size={20} color={Colors.dark.primary} /><Typography variant="caption" style={styles.noteText}>Transformation duels and video verification are future concepts. This prototype does not upload or analyze media.</Typography></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  title: { fontSize: 34, lineHeight: 40 },
  leader: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, marginTop: 24, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)' },
  leaderText: { flex: 1, marginLeft: 14, gap: 5 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 12, borderRadius: 17, backgroundColor: Colors.dark.backgroundElement },
  icon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundSelected },
  text: { flex: 1, marginLeft: 12 },
  caption: { marginTop: 5 },
  join: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: Colors.dark.primary },
  joined: { backgroundColor: '#1E8E64' },
  note: { flexDirection: 'row', padding: 16, marginTop: 20, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  noteText: { flex: 1, marginLeft: 9, lineHeight: 18 },
});
