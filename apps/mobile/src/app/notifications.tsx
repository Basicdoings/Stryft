import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

const ITEMS = [
  { id: 'workout', icon: 'barbell-outline' as const, title: 'Mission ready', text: 'Full Body Foundation is ready when you are.', time: '8:00 AM' },
  { id: 'meal', icon: 'restaurant-outline' as const, title: 'Meal prep reminder', text: 'Prep Moi Moi and eggs for tomorrow morning.', time: '12:30 PM' },
  { id: 'checkin', icon: 'camera-outline' as const, title: 'Check-in approaching', text: 'Your weekly progress review is due Sunday.', time: 'Tomorrow' },
  { id: 'streak', icon: 'flame-outline' as const, title: 'Protect your streak', text: 'One short mission keeps your momentum alive.', time: '2 days' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [read, setRead] = useState<string[]>([]);
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="h2">Notifications</Typography><TouchableOpacity onPress={() => setRead(ITEMS.map((item) => item.id))}><Typography variant="caption" color={Colors.dark.primary} weight="700">Read all</Typography></TouchableOpacity></View>{ITEMS.map((item) => <TouchableOpacity key={item.id} style={[styles.item, read.includes(item.id) && styles.read]} onPress={() => setRead((current) => [...current, item.id])}><View style={styles.icon}><Ionicons name={item.icon} size={23} color={Colors.dark.primary} /></View><View style={styles.text}><Typography variant="body" weight="700">{item.title}</Typography><Typography variant="caption" style={styles.caption}>{item.text}</Typography><Typography variant="caption" color={Colors.dark.primary} style={styles.time}>{item.time}</Typography></View>{!read.includes(item.id) && <View style={styles.dot} />}</TouchableOpacity>)}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  item: { flexDirection: 'row', padding: 16, marginBottom: 10, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)' },
  read: { opacity: 0.62, borderColor: Colors.dark.border },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundSelected },
  text: { flex: 1, marginLeft: 12 },
  caption: { marginTop: 5, lineHeight: 18 },
  time: { marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.primary },
});
