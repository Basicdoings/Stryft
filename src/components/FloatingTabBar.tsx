import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

type TabRoute = '/' | '/plan' | '/coach' | '/progress' | '/profile';

const TABS: { label: string; route: TabRoute; icon: keyof typeof Ionicons.glyphMap; active: keyof typeof Ionicons.glyphMap; primary?: boolean }[] = [
  { label: 'Home', route: '/', icon: 'home-outline' as const, active: 'home' as const },
  { label: 'Plan', route: '/plan', icon: 'calendar-outline' as const, active: 'calendar' as const },
  { label: 'Coach', route: '/coach', icon: 'sparkles-outline' as const, active: 'sparkles' as const, primary: true },
  { label: 'Progress', route: '/progress', icon: 'stats-chart-outline' as const, active: 'stats-chart' as const },
  { label: 'Profile', route: '/profile', icon: 'person-outline' as const, active: 'person' as const },
];

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.shell}>
      {TABS.map((tab) => {
        const selected = pathname === tab.route || (tab.route === '/plan' && ['/today', '/meals', '/shopping-list', '/mission'].includes(pathname));
        return (
          <TouchableOpacity key={tab.route} style={[styles.tab, tab.primary && styles.primaryTab]} onPress={() => router.replace(tab.route)}>
            <View style={[styles.icon, tab.primary && styles.primaryIcon, selected && !tab.primary && styles.selectedIcon]}>
              <Ionicons name={selected ? tab.active : tab.icon} size={tab.primary ? 25 : 21} color={tab.primary || selected ? Colors.dark.text : Colors.dark.textSecondary} />
            </View>
            {!tab.primary && <Typography variant="caption" color={selected ? Colors.dark.text : Colors.dark.textSecondary} style={styles.label}>{tab.label}</Typography>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 72,
    borderRadius: 28,
    paddingHorizontal: 8,
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  primaryTab: { transform: [{ translateY: -18 }] },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  primaryIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.dark.primary, borderWidth: 5, borderColor: Colors.dark.background },
  selectedIcon: { backgroundColor: Colors.dark.primary },
  label: { fontSize: 10, marginTop: 2 },
});
