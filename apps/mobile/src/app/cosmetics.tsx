import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { COSMETICS } from '@/constants/gameContent';
import { useGameStore } from '@/store/useGameStore';

export default function CosmeticsScreen() {
  const router = useRouter();
  const { sweatCoins, ownedCosmetics, equippedCosmetic, buyCosmetic, equipCosmetic } = useGameStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">COSMETICS STORE</Typography><View style={styles.balance}><Ionicons name="disc" size={17} color={Colors.dark.primary} /><Typography variant="caption" weight="700" style={styles.balanceText}>{sweatCoins}</Typography></View></View>
        <Typography variant="h1" style={styles.title}>Style your avatar</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>Spend Sweat Coins earned from consistency.</Typography>
        <View style={styles.grid}>
          {COSMETICS.map((item) => {
            const owned = ownedCosmetics.includes(item.id);
            const equipped = equippedCosmetic === item.id;
            const canAfford = sweatCoins >= item.price;
            return (
              <View key={item.id} style={[styles.item, equipped && { borderColor: item.color }]}>
                <View style={[styles.preview, { backgroundColor: `${item.color}20` }]}><Ionicons name={item.icon} size={42} color={item.color} /></View>
                <Typography variant="body" weight="700" style={styles.itemName}>{item.name}</Typography>
                <Typography variant="caption">{owned ? 'Owned' : `${item.price} Sweat Coins`}</Typography>
                <TouchableOpacity
                  style={[styles.action, (!canAfford && !owned) && styles.actionDisabled, equipped && { backgroundColor: item.color }]}
                  disabled={!canAfford && !owned}
                  onPress={() => owned ? equipCosmetic(equipped ? null : item.id) : buyCosmetic(item.id, item.price)}
                >
                  <Typography variant="caption" weight="700" color={(!canAfford && !owned) ? Colors.dark.textSecondary : Colors.dark.text}>{equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}</Typography>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  balance: { flexDirection: 'row', padding: 11, borderRadius: 15, backgroundColor: Colors.dark.backgroundElement },
  balanceText: { marginLeft: 6 },
  title: { fontSize: 34, lineHeight: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  item: { width: '48%', padding: 14, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement, borderWidth: 1, borderColor: Colors.dark.border },
  preview: { height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  itemName: { marginTop: 13, marginBottom: 5 },
  action: { paddingVertical: 10, marginTop: 14, borderRadius: 14, alignItems: 'center', backgroundColor: Colors.dark.primary },
  actionDisabled: { backgroundColor: Colors.dark.backgroundSelected },
});
