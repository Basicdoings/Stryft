import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function SupplementsScreen() {
  const router = useRouter();
  const { supplements, setSupplements } = useOnboardingStore();
  const [taking, setTaking] = useState<boolean | null>(supplements.length > 0 ? true : null);

  const handleContinue = () => {
    if (taking === false) {
      setSupplements([]);
      router.push('/assessment/calorieGoal');
    } else {
      router.push('/assessment/supplementDetails');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={10} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Are you taking any supplements?
        </Typography>
        
        <View style={styles.middleContainer}>
          <View style={styles.imagePlaceholder} />
          
          <View style={styles.yesNoRow}>
            <TouchableOpacity 
              style={[styles.yesNoBtn, taking === false && styles.yesNoBtnSelected]}
              onPress={() => setTaking(false)}
            >
               <Typography color={taking === false ? Colors.dark.background : Colors.dark.text} weight="bold">No</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.yesNoBtn, taking === true && styles.yesNoBtnSelected]}
              onPress={() => setTaking(true)}
            >
               <Typography color={taking === true ? Colors.dark.background : Colors.dark.text} weight="bold">Yes</Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={taking === null}
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
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.backgroundElement,
    marginBottom: 40,
  },
  yesNoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  yesNoBtn: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesNoBtnSelected: {
    backgroundColor: Colors.dark.primary,
  },
  footer: {
    paddingTop: 16,
  },
});
