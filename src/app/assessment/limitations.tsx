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

const LIMITATIONS = [
  { id: 'Asthma', title: 'Asthma' },
  { id: 'Back Pain', title: 'Back Pain' },
  { id: 'Knee Joint', title: 'Knee Joint' },
  { id: 'None', title: 'None' },
];

export default function LimitationsScreen() {
  const router = useRouter();
  const { physicalLimitations, setPhysicalLimitations } = useOnboardingStore();

  const toggleLimitation = (id: string) => {
    if (id === 'None') {
      setPhysicalLimitations(['None']);
      return;
    }
    
    let newLimitations = physicalLimitations.filter(item => item !== 'None');
    if (newLimitations.includes(id)) {
      newLimitations = newLimitations.filter(item => item !== id);
    } else {
      newLimitations.push(id);
    }
    setPhysicalLimitations(newLimitations);
  };

  const handleContinue = () => {
    if (physicalLimitations.length > 0) {
      router.push('/assessment/commitment');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={6} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Do you have any physical limitations?
        </Typography>
        
        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {LIMITATIONS.map((item) => (
            <SelectionCard
              key={item.id}
              title={item.title}
              selected={physicalLimitations.includes(item.id)}
              onPress={() => toggleLimitation(item.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={physicalLimitations.length === 0}
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
