import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useGameStore } from '@/store/useGameStore';

const MOODS = [
  { id: 'Energized', icon: 'flash' as const },
  { id: 'Good', icon: 'happy-outline' as const },
  { id: 'Tired', icon: 'battery-half-outline' as const },
];

export default function CheckInScreen() {
  const router = useRouter();
  const { weight, measurements } = useOnboardingStore();
  const { latestCheckIn, submitCheckIn } = useGameStore();
  const [currentWeight, setCurrentWeight] = useState(latestCheckIn?.weight.toString() ?? weight.value?.toString() ?? '');
  const [waist, setWaist] = useState(latestCheckIn?.waist?.toString() ?? measurements.waist?.toString() ?? '');
  const [chest, setChest] = useState(latestCheckIn?.chest?.toString() ?? '');
  const [hips, setHips] = useState(latestCheckIn?.hips?.toString() ?? '');
  const [arms, setArms] = useState(latestCheckIn?.arms?.toString() ?? '');
  const [bodyFat, setBodyFat] = useState(latestCheckIn?.bodyFat?.toString() ?? measurements.bodyFat?.toString() ?? '');
  const [hasPhoto, setHasPhoto] = useState(latestCheckIn?.hasPhoto ?? false);
  const [mood, setMood] = useState(latestCheckIn?.mood ?? '');
  const [note, setNote] = useState(latestCheckIn?.note ?? '');
  const predictedWeight = Math.max(0, (weight.value ?? Number(currentWeight)) - 0.8);
  const predictedWaist = Math.max(0, (measurements.waist ?? Number(waist)) - 1.5);

  const submit = () => {
    submitCheckIn({
      weight: Number(currentWeight),
      waist: numberOrNull(waist),
      chest: numberOrNull(chest),
      hips: numberOrNull(hips),
      arms: numberOrNull(arms),
      bodyFat: numberOrNull(bodyFat),
      hasPhoto,
      mood,
      note,
    });
    router.replace('/checkin-celebration');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">WEEKLY CHECK-IN</Typography><View style={styles.back} /></View>
        <Typography variant="h1" style={styles.title}>How are you progressing?</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary} style={styles.subtitle}>Small, honest updates keep your roadmap useful.</Typography>

        <TouchableOpacity style={[styles.photoCard, hasPhoto && styles.photoAdded]} onPress={() => setHasPhoto(!hasPhoto)}>
          <View style={styles.photoPreview}><Ionicons name={hasPhoto ? 'body' : 'camera-outline'} size={34} color={Colors.dark.primary} /></View>
          <View style={styles.photoText}><Typography variant="body" weight="700">{hasPhoto ? 'Progress photo added' : 'Add progress photo'}</Typography><Typography variant="caption">{hasPhoto ? 'Front-view mock upload ready' : 'Mock upload · front view recommended'}</Typography></View>
          <Typography variant="caption" color={Colors.dark.primary} weight="700">{hasPhoto ? 'Remove' : 'Add'}</Typography>
        </TouchableOpacity>

        <Typography variant="body" weight="700" style={styles.sectionTitle}>Weight and measurements</Typography>
        <View style={styles.fields}>
          <Field label={`Weight (${weight.unit})`} value={currentWeight} onChangeText={setCurrentWeight} />
          <Field label="Waist (cm)" value={waist} onChangeText={setWaist} />
          <Field label="Chest (cm)" value={chest} onChangeText={setChest} />
          <Field label="Hips (cm)" value={hips} onChangeText={setHips} />
          <Field label="Arms (cm)" value={arms} onChangeText={setArms} />
          <Field label="Body fat (%)" value={bodyFat} onChangeText={setBodyFat} />
        </View>

        <Typography variant="body" weight="700" style={styles.sectionTitle}>Predicted vs actual</Typography>
        <View style={styles.comparison}>
          <Comparison label="Weight" predicted={`${predictedWeight.toFixed(1)} ${weight.unit}`} actual={currentWeight ? `${currentWeight} ${weight.unit}` : '--'} />
          <Comparison label="Waist" predicted={`${predictedWaist.toFixed(1)} cm`} actual={waist ? `${waist} cm` : '--'} />
        </View>

        <Typography variant="body" weight="700" style={styles.sectionTitle}>How did this week feel?</Typography>
        <View style={styles.moods}>{MOODS.map((item) => <TouchableOpacity key={item.id} style={[styles.mood, mood === item.id && styles.moodActive]} onPress={() => setMood(item.id)}><Ionicons name={item.icon} size={24} color={mood === item.id ? Colors.dark.primary : Colors.dark.textSecondary} /><Typography variant="caption" weight="700" style={styles.moodLabel}>{item.id}</Typography></TouchableOpacity>)}</View>

        <Typography variant="body" weight="700" style={styles.sectionTitle}>Progress note</Typography>
        <TextInput value={note} onChangeText={setNote} placeholder="What felt easier? What was difficult?" placeholderTextColor={Colors.dark.textSecondary} multiline style={styles.note} />
        <CustomButton title="Complete Check-in" onPress={submit} disabled={!currentWeight || !mood} showArrow />
      </ScrollView>
    </SafeAreaView>
  );
}

function numberOrNull(value: string) {
  return value ? Number(value) : null;
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View style={styles.field}><Typography variant="caption">{label}</Typography><TextInput value={value} onChangeText={onChangeText} keyboardType="decimal-pad" placeholder="--" placeholderTextColor={Colors.dark.textSecondary} style={styles.fieldInput} /></View>;
}

function Comparison({ label, predicted, actual }: { label: string; predicted: string; actual: string }) {
  return <View style={styles.comparisonRow}><Typography variant="body" weight="700" style={styles.comparisonLabel}>{label}</Typography><View><Typography variant="caption">Predicted</Typography><Typography variant="body" weight="700">{predicted}</Typography></View><View><Typography variant="caption">Actual</Typography><Typography variant="body" color={Colors.dark.primary} weight="700">{actual}</Typography></View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  subtitle: { lineHeight: 22 },
  photoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 24, borderRadius: 16, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  photoAdded: { borderColor: '#42D392', backgroundColor: 'rgba(66,211,146,0.08)' },
  photoPreview: { width: 58, height: 72, borderRadius: 15, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  photoText: { flex: 1, marginLeft: 14 },
  sectionTitle: { marginTop: 26, marginBottom: 12 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  field: { width: '48%', padding: 16, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  fieldInput: { color: Colors.dark.text, fontSize: 25, fontWeight: '700', marginTop: 8 },
  comparison: { borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, overflow: 'hidden' },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  comparisonLabel: { flex: 1 },
  moods: { flexDirection: 'row', gap: 10 },
  mood: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', backgroundColor: Colors.dark.backgroundElement, borderWidth: 1, borderColor: Colors.dark.border },
  moodActive: { borderColor: Colors.dark.primary, backgroundColor: 'rgba(255,102,0,0.08)' },
  moodLabel: { marginTop: 8 },
  note: { minHeight: 110, borderRadius: 16, padding: 16, color: Colors.dark.text, backgroundColor: Colors.dark.backgroundElement, textAlignVertical: 'top' },
});
