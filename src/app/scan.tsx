import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';

export default function ScanScreen() {
  const router = useRouter();
  const [captured, setCaptured] = useState(false);
  const [consent, setConsent] = useState(false);
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">BODY SCAN</Typography><View style={styles.back} /></View><Typography variant="h1" style={styles.title}>Guided photo capture</Typography><Typography variant="body" color={Colors.dark.textSecondary}>Prototype alignment and privacy flow for body analysis.</Typography><View style={[styles.camera, captured && styles.captured]}><View style={styles.guide}><Ionicons name={captured ? 'checkmark-circle' : 'body-outline'} size={150} color={captured ? '#42D392' : Colors.dark.textSecondary} /></View><Typography variant="caption">{captured ? 'Front view captured' : 'Fit your full body inside the guide'}</Typography></View><View style={styles.instructions}>{['Form-fitting clothing', 'Plain background and good lighting', 'Camera 6-8 feet away', 'Arms relaxed at your sides'].map((text) => <View key={text} style={styles.instruction}><Ionicons name="checkmark-circle-outline" size={19} color={Colors.dark.primary} /><Typography variant="caption" style={styles.instructionText}>{text}</Typography></View>)}</View><TouchableOpacity style={styles.consent} onPress={() => setConsent(!consent)}><View style={[styles.checkbox, consent && styles.checkboxActive]}>{consent && <Ionicons name="checkmark" size={15} color={Colors.dark.text} />}</View><Typography variant="caption" style={styles.consentText}>I consent to secure prototype photo processing. Photos are not actually uploaded.</Typography></TouchableOpacity><CustomButton title={captured ? 'Retake Photo' : 'Capture Mock Photo'} onPress={() => setCaptured(!captured)} disabled={!consent} /><CustomButton title="View Future-Self Prediction" onPress={() => router.replace('/future-self')} variant="secondary" disabled={!captured} showArrow /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundElement },
  title: { fontSize: 34, lineHeight: 40 },
  camera: { height: 340, borderRadius: 22, marginTop: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#191919', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.dark.border },
  captured: { borderColor: '#42D392' },
  guide: { width: 200, height: 270, borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 12 },
  instructions: { gap: 10, marginTop: 20 },
  instruction: { flexDirection: 'row', alignItems: 'center' },
  instructionText: { marginLeft: 9 },
  consent: { flexDirection: 'row', padding: 14, marginTop: 18, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  consentText: { flex: 1, marginLeft: 10, lineHeight: 18 },
});
