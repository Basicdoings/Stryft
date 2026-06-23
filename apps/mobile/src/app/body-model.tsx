import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { ModelViewer } from '@/components/ModelViewer';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { CustomButton } from '@/components/CustomButton';

export default function BodyModelScreen() {
  const router = useRouter();
  const { scanPipelineResult } = useOnboardingStore();
  const [activeState, setActiveState] = React.useState('idle');

  const meshUrl = scanPipelineResult?.generated_mesh_url;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.dark.text} />
        </TouchableOpacity>
        <Typography variant="caption" color={Colors.dark.primary} weight="700">
          3D STUDIO
        </Typography>
        <View style={styles.back} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Typography variant="h2" style={styles.title}>
            Base Body Mesh
          </Typography>
          <Typography variant="body" color={Colors.dark.textSecondary}>
            Generated from your 3-view scan
          </Typography>
        </View>

        <View style={styles.viewerWrapper}>
          {meshUrl ? (
            <ModelViewer modelUrl={meshUrl} activeState={activeState} morphWeight={0.5} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={Colors.dark.textSecondary} />
              <Typography variant="body" color={Colors.dark.textSecondary} style={{ marginTop: 16 }}>
                No 3D model available yet.
              </Typography>
            </View>
          )}
        </View>

        <CustomButton 
          title="Predict Future Body" 
          onPress={() => router.push('/future-self')} 
          showArrow
          disabled={!meshUrl}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.backgroundElement,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  viewerWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#08080B',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 24,
    position: 'relative',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testControlsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(20,20,25,0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  testBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  testBtnActive: {
    backgroundColor: Colors.dark.primary,
  }
});
