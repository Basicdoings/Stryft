import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { SHOPPING_SECTIONS } from '@/constants/mealPlan';
import { useGameStore } from '@/store/useGameStore';

export default function ShoppingListScreen() {
  const router = useRouter();
  const { checkedShoppingItems, toggleShoppingItem } = useGameStore();
  const total = SHOPPING_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color={Colors.dark.text} /></TouchableOpacity><Typography variant="caption" color={Colors.dark.primary} weight="700">SHOPPING LIST</Typography><TouchableOpacity style={styles.back}><Ionicons name="share-outline" size={20} color={Colors.dark.text} /></TouchableOpacity></View>
        <Typography variant="h1" style={styles.title}>Market list</Typography>
        <Typography variant="body" color={Colors.dark.textSecondary}>One week of ingredients for your localized meal plan.</Typography>
        <View style={styles.progressCard}><View><Typography variant="body" weight="700">{checkedShoppingItems.length} of {total} collected</Typography><Typography variant="caption" style={styles.caption}>Estimated Lagos market budget: ₦18,500</Typography></View><View style={styles.bag}><Ionicons name="bag-check-outline" size={27} color={Colors.dark.primary} /></View></View>
        {SHOPPING_SECTIONS.map((section) => (
          <View key={section.title}>
            <Typography variant="h3" style={styles.sectionTitle}>{section.title}</Typography>
            <View style={styles.sectionCard}>
              {section.items.map((item) => {
                const checked = checkedShoppingItems.includes(item);
                return <TouchableOpacity key={item} style={styles.item} onPress={() => toggleShoppingItem(item)}><View style={[styles.check, checked && styles.checkDone]}>{checked && <Ionicons name="checkmark" size={16} color={Colors.dark.text} />}</View><Typography variant="body" color={checked ? Colors.dark.textSecondary : Colors.dark.text} style={[styles.itemText, checked && styles.itemChecked]}>{item}</Typography></TouchableOpacity>;
              })}
            </View>
          </View>
        ))}
        <CustomButton title="Back to Meal Plan" onPress={() => router.replace('/meals')} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 40 },
  progressCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 18, marginTop: 24, backgroundColor: 'rgba(255,102,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  caption: { marginTop: 5 },
  bag: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: 26 },
  sectionCard: { borderRadius: 16, backgroundColor: Colors.dark.backgroundElement, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  check: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  itemText: { marginLeft: 12 },
  itemChecked: { textDecorationLine: 'line-through' },
});
