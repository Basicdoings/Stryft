import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';

const FEATURES = ['Unlimited future-self scans', 'Localized AI meal regeneration', 'Advanced progress analytics', 'Social guilds and premium challenges', 'Exclusive avatar cosmetics'];

export default function PremiumScreen() {
  const router = useRouter();
  const [annual, setAnnual] = useState(true);
  const [message, setMessage] = useState('');
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="close" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">STRYFT PREMIUM</Typography><View style={styles.back}><Ionicons name="diamond" size={20} color={Colors.dark.primary} /></View></View><View style={styles.hero}><View style={styles.diamond}><Ionicons name="diamond" size={62} color={Colors.dark.primary} /></View><Typography variant="h1" align="center">Unlock the full roadmap</Typography><Typography variant="body" align="center" color={Colors.dark.textSecondary}>A monetization prototype based on the product documentation.</Typography></View><View style={styles.segment}>{['Monthly', 'Annual'].map((value) => <TouchableOpacity key={value} style={[styles.segmentItem, annual === (value === 'Annual') && styles.segmentActive]} onPress={() => setAnnual(value === 'Annual')}><Typography variant="body" weight="700">{value}</Typography></TouchableOpacity>)}</View><View style={styles.price}><Typography variant="h1">${annual ? '79.99' : '9.99'}</Typography><Typography variant="caption">/{annual ? 'year' : 'month'} · cancel anytime</Typography></View><View style={styles.features}>{FEATURES.map((feature) => <View key={feature} style={styles.feature}><Ionicons name="checkmark-circle" size={21} color="#42D392" /><Typography variant="body" style={styles.featureText}>{feature}</Typography></View>)}</View><CustomButton title="Start Premium Prototype" onPress={() => setMessage('Premium checkout requires backend billing integration.')} showArrow />{!!message && <Typography variant="caption" align="center" color={Colors.dark.primary}>{message}</Typography>}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  hero: { alignItems: 'center', paddingVertical: 36 },
  diamond: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: 'rgba(255,102,0,0.12)' },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement },
  segmentItem: { flex: 1, padding: 13, borderRadius: 15, alignItems: 'center' },
  segmentActive: { backgroundColor: Colors.dark.primary },
  price: { alignItems: 'center', padding: 22 },
  features: { padding: 18, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement, gap: 15 },
  feature: { flexDirection: 'row', alignItems: 'center' },
  featureText: { marginLeft: 10 },
});
