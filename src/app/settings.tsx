import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useOnboardingStore();
  const settings = useSettingsStore();
  const [accountMessage, setAccountMessage] = useState('');

  const changeUnit = (unit: 'kg' | 'lbs') => {
    if (unit === profile.weight.unit) return;
    const value = profile.weight.value;
    const converted = value === null ? null : Number((unit === 'lbs' ? value * 2.20462 : value / 2.20462).toFixed(1));
    profile.setWeight(converted, unit);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">SETTINGS</Typography><View style={styles.back} /></View>
        <Typography variant="h1" style={styles.title}>Preferences and control</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Prototype settings are stored locally for this session.</Typography>

        <Section title="Units" />
        <View style={styles.unitCard}><View><Typography variant="body" weight="700">Weight units</Typography><Typography variant="caption" style={styles.caption}>Measurements remain metric in this prototype</Typography></View><View style={styles.segment}>{(['kg', 'lbs'] as const).map((unit) => <TouchableOpacity key={unit} style={[styles.segmentButton, profile.weight.unit === unit && styles.segmentActive]} onPress={() => changeUnit(unit)}><Typography variant="caption" weight="700">{unit}</Typography></TouchableOpacity>)}</View></View>

        <Section title="Notifications" />
        <SettingToggle icon="barbell-outline" title="Workout reminders" subtitle="Mission start and missed-workout nudges" value={settings.notifications.workouts} onPress={() => settings.toggleNotification('workouts')} />
        <SettingToggle icon="restaurant-outline" title="Meal reminders" subtitle="Meal and preparation prompts" value={settings.notifications.meals} onPress={() => settings.toggleNotification('meals')} />
        <SettingToggle icon="camera-outline" title="Check-in reminders" subtitle="Weekly photo and measurement reminder" value={settings.notifications.checkIns} onPress={() => settings.toggleNotification('checkIns')} />
        <SettingToggle icon="sparkles-outline" title="Motivation" subtitle="Milestones, streaks, and re-engagement" value={settings.notifications.motivation} onPress={() => settings.toggleNotification('motivation')} />
        <SettingToggle icon="moon-outline" title="Quiet hours" subtitle="Pause notifications from 10 PM to 7 AM" value={settings.quietHours} onPress={settings.toggleQuietHours} />

        <Section title="Privacy" />
        <SettingToggle icon="analytics-outline" title="Usage analytics" subtitle="Help improve the prototype experience" value={settings.analytics} onPress={settings.toggleAnalytics} />
        <SettingToggle icon="sparkles-outline" title="Personalized AI context" subtitle="Use profile and check-ins for recommendations" value={settings.personalizedAI} onPress={settings.togglePersonalizedAI} />
        <View style={styles.visibility}><View><Typography variant="body" weight="700">Profile visibility</Typography><Typography variant="caption" style={styles.caption}>Controls future social features</Typography></View><View style={styles.visibilityOptions}>{(['Private', 'Friends', 'Public'] as const).map((value) => <TouchableOpacity key={value} onPress={() => settings.setProfileVisibility(value)}><Typography variant="caption" color={settings.profileVisibility === value ? Colors.dark.primary : Colors.dark.textSecondary} weight="700">{value}</Typography></TouchableOpacity>)}</View></View>
        <ActionRow icon="download-outline" title="Export my data" subtitle={settings.exported ? 'Export prepared locally' : 'Download profile and progress data'} onPress={settings.markExported} />

        <Section title="Account" />
        <ActionRow icon="key-outline" title="Change password" subtitle="Prototype account action" onPress={() => setAccountMessage('Password-reset link simulated.')} />
        <ActionRow icon="log-out-outline" title="Sign out" subtitle="Return to the sign-in screen" onPress={() => router.replace('/auth/signin')} />
        <ActionRow icon="trash-outline" title="Delete account" subtitle="Prototype destructive action confirmation" danger onPress={() => setAccountMessage('Account deletion requires backend integration.')} />
        {!!accountMessage && <View style={styles.message}><Ionicons name="information-circle-outline" size={20} color={Colors.dark.primary} /><Typography variant="caption" style={styles.messageText}>{accountMessage}</Typography></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title }: { title: string }) {
  return <Typography variant="h3" style={styles.section}>{title}</Typography>;
}

function SettingToggle({ icon, title, subtitle, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; value: boolean; onPress: () => void }) {
  return <TouchableOpacity style={styles.row} onPress={onPress}><View style={styles.rowIcon}><Ionicons name={icon} size={22} color={Colors.dark.primary} /></View><View style={styles.rowText}><Typography variant="body" weight="700">{title}</Typography><Typography variant="caption" style={styles.caption}>{subtitle}</Typography></View><View style={[styles.toggle, value && styles.toggleActive]}><View style={[styles.knob, value && styles.knobActive]} /></View></TouchableOpacity>;
}

function ActionRow({ icon, title, subtitle, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void; danger?: boolean }) {
  return <TouchableOpacity style={styles.row} onPress={onPress}><View style={styles.rowIcon}><Ionicons name={icon} size={22} color={danger ? '#FF6B6B' : Colors.dark.primary} /></View><View style={styles.rowText}><Typography variant="body" weight="700" color={danger ? '#FF6B6B' : Colors.dark.text}>{title}</Typography><Typography variant="caption" style={styles.caption}>{subtitle}</Typography></View><Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} /></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  section: { marginTop: 28 },
  unitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  segment: { flexDirection: 'row', padding: 3, borderRadius: 14, backgroundColor: Colors.dark.backgroundSelected },
  segmentButton: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 11 },
  segmentActive: { backgroundColor: Colors.dark.primary },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  rowIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundSelected },
  rowText: { flex: 1, marginLeft: 12 },
  caption: { marginTop: 5 },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: Colors.dark.backgroundSelected },
  toggleActive: { backgroundColor: Colors.dark.primary },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.dark.textSecondary },
  knobActive: { marginLeft: 20, backgroundColor: Colors.dark.text },
  visibility: { padding: 16, marginBottom: 10, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  visibilityOptions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  message: { flexDirection: 'row', padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,102,0,0.08)' },
  messageText: { flex: 1, marginLeft: 9 },
});
