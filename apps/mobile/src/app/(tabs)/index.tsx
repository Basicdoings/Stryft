import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/Typography';
import { useGameStore } from '@/store/useGameStore';
import { LOCAL_MEALS } from '@/constants/mealPlan';

export default function HomeScreen() {
  const router = useRouter();
  const game = useGameStore();

  const level = Math.max(1, Math.floor(game.xp / 250) + 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* TAMAGOTCHI HEADER */}
        <View style={styles.header}>
           <Image source={{ uri: 'https://i.pravatar.cc/150?u=makise' }} style={styles.avatar} />
           <View style={styles.headerText}>
             <Typography variant="h3" style={styles.greeting}>Hello, Makise!</Typography>
             <View style={styles.badgeRow}>
               <View style={styles.badge}>
                 <Typography variant="caption" style={styles.badgeText}>Lvl {level} Titan</Typography>
               </View>
               <View style={[styles.badge, { marginLeft: 6, backgroundColor: 'rgba(255,107,0,0.15)' }]}>
                 <Typography variant="caption" style={[styles.badgeText, { color: '#FF6B00' }]}>🪙 {game.sweatCoins}</Typography>
               </View>
             </View>
           </View>
           <TouchableOpacity style={styles.headerAction} onPress={() => router.push('/profile')}>
             <Ionicons name="chevron-forward" size={18} color="#FFF" />
           </TouchableOpacity>
        </View>

        {/* INTERACTIVE AVATAR (The Hook) */}
        <SectionHeader title="Your 3D Avatar" action="Interact" onPress={() => router.push('/avatar')} />
        <TouchableOpacity style={styles.avatarPortal} onPress={() => router.push('/avatar')} activeOpacity={0.9}>
           <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1000&auto=format&fit=crop' }} style={styles.workoutBg} imageStyle={{ borderRadius: 28 }}>
             <LinearGradientOverlay opacity={0.6} />
             <View style={styles.portalOverlay}>
                <View style={styles.glowIndicator}>
                  <View style={[styles.glowDot, { backgroundColor: game.streak > 3 ? '#42D392' : '#FF6B00' }]} />
                  <Typography variant="caption" color="#FFF" weight="700">
                    {game.streak > 3 ? 'Aura: Glowing' : 'Aura: Tired'}
                  </Typography>
                </View>
                <Typography variant="h2" color="#FFF" style={styles.workoutTitle}>Enter Studio</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.85)" weight="600">Equip gear and view morphs</Typography>
             </View>
           </ImageBackground>
        </TouchableOpacity>

        {/* RPG STATS (Figma Metrics Row) */}
        <SectionHeader title="RPG Attributes" action="View All" />
        <View style={styles.metricsRow}>
           <View style={[styles.metricCard, styles.metricOrange]}>
             <Ionicons name="flame" size={26} color="#FFF" style={styles.metricIcon} />
             <Typography variant="h1" color="#FFF">{game.xp}</Typography>
             <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="600">Total XP Gained</Typography>
           </View>
           <View style={[styles.metricCard, styles.metricBlue]}>
             <Ionicons name="shield-checkmark" size={26} color="#FFF" style={styles.metricIcon} />
             <Typography variant="h1" color="#FFF">{game.streak}x</Typography>
             <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="600">Day Login Streak</Typography>
           </View>
        </View>

        {/* TODAY'S MISSION (Figma Workouts) */}
        <SectionHeader title="Today's Mission" action="Start Quest" onPress={() => router.push('/mission')} />
        <TouchableOpacity style={styles.workoutCard} onPress={() => router.push('/mission')} activeOpacity={0.9}>
           <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop' }} style={styles.workoutBg} imageStyle={{ borderRadius: 28 }}>
             <LinearGradientOverlay />
             <View style={styles.workoutOverlay}>
                <View>
                  <Typography variant="h2" color="#FFF" style={styles.workoutTitle}>Full Body Core</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.85)" weight="600">28 min · Mission · +120 XP</Typography>
                </View>
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={20} color="#000" style={{ marginLeft: 3 }} />
                </View>
             </View>
           </ImageBackground>
        </TouchableOpacity>

        {/* HYPER-LOCAL FUEL (Figma Diet) */}
        <SectionHeader title="Localized Fuel" action="See Plan" onPress={() => router.push('/meals')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dietScroll}>
           {LOCAL_MEALS.map((meal, index) => (
             <TouchableOpacity key={meal.id} style={styles.dietCard} onPress={() => router.push('/meals')} activeOpacity={0.8}>
                <View style={styles.dietImgContainer}>
                  <Image source={{ uri: `https://images.unsplash.com/photo-${index % 2 === 0 ? '1512621776951-a57141f2eefd' : '1546069901-ba6e2c91fce4'}?q=80&w=400&auto=format&fit=crop` }} style={styles.dietImg} />
                  <View style={styles.dietCalBadge}>
                    <Typography variant="caption" style={styles.dietCalText}>{meal.calories} kcal</Typography>
                  </View>
                </View>
                <Typography variant="body" weight="700" style={styles.dietTitle}>{meal.name}</Typography>
                <Typography variant="caption" style={styles.dietSub}>Nigerian AI · {meal.time}</Typography>
             </TouchableOpacity>
           ))}
        </ScrollView>

        {/* EFFICIENCY PREDICTION (Figma Activities Chart) */}
        <SectionHeader title="Timeline Prediction" action="Analyze" onPress={() => router.push('/future-self')} />
        <View style={styles.activityCard}>
           <View style={styles.activityTop}>
             <Typography variant="caption" color="#A1A1AA" weight="600">Reality Efficiency Coefficient</Typography>
             <View style={styles.activityIcon}><Ionicons name="analytics" size={18} color="#FFF" /></View>
           </View>
           <Typography variant="h1" style={styles.activityMain}>0.85</Typography>
           <Typography variant="caption" color="#42D392" weight="700">Optimal Growth Velocity</Typography>
           
           <View style={styles.chartMock}>
             {[40, 70, 50, 100, 80, 60, 90].map((h, i) => (
               <View key={i} style={styles.barContainer}>
                 <View style={[styles.bar, { height: `${h}%`, backgroundColor: i === 3 ? '#FF6B00' : '#333' }]} />
               </View>
             ))}
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function LinearGradientOverlay({ opacity = 0.3 }: { opacity?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${opacity})`, borderRadius: 28 }]} />
  );
}

function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Typography variant="h3" style={styles.sectionTitle}>{title}</Typography>
      <TouchableOpacity onPress={onPress}><Typography variant="caption" color="#FF6B00" weight="700">{action}</Typography></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  container: { padding: 20, paddingBottom: 140 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#333' },
  headerText: { flex: 1, marginLeft: 16 },
  greeting: { fontSize: 19, marginBottom: 4, color: '#FFF', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  headerAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 18 },
  sectionTitle: { fontSize: 18, color: '#FFF', marginBottom: 0, fontWeight: '700' },

  avatarPortal: { borderRadius: 28, height: 160, overflow: 'hidden' },
  portalOverlay: { padding: 24, flex: 1, justifyContent: 'flex-end' },
  glowIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  glowDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },

  metricsRow: { flexDirection: 'row', gap: 16 },
  metricCard: { flex: 1, borderRadius: 28, padding: 22, minHeight: 145, justifyContent: 'space-between' },
  metricOrange: { backgroundColor: '#FF6B00' },
  metricBlue: { backgroundColor: '#1E62FF' },
  metricIcon: { marginBottom: 16 },

  workoutCard: { borderRadius: 28, height: 210, overflow: 'hidden' },
  workoutBg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  workoutOverlay: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  workoutTitle: { fontSize: 22, marginBottom: 4 },
  playBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },

  dietScroll: { gap: 16, paddingRight: 20 },
  dietCard: { width: 160, backgroundColor: '#1E1E1E', borderRadius: 24, padding: 12 },
  dietImgContainer: { width: '100%', height: 130, borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  dietImg: { width: '100%', height: '100%' },
  dietCalBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: '#FF6B00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  dietCalText: { fontSize: 11, color: '#FFF', fontWeight: 'bold' },
  dietTitle: { fontSize: 15, color: '#FFF', marginBottom: 3 },
  dietSub: { fontSize: 12, color: '#A1A1AA', fontWeight: '500' },

  activityCard: { backgroundColor: '#1E1E1E', borderRadius: 28, padding: 24 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  activityMain: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginBottom: 4 },
  chartMock: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, marginTop: 32 },
  barContainer: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '40%', borderRadius: 8 },
});
