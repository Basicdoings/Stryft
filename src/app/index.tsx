import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useGameStore } from '@/store/useGameStore';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function HomeScreen() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const game = useGameStore();
  const level = Math.max(1, Math.floor(game.xp / 250) + 1);

  if (!onboarding.onboardingComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landing}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Ionicons name="flash" size={24} color={Colors.dark.text} /></View>
            <Typography variant="h3" weight="800">STRYFT</Typography>
          </View>
          <View style={styles.hero}>
            <Typography variant="caption" color={Colors.dark.primary} weight="700">YOUR FUTURE BODY, MAPPED</Typography>
            <Typography variant="h1" align="center" style={styles.heroTitle}>Build a plan that fits your body and your life.</Typography>
            <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.heroCopy}>
              Complete a short assessment to preview your personalized transformation roadmap.
            </Typography>
            <View style={styles.orbit}><Ionicons name="body" size={112} color={Colors.dark.primary} /></View>
          </View>
          <CustomButton title="Start Assessment" onPress={() => router.push('/assessment/gender')} showArrow />
          <TouchableOpacity onPress={() => router.push('/auth/signin')} style={styles.signIn}>
            <Typography variant="caption">Already have an account? <Typography variant="caption" color={Colors.dark.primary} weight="700">Sign in</Typography></Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.dashboard}>
        <View style={styles.dashboardHeader}>
          <View>
            <Typography variant="caption" color={Colors.dark.primary} weight="700">GOOD MORNING</Typography>
            <Typography variant="h1">Ready to Stryft?</Typography>
          </View>
          <TouchableOpacity style={styles.level} onPress={() => router.push('/profile')}><Ionicons name="person-outline" size={17} color={Colors.dark.text} /><Typography variant="caption" weight="700" style={styles.levelText}>LVL {level}</Typography></TouchableOpacity>
        </View>

        <View style={styles.gameBar}>
          <GameStat icon="flash" value={`${game.xp} XP`} />
          <GameStat icon="disc" value={`${game.sweatCoins} coins`} />
          <GameStat icon="flame" value={`${game.streak} day streak`} />
        </View>

        <TouchableOpacity style={styles.avatarCard} onPress={() => router.push('/avatar')}>
          <View style={styles.avatarPreview}><Ionicons name={game.todaysMissionComplete ? 'body' : 'body-outline'} size={46} color={game.todaysMissionComplete ? Colors.dark.primary : Colors.dark.textSecondary} /></View>
          <View style={styles.avatarText}>
            <Typography variant="caption" color={Colors.dark.primary} weight="700">YOUR AVATAR</Typography>
            <Typography variant="body" weight="700" style={styles.avatarName}>{game.todaysMissionComplete ? 'Energized and evolving' : 'Ready for today’s mission'}</Typography>
            <Typography variant="caption">RPG stats, cosmetics, and rewards</Typography>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.missionCard, game.todaysMissionComplete && styles.missionCardDone]} onPress={() => router.push(game.todaysMissionComplete ? '/reward' : '/mission')} activeOpacity={0.85}>
          <View style={styles.missionTop}>
            <View style={styles.missionBadge}><Ionicons name={game.todaysMissionComplete ? 'checkmark' : 'barbell'} size={25} color={Colors.dark.text} /></View>
            <View style={styles.missionCopy}>
              <Typography variant="caption" color={game.todaysMissionComplete ? '#42D392' : Colors.dark.primary} weight="700">
                {game.todaysMissionComplete ? 'MISSION COMPLETE' : 'TODAY\'S MISSION'}
              </Typography>
              <Typography variant="h3" style={styles.missionTitle}>Full Body Foundation</Typography>
              <Typography variant="caption">28 min · 4 exercises · +120 XP</Typography>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.dark.textSecondary} />
          </View>
          <View style={styles.missionProgress}><View style={[styles.missionProgressFill, { width: game.todaysMissionComplete ? '100%' : '18%' }]} /></View>
        </TouchableOpacity>

        <Section title="Localized meal plan" action="View plan" onPress={() => router.push('/meals')} />
        <TouchableOpacity style={styles.todayCard} onPress={() => router.push('/meals')}>
          <View style={styles.todayItem}><Ionicons name="restaurant-outline" size={23} color={Colors.dark.primary} /><View style={styles.todayText}><Typography variant="body" weight="700">{game.completedMeals.length}/4 meals logged</Typography><Typography variant="caption" style={styles.checkInCaption}>Localized meals and daily macros</Typography></View></View>
          <Ionicons name="chevron-forward" size={22} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <Section title="Weekly progress" action={`${game.workoutsCompleted}/${onboarding.daysPerWeek} missions`} onPress={() => router.push('/progress')} />
        <TouchableOpacity style={styles.weekRow} onPress={() => router.push('/progress')}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <View key={`${day}-${index}`} style={[styles.day, index === 0 && game.todaysMissionComplete && styles.dayDone, index === 0 && !game.todaysMissionComplete && styles.dayToday]}>
              <Typography variant="caption" weight="700">{day}</Typography>
              {index === 0 && <View style={[styles.dayDot, game.todaysMissionComplete && styles.dayDotDone]} />}
            </View>
          ))}
        </TouchableOpacity>

        <Section title="Progress check-in" action={game.latestCheckIn ? 'Updated' : undefined} />
        <TouchableOpacity style={styles.checkInCard} onPress={() => router.push('/checkin')}>
          <View style={styles.checkInIcon}><Ionicons name={game.latestCheckIn ? 'trending-up' : 'camera-outline'} size={28} color={Colors.dark.primary} /></View>
          <View style={styles.checkInText}>
            <Typography variant="body" weight="700">{game.latestCheckIn ? `${game.latestCheckIn.weight} ${onboarding.weight.unit} logged` : 'Log your weekly progress'}</Typography>
            <Typography variant="caption" style={styles.checkInCaption}>{game.latestCheckIn ? `${game.latestCheckIn.mood} · Roadmap updated` : 'Weight, measurements, mood, and photo'}</Typography>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <Section title="Future-self prediction" action="Explore" onPress={() => router.push('/future-self')} />
        <TouchableOpacity style={styles.futureCard} onPress={() => router.push('/future-self')}>
          <View style={styles.futureBodies}><Ionicons name="body-outline" size={34} color={Colors.dark.textSecondary} /><Ionicons name="arrow-forward" size={18} color={Colors.dark.primary} /><Ionicons name="body" size={42} color={Colors.dark.primary} /></View>
          <View style={styles.futureText}><Typography variant="body" weight="700">{onboarding.timelineWeeks ?? 12}-week future self</Typography><Typography variant="caption" style={styles.checkInCaption}>Before/after, outcome ranges, and milestones</Typography></View>
          <Ionicons name="chevron-forward" size={22} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <Section title="Plan snapshot" />
        <View style={styles.summaryGrid}>
          <Summary icon="shield-half" label="Journey" value={onboarding.journey ? capitalize(onboarding.journey) : 'Personal'} />
          <Summary icon="flag" label="Goal" value={onboarding.primaryGoal ?? 'Fitness'} />
          <Summary icon="flame" label="Daily fuel" value={`${onboarding.calorieGoal ?? 1550} kcal`} />
          <Summary icon="calendar" label="Timeline" value={`${onboarding.timelineWeeks ?? 12} weeks`} />
        </View>

        <View style={styles.footerActions}>
          <CustomButton title="Review Assessment" onPress={() => router.push('/assessment/gender')} variant="secondary" />
          <TouchableOpacity onPress={() => { onboarding.resetOnboarding(); router.replace('/'); }} style={styles.reset}>
            <Typography variant="caption" color={Colors.dark.textSecondary}>Start onboarding over</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FloatingTabBar />
    </SafeAreaView>
  );
}

function Section({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={styles.sectionHeader}><Typography variant="h3">{title}</Typography>{action && <TouchableOpacity onPress={onPress}><Typography variant="caption" color={Colors.dark.primary} weight="700">{action}</Typography></TouchableOpacity>}</View>;
}

function GameStat({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return <View style={styles.gameStat}><Ionicons name={icon} size={17} color={Colors.dark.primary} /><Typography variant="caption" weight="700" style={styles.gameStatText}>{value}</Typography></View>;
}

function Summary({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.summary}><Ionicons name={icon} size={22} color={Colors.dark.primary} /><Typography variant="caption" style={styles.summaryLabel}>{label}</Typography><Typography variant="body" weight="700">{value}</Typography></View>;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  landing: { flex: 1, padding: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 36, lineHeight: 43, marginTop: 14 },
  heroCopy: { lineHeight: 23, maxWidth: 330, marginTop: 10 },
  orbit: { width: 220, height: 220, borderRadius: 110, marginTop: 36, backgroundColor: 'rgba(255,102,0,0.10)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  signIn: { alignItems: 'center', paddingVertical: 8 },
  dashboard: { padding: 24, paddingBottom: 120 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  level: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.primary, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  levelText: { marginLeft: 5 },
  gameBar: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  gameStat: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 13, backgroundColor: Colors.dark.backgroundElement },
  gameStatText: { marginLeft: 5, fontSize: 12 },
  avatarCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, marginBottom: 18, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)' },
  avatarPreview: { width: 62, height: 74, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  avatarText: { flex: 1, marginLeft: 14 },
  avatarName: { marginVertical: 5 },
  missionCard: { borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, padding: 18, borderWidth: 1, borderColor: 'rgba(255,102,0,0.45)' },
  missionCardDone: { borderColor: 'rgba(66,211,146,0.45)' },
  missionTop: { flexDirection: 'row', alignItems: 'center' },
  missionBadge: { width: 54, height: 54, borderRadius: 18, backgroundColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center' },
  missionCopy: { flex: 1, marginLeft: 14 },
  missionTitle: { marginTop: 4, marginBottom: 4 },
  missionProgress: { height: 5, marginTop: 18, borderRadius: 3, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden' },
  missionProgressFill: { height: '100%', backgroundColor: Colors.dark.primary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 10 },
  todayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  todayItem: { flexDirection: 'row', alignItems: 'center' },
  todayText: { marginLeft: 13 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
  day: { width: 38, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayToday: { borderWidth: 1, borderColor: Colors.dark.primary },
  dayDone: { backgroundColor: Colors.dark.primary },
  dayDot: { width: 5, height: 5, borderRadius: 3, marginTop: 5, backgroundColor: Colors.dark.primary },
  dayDotDone: { backgroundColor: Colors.dark.text },
  checkInCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, backgroundColor: Colors.dark.backgroundElement },
  checkInIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,102,0,0.12)', alignItems: 'center', justifyContent: 'center' },
  checkInText: { flex: 1, marginLeft: 14 },
  checkInCaption: { marginTop: 5 },
  futureCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.25)' },
  futureBodies: { flexDirection: 'row', alignItems: 'center', gap: 5, width: 100 },
  futureText: { flex: 1, marginLeft: 8 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summary: { width: '48%', minHeight: 120, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, padding: 16 },
  summaryLabel: { marginTop: 20, marginBottom: 6 },
  footerActions: { marginTop: 14 },
  reset: { alignItems: 'center', padding: 12 },
});
