import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

const ITEMS = ['I understand Stryft is not medical advice.', 'I will stop exercise if I experience sharp pain, dizziness, or unusual symptoms.', 'I will consult a healthcare provider before starting when appropriate.', 'I understand results and predictions may vary.'];

export default function SafetyScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState<string[]>([]);
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">SAFETY & LEGAL</Typography><View style={styles.back}><Ionicons name="shield-checkmark-outline" size={20} color={Colors.dark.text} /></View></View><Typography variant="h1" style={styles.title}>Train safely</Typography><Typography variant="body" color={Colors.dark.textSecondary}>Health-readiness and disclaimer prototype aligned with the PRD.</Typography><View style={styles.warning}><Ionicons name="medical-outline" size={28} color={Colors.dark.primary} /><View style={styles.warningText}><Typography variant="body" weight="700">Physical limitations matter</Typography><Typography variant="caption">Review limitations in Profile before starting a mission. Exercise alternatives remain available during workouts.</Typography></View></View><View style={styles.list}>{ITEMS.map((item) => <TouchableOpacity key={item} style={styles.item} onPress={() => setAccepted((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}><View style={[styles.check, accepted.includes(item) && styles.checked]}>{accepted.includes(item) && <Ionicons name="checkmark" size={16} color={Colors.dark.text} />}</View><Typography variant="body" style={styles.itemText}>{item}</Typography></TouchableOpacity>)}</View><View style={styles.links}><Typography variant="body" weight="700">Legal documents</Typography>{['Terms of Service', 'Privacy Policy', 'Data ownership and deletion', 'Community guidelines'].map((value) => <TouchableOpacity key={value} style={styles.link}><Typography variant="caption" color={Colors.dark.primary} weight="700">{value}</Typography><Ionicons name="open-outline" size={17} color={Colors.dark.primary} /></TouchableOpacity>)}</View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  title: { fontSize: 34, lineHeight: 40 },
  warning: { flexDirection: 'row', padding: 18, marginTop: 24, borderRadius: 18, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)' },
  warningText: { flex: 1, marginLeft: 12, gap: 5 },
  list: { gap: 10, marginTop: 20 },
  item: { flexDirection: 'row', padding: 15, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  check: { width: 25, height: 25, borderRadius: 8, borderWidth: 2, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  itemText: { flex: 1, marginLeft: 11, lineHeight: 21 },
  links: { padding: 18, marginTop: 24, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement },
  link: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16 },
});
