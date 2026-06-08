import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { measurements, setMeasurements } = useOnboardingStore();
  const [height, setHeight] = useState(measurements.height?.toString() ?? '');
  const [waist, setWaist] = useState(measurements.waist?.toString() ?? '');
  const [bodyFat, setBodyFat] = useState(measurements.bodyFat?.toString() ?? '');

  const continueFlow = () => {
    setMeasurements({
      height: Number(height),
      waist: Number(waist),
      bodyFat: bodyFat ? Number(bodyFat) : null,
    });
    router.push('/assessment/timeline');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={14} totalSteps={17} onBack={() => router.back()} />
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Add your body measurements
        </Typography>
        <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.subtitle}>
          These give your prototype prediction a realistic starting point.
        </Typography>
        <Field label="Height" unit="cm" value={height} onChangeText={setHeight} />
        <Field label="Waist" unit="cm" value={waist} onChangeText={setWaist} />
        <Field label="Body fat" unit="% optional" value={bodyFat} onChangeText={setBodyFat} />
        <View style={styles.spacer} />
        <CustomButton title="Continue" onPress={continueFlow} disabled={!height || !waist} showArrow />
      </View>
    </SafeAreaView>
  );
}

function Field({ label, unit, value, onChangeText }: { label: string; unit: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <View>
        <Typography variant="body" weight="600">{label}</Typography>
        <Typography variant="caption">{unit}</Typography>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={Colors.dark.textSecondary}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24 },
  title: { marginTop: 20, marginBottom: 8 },
  subtitle: { lineHeight: 22, marginBottom: 32 },
  field: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: { color: Colors.dark.text, fontSize: 26, fontWeight: '700', minWidth: 100, textAlign: 'right' },
  spacer: { flex: 1 },
});
