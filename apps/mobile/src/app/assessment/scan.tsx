import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { ScanPose, useOnboardingStore } from '@/store/useOnboardingStore';
import { submitThreeViewScan } from '@/lib/scanPipeline';

/** Max dimension in pixels for scan photos sent to the edge function.
 *  Tripo3D doesn't need more than 1024px and smaller images dramatically
 *  reduce the base64 payload size, preventing Kong/Edge Runtime timeouts. */
const MAX_IMAGE_DIMENSION = 1024;
const UPLOAD_COMPRESS_QUALITY = 0.6;

/**
 * Resize and compress an image so the base64 payload stays small enough
 * to survive the Kong → Edge Runtime → Tripo3D upload chain without timing out.
 */
async function compressForUpload(uri: string, width: number, height: number) {
  const needsResize = width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION;

  if (!needsResize) {
    // Still re-compress even if dimensions are OK
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: UPLOAD_COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return result;
  }

  // Resize so the longest edge is MAX_IMAGE_DIMENSION, preserving aspect ratio
  const resizeOpts =
    width >= height
      ? { width: MAX_IMAGE_DIMENSION }
      : { height: MAX_IMAGE_DIMENSION };

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: resizeOpts }],
    {
      compress: UPLOAD_COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  return result;
}

const POSES: Array<{
  id: ScanPose;
  label: string;
  instruction: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'front', label: 'Front', instruction: 'Face camera, arms relaxed', icon: 'body-outline' },
  { id: 'right', label: 'Right', instruction: 'Turn right, full side profile', icon: 'arrow-forward-circle-outline' },
  { id: 'left', label: 'Left', instruction: 'Turn left, full side profile', icon: 'arrow-back-circle-outline' },
];

export default function AssessmentScanScreen() {
  const router = useRouter();
  const { scanPhotos, setScanPhoto, setScanPipelineResult } = useOnboardingStore();
  const [activePose, setActivePose] = useState<ScanPose | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const completedCount = useMemo(() => POSES.filter((pose) => scanPhotos[pose.id]).length, [scanPhotos]);
  const ready = completedCount === POSES.length;

  const saveAsset = async (pose: ScanPose, asset: ImagePicker.ImagePickerAsset, source: 'camera' | 'library') => {
    // Resize & compress to keep base64 payload small for the edge function
    const compressed = await compressForUpload(asset.uri, asset.width, asset.height);
    setScanPhoto(pose, {
      uri: compressed.uri,
      base64: compressed.base64 ?? null,
      width: compressed.width,
      height: compressed.height,
      mimeType: 'image/jpeg',
      fileName: asset.fileName ?? `${pose}-scan.jpg`,
      source,
    });
  };

  const capturePhoto = async (pose: ScanPose) => {
    setActivePose(pose);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera permission needed', 'Enable camera access to take scan photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets[0]) {
        await saveAsset(pose, result.assets[0], 'camera');
      }
    } finally {
      setActivePose(null);
    }
  };

  const choosePhoto = async (pose: ScanPose) => {
    setActivePose(pose);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo permission needed', 'Enable photo access to upload scan photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await saveAsset(pose, result.assets[0], 'library');
      }
    } finally {
      setActivePose(null);
    }
  };

  const analyzeScan = async () => {
    if (!ready) return;

    setSubmitting(true);
    try {
      const result = await submitThreeViewScan('onboarding-user', scanPhotos);
      setScanPipelineResult(result);
      router.push('/assessment/bodyAnalysis');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The scan pipeline could not process these photos.';
      setScanPipelineResult({ status: 'error', provider: 'tripo3d', message });
      Alert.alert('Scan upload failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Body Scan" step={16} totalSteps={18} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Typography variant="h2" align="center" style={styles.title}>
            Add your 3-view scan
          </Typography>
          <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.subtitle}>
            Capture or upload front, right, and left photos so your future-self model has enough shape context.
          </Typography>
        </View>

        <View style={styles.progressRow}>
          <Typography variant="caption" weight="700" color={Colors.dark.primary}>
            {completedCount} of {POSES.length} views ready
          </Typography>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(completedCount / POSES.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.poseList}>
          {POSES.map((pose) => {
            const photo = scanPhotos[pose.id];
            const busy = activePose === pose.id;
            return (
              <View key={pose.id} style={[styles.poseCard, photo && styles.poseCardComplete]}>
                <View style={styles.preview}>
                  {photo ? (
                    <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.emptyPreview}>
                      <Ionicons name={pose.icon} size={42} color={Colors.dark.textSecondary} />
                    </View>
                  )}
                  {photo && (
                    <TouchableOpacity style={styles.removeButton} onPress={() => setScanPhoto(pose.id, null)}>
                      <Ionicons name="close" size={16} color={Colors.dark.text} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.poseBody}>
                  <View style={styles.poseHeader}>
                    <View>
                      <Typography variant="body" weight="800">{pose.label}</Typography>
                      <Typography variant="caption" style={styles.instruction}>{pose.instruction}</Typography>
                    </View>
                    <View style={[styles.statusDot, photo && styles.statusDotComplete]}>
                      {photo && <Ionicons name="checkmark" size={14} color={Colors.dark.text} />}
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => capturePhoto(pose.id)} disabled={busy}>
                      <Ionicons name="camera-outline" size={18} color={Colors.dark.text} />
                      <Typography variant="caption" weight="700">Camera</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => choosePhoto(pose.id)} disabled={busy}>
                      <Ionicons name="image-outline" size={18} color={Colors.dark.text} />
                      <Typography variant="caption" weight="700">Upload</Typography>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.dark.primary} />
          <Typography variant="caption" style={styles.privacyText}>
            Photos stay in onboarding state until you continue. The Tripo3D API key remains server-side in the pipeline.
          </Typography>
        </View>

        <CustomButton
          title="Analyze My Scan"
          onPress={analyzeScan}
          disabled={!ready || submitting}
          loading={submitting}
          showArrow
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 24, paddingBottom: 36 },
  hero: { marginTop: 8, marginBottom: 18 },
  title: { marginBottom: 8 },
  subtitle: { lineHeight: 22 },
  progressRow: { gap: 10, marginBottom: 18 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.dark.backgroundElement, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.dark.primary },
  poseList: { gap: 14 },
  poseCard: {
    minHeight: 148,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  poseCardComplete: { borderColor: 'rgba(66,211,146,0.45)' },
  preview: {
    width: 104,
    height: 124,
    borderRadius: 14,
    backgroundColor: '#171717',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  emptyPreview: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  poseBody: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  poseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  instruction: { marginTop: 4, lineHeight: 18 },
  statusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.backgroundSelected,
  },
  statusDotComplete: { backgroundColor: '#1E8E64' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.backgroundSelected,
  },
  privacyNote: {
    flexDirection: 'row',
    padding: 14,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,102,0,0.08)',
  },
  privacyText: { flex: 1, marginLeft: 10, lineHeight: 18 },
});
