import { Typography } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { StudioBackdrop } from '@/components/StudioBackdrop';
import { Environment, OrbitControls, useAnimations, useGLTF } from '@react-three/drei/native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, LogBox, StyleSheet, View } from 'react-native';
import * as THREE from 'three';
import type { ZoneMorphWeights } from '@/lib/predictionEngine';

LogBox.ignoreLogs([
  'THREE.Clock: This module has been deprecated',
  'THREE.Timer',
]);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModelViewerProps {
  modelUrl: string;
  activeState?: string;
  morphWeight?: number;
  /** Zone-specific morph weights for bone-scaling system */
  zoneMorphs?: ZoneMorphWeights;
  /** Focus camera on a specific body zone */
  zoneFocus?: 'abs' | 'glutes' | 'v-taper' | 'full';
  /** Rim light color tint — use for avatar state aura */
  rimLightColor?: string;
  /** Callback with geometric body measurements once model is analyzed */
  onBodyMetrics?: (metrics: BodyMetrics) => void;
  /** If true, run the cinematic walk-in entrance sequence */
  enableEntrance?: boolean;
  /** Callback fired when the cinematic entrance completes */
  onEntranceComplete?: () => void;
}

export interface BodyMetrics {
  heightCm: number;
  shoulderWidthCm: number;
  waistWidthCm: number;
  hipWidthCm: number;
  chestWidthCm: number;
  thighWidthCm: number;
  /** Shoulder-to-waist ratio (V-taper indicator) */
  vTaperRatio: number;
  /** Waist-to-hip ratio */
  waistHipRatio: number;
}

// ─── Cinematic Camera Rig ─────────────────────────────────────────────────────

/** 
 * Handles the walk-in entrance sequence:
 * 1. Camera starts close & slightly low (dramatic angle)
 * 2. Smoothly pulls back to reveal the full model
 * 3. Settles at the final orbit position
 */
/** Camera end positions per zone focus (from PRD spec) */
const ZONE_CAMERA_POSITIONS: Record<string, [number, number, number]> = {
  abs:      [0, 1.1, 1.6],    // Tight on core
  glutes:   [0.6, 0.8, -1.4], // Rear pivot
  'v-taper': [0, 1.4, 3.2],   // Full structural outline
  full:     [0, 1.0, 2.1],    // Standard full-body
};

function EntranceCameraRig({ enabled, zoneFocus }: { enabled: boolean; zoneFocus?: string }) {
  const { camera } = useThree();
  const startTime = useRef(Date.now());
  const isComplete = useRef(false);

  // Initial dramatic close-up position
  const startPos = useMemo(() => new THREE.Vector3(0.3, 0.6, 0.7), []);
  // Final resting position — depends on zone focus
  const zonePos = ZONE_CAMERA_POSITIONS[zoneFocus ?? 'full'] ?? ZONE_CAMERA_POSITIONS.full;
  const endPos = useMemo(() => new THREE.Vector3(...zonePos), [zonePos]);
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0.8, 0), []);

  useEffect(() => {
    if (enabled) {
      camera.position.copy(startPos);
      camera.lookAt(lookTarget);
      startTime.current = Date.now();
      isComplete.current = false;
    }
  }, [enabled, camera, startPos, lookTarget]);

  useFrame(() => {
    if (!enabled || isComplete.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const entranceDuration = 2.8; // seconds

    if (elapsed >= entranceDuration) {
      isComplete.current = true;
      return;
    }

    // Smooth ease-out cubic for cinematic feel
    const rawT = Math.min(elapsed / entranceDuration, 1);
    const t = 1 - Math.pow(1 - rawT, 3);

    camera.position.lerpVectors(startPos, endPos, t);
    camera.lookAt(lookTarget);
  });

  return null;
}

// ─── Idle Breathing Animation ─────────────────────────────────────────────────

/** Subtle vertical oscillation when no clip animation is active */
function IdleBreathing({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const elapsed = clock.getElapsedTime();
      // Gentle breathing sway
      groupRef.current.position.y = Math.sin(elapsed * 1.2) * 0.008;
    }
  });

  return null;
}

// ─── Geometric Body Analysis ──────────────────────────────────────────────────

/**
 * Analyzes the loaded mesh geometry to extract real-time body measurements.
 * Computes bounding boxes at different height slices to determine
 * shoulder width, waist, hip, chest, and thigh dimensions.
 */
function analyzeBodyGeometry(scene: THREE.Object3D, modelScale: number): BodyMetrics | null {
  const allPositions: THREE.Vector3[] = [];

  scene.traverse((child: any) => {
    if (child.isMesh && child.geometry) {
      const posAttr = child.geometry.getAttribute('position');
      if (!posAttr) return;

      const worldMatrix = child.matrixWorld;
      for (let i = 0; i < posAttr.count; i++) {
        const v = new THREE.Vector3(
          posAttr.getX(i),
          posAttr.getY(i),
          posAttr.getZ(i)
        );
        v.applyMatrix4(worldMatrix);
        allPositions.push(v);
      }
    }
  });

  if (allPositions.length === 0) return null;

  // Compute overall bounding box
  const bbox = new THREE.Box3().setFromPoints(allPositions);
  const modelHeight = (bbox.max.y - bbox.min.y) * modelScale;

  // Estimate real-world height (scale factor: model units → cm)
  // Tripo models at scale 8.0 with ~0.22 unit height ≈ 175cm human
  const heightCm = Math.max(150, Math.min(210, modelHeight * (175 / (0.22 * 8))));
  const cmPerUnit = heightCm / modelHeight;

  // Slice the model at different heights to get width measurements
  const relativeMin = bbox.min.y;
  const totalH = bbox.max.y - bbox.min.y;

  function getWidthAtHeight(yRatio: number, sliceThickness = 0.02): number {
    const targetY = relativeMin + totalH * yRatio;
    const halfSlice = totalH * sliceThickness;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const p of allPositions) {
      if (p.y >= targetY - halfSlice && p.y <= targetY + halfSlice) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minZ = Math.min(minZ, p.z);
        maxZ = Math.max(maxZ, p.z);
      }
    }

    if (minX === Infinity) return 0;
    const width = (maxX - minX) * modelScale * cmPerUnit;
    return Math.round(width * 10) / 10;
  }

  const shoulderWidthCm = getWidthAtHeight(0.82); // ~82% height = shoulders
  const chestWidthCm = getWidthAtHeight(0.72);    // ~72% height = chest
  const waistWidthCm = getWidthAtHeight(0.58);    // ~58% height = waist
  const hipWidthCm = getWidthAtHeight(0.50);      // ~50% height = hips
  const thighWidthCm = getWidthAtHeight(0.40);    // ~40% height = upper thigh

  return {
    heightCm: Math.round(heightCm * 10) / 10,
    shoulderWidthCm,
    chestWidthCm,
    waistWidthCm,
    hipWidthCm,
    thighWidthCm,
    vTaperRatio: waistWidthCm > 0 ? Math.round((shoulderWidthCm / waistWidthCm) * 100) / 100 : 0,
    waistHipRatio: hipWidthCm > 0 ? Math.round((waistWidthCm / hipWidthCm) * 100) / 100 : 0,
  };
}

// ─── Model Component ─────────────────────────────────────────────────────────

// ─── Bone References for Anatomical Morphing ─────────────────────────────────

/** Mixamo bone names used for anatomical scaling */
interface BoneRefs {
  spine?: THREE.Bone;
  spine1?: THREE.Bone;
  spine2?: THREE.Bone;
  leftShoulder?: THREE.Bone;
  rightShoulder?: THREE.Bone;
  leftArm?: THREE.Bone;
  rightArm?: THREE.Bone;
  leftForeArm?: THREE.Bone;
  rightForeArm?: THREE.Bone;
  leftUpLeg?: THREE.Bone;
  rightUpLeg?: THREE.Bone;
  leftLeg?: THREE.Bone;
  rightLeg?: THREE.Bone;
  hips?: THREE.Bone;
}

/** Extract bone references from a loaded model scene */
function extractBoneRefs(scene: THREE.Object3D): BoneRefs {
  const refs: BoneRefs = {};
  const boneMap: Record<string, keyof BoneRefs> = {
    mixamorigSpine: 'spine',
    mixamorigSpine1: 'spine1',
    mixamorigSpine2: 'spine2',
    mixamorigLeftShoulder: 'leftShoulder',
    mixamorigRightShoulder: 'rightShoulder',
    mixamorigLeftArm: 'leftArm',
    mixamorigRightArm: 'rightArm',
    mixamorigLeftForeArm: 'leftForeArm',
    mixamorigRightForeArm: 'rightForeArm',
    mixamorigLeftUpLeg: 'leftUpLeg',
    mixamorigRightUpLeg: 'rightUpLeg',
    mixamorigLeftLeg: 'leftLeg',
    mixamorigRightLeg: 'rightLeg',
    mixamorigHips: 'hips',
  };

  scene.traverse((child: any) => {
    if (child.isBone && child.name in boneMap) {
      refs[boneMap[child.name]] = child;
    }
  });

  return refs;
}

/**
 * Apply zone-specific bone scaling (ported from morph-demo/app.js#L392-L443).
 * This produces anatomically believable body transformations by scaling
 * specific bones along their principal axes.
 */
function applyBoneScaling(bones: BoneRefs, zoneMorphs: ZoneMorphWeights) {
  // 1. Abs/Waist — tighten lower spine
  const waistScale = 1.0 - (zoneMorphs.abs * 0.2);
  if (bones.spine) bones.spine.scale.set(waistScale, 1.0, waistScale);
  if (bones.spine1) bones.spine1.scale.set(waistScale + 0.05, 1.0, waistScale + 0.05);

  // 2. Glutes — scale hips along Z for posterior volume
  const gluteScaleZ = 1.0 + (zoneMorphs.glutes * 0.4);
  const gluteScaleX = 1.0 + (zoneMorphs.glutes * 0.15);
  if (bones.hips) bones.hips.scale.set(gluteScaleX, 1.0, gluteScaleZ);

  // 3. V-Taper — broaden shoulders and upper back
  const taperScale = 1.0 + (zoneMorphs.vTaper * 0.35);
  if (bones.spine2) bones.spine2.scale.set(taperScale, 1.0, taperScale * 0.8);
  if (bones.leftShoulder) bones.leftShoulder.scale.set(1.0, 1.0 + zoneMorphs.vTaper * 0.3, 1.0);
  if (bones.rightShoulder) bones.rightShoulder.scale.set(1.0, 1.0 + zoneMorphs.vTaper * 0.3, 1.0);

  // 4. Arms — biceps/triceps/forearms mass
  const armScale = 1.0 + (zoneMorphs.arms * 0.45);
  if (bones.leftArm) bones.leftArm.scale.set(armScale, 1.0, armScale);
  if (bones.rightArm) bones.rightArm.scale.set(armScale, 1.0, armScale);
  if (bones.leftForeArm) bones.leftForeArm.scale.set(armScale * 0.85, 1.0, armScale * 0.85);
  if (bones.rightForeArm) bones.rightForeArm.scale.set(armScale * 0.85, 1.0, armScale * 0.85);

  // 5. Legs — thigh/calf mass
  const legScale = 1.0 + (zoneMorphs.legs * 0.4);
  if (bones.leftUpLeg) bones.leftUpLeg.scale.set(legScale, 1.0, legScale);
  if (bones.rightUpLeg) bones.rightUpLeg.scale.set(legScale, 1.0, legScale);
  if (bones.leftLeg) bones.leftLeg.scale.set(legScale * 0.9, 1.0, legScale * 0.9);
  if (bones.rightLeg) bones.rightLeg.scale.set(legScale * 0.9, 1.0, legScale * 0.9);
}

// ─── Model Component ─────────────────────────────────────────────────────────

function Model({
  url,
  activeState,
  morphWeight,
  zoneMorphs,
  onLoad,
  onBodyMetrics,
  enableEntrance,
}: {
  url: string;
  activeState: string;
  morphWeight: number;
  zoneMorphs?: ZoneMorphWeights;
  onLoad: () => void;
  onBodyMetrics?: (metrics: BodyMetrics) => void;
  enableEntrance?: boolean;
  onEntranceComplete?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);
  const previousAction = useRef<THREE.AnimationAction | null>(null);
  const metricsComputed = useRef(false);
  const entranceRotation = useRef(0);
  const boneRefs = useRef<BoneRefs>({});
  const MODEL_SCALE = 8.0;

  // Clamp morph weight to strict 0.0–1.0 bounds (per spec safeguard)
  const clampedMorphWeight = Math.max(0.0, Math.min(morphWeight, 1.0));

  useEffect(() => {
    if (scene) {
      onLoad();
    }
  }, [scene, onLoad]);

  // Entrance rotation & callback
  const entranceFired = useRef(false);
  const [internalState, setInternalState] = useState(enableEntrance ? 'walk' : activeState);

  useFrame(({ clock }) => {
    if (!group.current || !enableEntrance) {
      if (internalState !== activeState) setInternalState(activeState);
      return;
    }

    const elapsed = clock.getElapsedTime();
    if (elapsed < 2.8) {
      // Subtle rotation during entrance (from slight side angle to front)
      const t = Math.min(elapsed / 2.8, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      entranceRotation.current = THREE.MathUtils.lerp(Math.PI * 0.85, Math.PI, eased);
      group.current.rotation.y = entranceRotation.current;
      if (internalState !== 'walk') setInternalState('walk');
    } else if (!entranceFired.current) {
      entranceFired.current = true;
      if (onEntranceComplete) onEntranceComplete();
      setInternalState('fold_arms');
    }
  });

  // Apply morph targets + material fixes + bone-scaling
  useEffect(() => {
    if (!scene) return;

    // Extract bone references for anatomical morphing (once)
    if (Object.keys(boneRefs.current).length === 0) {
      boneRefs.current = extractBoneRefs(scene);
    }

    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.needsUpdate = true;

          // Only force white color when no texture exists (preserve baked textures)
          if (child.material.color && !(child.material.map)) {
            child.material.color.setHex(0xffffff);
          }

          // Tripo sometimes uses vertex colors
          if (child.geometry?.attributes?.color) {
            child.material.vertexColors = true;
          }
        }

        // Apply morph weight to all shape key targets (clamped) — fallback method
        if (child.morphTargetInfluences && child.morphTargetDictionary) {
          for (const key in child.morphTargetDictionary) {
            const index = child.morphTargetDictionary[key];
            child.morphTargetInfluences[index] = clampedMorphWeight;
          }
        }
      }
    });

    // Apply bone-scaling morphs if zone weights are provided and bones found
    if (zoneMorphs && Object.keys(boneRefs.current).length > 0) {
      applyBoneScaling(boneRefs.current, zoneMorphs);
    }

    // Compute geometric measurements (once)
    if (!metricsComputed.current && onBodyMetrics) {
      scene.updateMatrixWorld(true);
      const metrics = analyzeBodyGeometry(scene, MODEL_SCALE);
      if (metrics) {
        onBodyMetrics(metrics);
        metricsComputed.current = true;
      }
    }
  }, [scene, clampedMorphWeight, zoneMorphs, onBodyMetrics]);

  // Handle animation mixer & cross-fading
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    // Try the requested internal state, otherwise fall back to first available
    let actionToPlay = actions[internalState] || actions[activeState];
    if (!actionToPlay) {
      const available = Object.values(actions);
      if (available.length > 0) {
        actionToPlay = available[0];
      }
    }

    if (actionToPlay) {
      actionToPlay.reset().fadeIn(0.35).play();

      if (previousAction.current && previousAction.current !== actionToPlay) {
        previousAction.current.fadeOut(0.35);
      }

      previousAction.current = actionToPlay;
    }
  }, [activeState, actions]);

  return (
    <group ref={group}>
      <primitive
        object={scene}
        position={[0, 0, 0]}
        scale={MODEL_SCALE}
        rotation={[0, Math.PI, 0]}
      />
      <IdleBreathing groupRef={group} />
    </group>
  );
}

// ─── Error Fallback ───────────────────────────────────────────────────────────

function ErrorFallback({ message }: { message: string }) {
  return (
    <View style={styles.errorContainer}>
      <Typography variant="caption" style={styles.errorIcon}>⚠️</Typography>
      <Typography variant="caption" style={styles.errorText}>
        {message}
      </Typography>
      <Typography variant="caption" style={styles.errorHint}>
        Pull down to retry
      </Typography>
    </View>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ModelViewer({
  modelUrl,
  activeState = 'default',
  morphWeight = 0,
  zoneMorphs,
  zoneFocus,
  rimLightColor = '#00bfff',
  onBodyMetrics,
  enableEntrance = true,
  onEntranceComplete,
}: ModelViewerProps) {
  // Pause rendering when app is backgrounded (battery protection)
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorFallback message={error} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingPulse}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
          </View>
          <Typography variant="caption" style={styles.loadingText}>
            Building Live Avatar...
          </Typography>
          <Typography variant="caption" style={styles.loadingSubtext}>
            Analyzing body geometry
          </Typography>
        </View>
      )}

      <Canvas
        frameloop={isActive ? 'always' : 'never'}
        onCreated={(state) => {
          // Enable shadow maps for premium look
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.1;
        }}
      >
        <Suspense fallback={null}>
          {/* ── Studio Environment ── */}
          <StudioBackdrop rimLightColor={rimLightColor} />
          <Environment preset="warehouse" />

          {/* ── Cinematic Entrance Camera ── */}
          <EntranceCameraRig enabled={enableEntrance && !loading} zoneFocus={zoneFocus} />

          {/* ── The Model ── */}
          <Model
            url={modelUrl}
            activeState={activeState}
            morphWeight={morphWeight}
            zoneMorphs={zoneMorphs}
            onLoad={handleLoad}
            onBodyMetrics={onBodyMetrics}
            enableEntrance={enableEntrance}
            onEntranceComplete={onEntranceComplete}
          />

          {/* ── Manual touch controls (active after entrance completes) ── */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.05}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            target={[0, 1.0, 0]}
          />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#08080B',
    zIndex: 10,
  },
  loadingPulse: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,107,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.dark.text,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingSubtext: {
    marginTop: 6,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#08080B',
    padding: 32,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF4444',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
});
