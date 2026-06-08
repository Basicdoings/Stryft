import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { SelectionCard } from '@/components/SelectionCard';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

const EXCEPTIONS = [
  { id: 'Lactose Free', title: 'Lactose Free' },
  { id: 'Gluten Free', title: 'Gluten Free' },
  { id: 'Vegan', title: 'Vegan' },
  { id: 'Keto', title: 'Keto' },
  { id: 'None', title: 'None' },
];

export default function MealExceptionsScreen() {
  const router = useRouter();
  const { mealExceptions, setMealExceptions } = useOnboardingStore();

  const toggleException = (id: string) => {
    if (id === 'None') {
      setMealExceptions(['None']);
      return;
    }
    
    let newExceptions = mealExceptions.filter(item => item !== 'None');
    if (newExceptions.includes(id)) {
      newExceptions = newExceptions.filter(item => item !== id);
    } else {
      newExceptions.push(id);
    }
    setMealExceptions(newExceptions);
  };

  const handleContinue = () => {
    if (mealExceptions.length > 0) {
      router.push('/assessment/exercisePreferences');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={8} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What are your meal exceptions?
        </Typography>
        
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {EXCEPTIONS.map((item) => (
            <SelectionCard
              key={item.id}
              title={item.title}
              selected={mealExceptions.includes(item.id)}
              onPress={() => toggleException(item.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={mealExceptions.length === 0}
            showArrow
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginTop: 20,
    marginBottom: 40,
  },
  options: {
    flex: 1,
  },
  footer: {
    paddingTop: 16,
  },
});
