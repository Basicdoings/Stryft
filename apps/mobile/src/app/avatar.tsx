import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { useGameStore } from '@/store/useGameStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COSMETICS } from '@/constants/gameContent';

export default function AvatarScreen() {
  const router = useRouter();
  const game = useGameStore();
  const { sleepQuality } = useOnboardingStore();
  
  const level = Math.max(1, Math.floor(game.xp / 250) + 1);
  const progress = (game.xp % 250) / 250;
  const equipped = COSMETICS.find((item) => item.id === game.equippedCosmetic);
  const avatar = getAvatarState(game.todaysMissionComplete, game.completedMeals.length, game.latestCheckIn?.mood);
  
  const stats = {
    Strength: Math.min(99, 10 + game.workoutsCompleted * 5 + (game.todaysMissionComplete ? 3 : 0)),
    Endurance: Math.min(99, 10 + game.streak * 2),
    Wisdom: Math.min(99, 10 + game.completedMeals.length * 3 + game.checkInsCompleted * 4),
    Constitution: Math.min(99, 10 + (sleepQuality === 'Excellent' ? 12 : sleepQuality === 'Good' ? 8 : 4) + game.streak),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Typography variant="caption" color="#FF6B00" weight="800">3D STUDIO</Typography>
          </View>
          <TouchableOpacity style={styles.back} onPress={() => router.push('/cosmetics')}>
            <Ionicons name="shirt" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* 3D WEBGL STUDIO PREVIEW (Simulated with ImageBackground) */}
        <View style={styles.avatarCard}>
          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1000&auto=format&fit=crop' }} style={styles.studioBg} imageStyle={{ borderRadius: 32 }}>
            <LinearGradientOverlay opacity={0.6} />
            <View style={styles.studioOverlay}>
              <View style={[styles.auraCircle, { borderColor: avatar.color }]}>
                <Ionicons name={avatar.icon as any} size={110} color={avatar.color} />
                {equipped && (
                  <View style={[styles.equippedBadge, { backgroundColor: equipped.color }]}>
                    <Ionicons name={equipped.icon as any} size={18} color="#111" />
                  </View>
                )}
              </View>

              <View style={styles.statusBox}>
                <Typography variant="caption" color={avatar.color} weight="800" style={{ letterSpacing: 1 }}>
                  {avatar.label.toUpperCase()}
                </Typography>
                <Typography variant="h2" color="#FFF" style={styles.avatarTitle}>{avatar.title}</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.8)" align="center" weight="600">
                  {avatar.message}
                </Typography>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* LEVEL CARD */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Typography variant="caption" color="#A1A1AA" weight="700">CURRENT TIER</Typography>
              <Typography variant="h2" color="#FFF" style={styles.levelValue}>Level {level}</Typography>
            </View>
            <View style={styles.coinBadge}>
              <Ionicons name="disc" size={20} color="#FF6B00" />
              <Typography variant="body" color="#FF6B00" weight="800" style={styles.coinText}>
                {game.sweatCoins}
              </Typography>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Typography variant="caption" color="#A1A1AA" weight="600" style={styles.xpText}>
            {game.xp % 250} / 250 XP to next level
          </Typography>
        </View>

        {/* RPG STATS GRID */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3" color="#FFF">Live Attributes</Typography>
        </View>
        <View style={styles.statsGrid}>
          {Object.entries(stats).map(([name, value]) => (
            <StatCard key={name} name={name} value={value} />
          ))}
        </View>

        {/* EQUIPPED COSMETIC */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3" color="#FFF">Equipped Gear</Typography>
        </View>
        <TouchableOpacity style={styles.cosmeticCard} onPress={() => router.push('/cosmetics')} activeOpacity={0.8}>
          <View style={[styles.cosmeticIcon, { backgroundColor: equipped ? `${equipped.color}22` : '#111' }]}>
            <Ionicons name={(equipped?.icon as any) ?? 'shirt-outline'} size={28} color={equipped?.color ?? '#A1A1AA'} />
          </View>
          <View style={styles.cosmeticText}>
            <Typography variant="body" color="#FFF" weight="800">
              {equipped?.name ?? 'No Gear Equipped'}
            </Typography>
            <Typography variant="caption" color="#A1A1AA" weight="600" style={styles.caption}>
              Tap to browse digital inventory
            </Typography>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#A1A1AA" />
        </TouchableOpacity>

        {/* ACTIONS */}
        <View style={{ marginTop: 24 }}>
          <CustomButton 
            title="View Level Rewards" 
            onPress={() => router.push('/rewards')} 
            showArrow 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinearGradientOverlay({ opacity = 0.3 }: { opacity?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${opacity})`, borderRadius: 32 }]} />
  );
}

function getAvatarState(workoutDone: boolean, meals: number, mood?: string) {
  if (workoutDone && meals >= 3) return { label: 'Thriving', title: 'Your aura is glowing', message: 'Training and nutrition are perfectly aligned.', icon: 'body', color: '#42D392' };
  if (mood === 'Tired') return { label: 'Recovering', title: 'Recovery mode active', message: 'A lighter mission and quality sleep will help.', icon: 'bed', color: '#1E62FF' };
  if (workoutDone) return { label: 'Energized', title: 'Mission energy unlocked', message: 'Log your meals to strengthen today’s glow.', icon: 'body', color: '#FF6B00' };
  return { label: 'Ready', title: 'Your avatar is waiting', message: 'Complete today’s mission to evolve its state.', icon: 'body-outline', color: '#A1A1AA' };
}

function StatCard({ name, value }: { name: string; value: number }) {
  const icons: Record<string, any> = { Strength: 'barbell', Endurance: 'heart', Wisdom: 'book', Constitution: 'shield' };
  const colors: Record<string, string> = { Strength: '#FF6B00', Endurance: '#1E62FF', Wisdom: '#42D392', Constitution: '#FFB44A' };
  const color = colors[name];

  return (
    <View style={styles.statBox}>
      <View style={styles.statHeader}>
        <Ionicons name={icons[name]} size={22} color={color} />
        <Typography variant="body" color="#FFF" weight="800">{value}</Typography>
      </View>
      <Typography variant="caption" color="#A1A1AA" weight="700" style={styles.statName}>{name}</Typography>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  content: { padding: 20, paddingBottom: 140 },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  headerBadge: { backgroundColor: 'rgba(255,107,0,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },

  avatarCard: { height: 380, marginBottom: 20 },
  studioBg: { width: '100%', height: '100%' },
  studioOverlay: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'space-between' },
  
  auraCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  equippedBadge: { position: 'absolute', right: 8, bottom: 8, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#111' },
  
  statusBox: { alignItems: 'center', width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 24 },
  avatarTitle: { marginTop: 4, marginBottom: 6 },

  levelCard: { padding: 24, borderRadius: 28, backgroundColor: '#1E1E1E', marginBottom: 24 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelValue: { marginTop: 6 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.15)' },
  coinText: { marginLeft: 8 },
  track: { height: 8, borderRadius: 4, marginTop: 20, backgroundColor: '#333', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FF6B00' },
  xpText: { marginTop: 12 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statBox: { width: '47%', padding: 20, borderRadius: 24, backgroundColor: '#1E1E1E' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statName: { marginTop: 16 },
  statTrack: { height: 6, borderRadius: 3, marginTop: 10, backgroundColor: '#333', overflow: 'hidden' },
  statFill: { height: '100%' },

  cosmeticCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, backgroundColor: '#1E1E1E' },
  cosmeticIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cosmeticText: { flex: 1, marginLeft: 16 },
  caption: { marginTop: 4 },
});
