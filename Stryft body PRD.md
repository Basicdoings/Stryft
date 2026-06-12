# **STRYFT SYSTEM REQUIREMENTS & SPECIFICATION (PRD/TDD)**

**Version:** 1.1  
**Target:** LLM-to-Code Context Injection / System Builder Prompt  
**Date:** June 2026

## **1\. System Overview & Core Product Loop**

Stryft is an AI-powered fitness transformation platform built around a high-retention "Body-Tamagotchi" RPG loop. It replaces traditional text/graph-based tracking with immediate psychological gratification via interactive 3D visual predictions.  
 \[1. Two-Photo Onboarding Scan\] ──\> \[2. Gemini Reality-Filtered Timeline Prediction\]  
                 ▲                                               │  
                 │                                               ▼  
  \[6. Weekly Anti-Cheat Check-in\] \<── \[5. XP/Sweat Coin Rewards\] \<── \[4. Personalized Missions\]

### **Technical Philosophy**

* **Decoupled Heavy Compute:** Heavy calculations and frame baking run headlessly on the cloud (Modal/RunPod).  
* **Ultra-Performance Mobile Client:** Cross-platform native compilation (React Native/Expo) utilizing the native thread for UI interactions (react-native-reanimated) and isolation of 3D spaces to dedicated canvases (expo-gl \+ three).

## **2\. Onboarding Data Model & Supabase Schema**

The database layer enforces relational constraints, secure storage paths, and strictly segmented Row-Level Security (RLS) policies.  
SQL  
\-- Extension setup for optimized querying  
create extension if not exists "uuid-ossp";

\-- 1\. Profiles Table (Core Biometrics)  
create table public.profiles (  
  id uuid references auth.users on delete cascade primary key,  
  updated\_at timestamp with time zone default timezone('utc'::text, now()) not null,  
  gender text check (gender in ('male', 'female', 'other')) not null,  
  age integer check (age between 18 and 99) not null,  
  current\_weight\_kg decimal(5,2) not null,  
  fitness\_level text check (fitness\_level in ('beginner', 'intermediate', 'advanced')) not null,  
  sleep\_quality text check (sleep\_quality in ('poor', 'fair', 'good', 'excellent')) not null,  
  location text default 'Lagos, Nigeria' not null  
);

\-- 2\. Fitness Goals & Scan Storage Map  
create table public.fitness\_goals (  
  id uuid default gen\_random\_uuid() primary key,  
  user\_id uuid references public.profiles(id) on delete cascade not null,  
  primary\_goal\_zone text check (primary\_goal\_zone in ('abs', 'glutes', 'v-taper', 'hourglass', 'arms', 'thighs')) not null,  
  secondary\_goal\_zone text,  
  timeline\_weeks integer check (timeline\_weeks in (8, 12, 16)) not null,  
    
  \-- Supabase Storage Bucket File Path Reference Strings  
  full\_body\_photo\_url text not null,  
  targeted\_zone\_photo\_url text not null,  
    
  \-- Cloud Generated Assets  
  generated\_ai\_texture\_url text,  
  initial\_body\_fat\_pct decimal(4,2),  
  efficiency\_coefficient decimal(3,2) default 1.00 not null,  
    
  created\_at timestamp with time zone default timezone('utc'::text, now()) not null  
);

\-- 3\. Gamified RPG State Table  
create table public.user\_game\_state (  
  user\_id uuid references public.profiles(id) on delete cascade primary key,  
  current\_xp integer default 0 not null,  
  level integer default 1 not null,  
  attributes jsonb default '{"STR": 10, "END": 10, "WIS": 10, "CON": 10}'::jsonb not null,  
  equipped\_items jsonb default '\[\]'::jsonb not null,  
  last\_check\_in timestamp with time zone  
);

\-- 4\. Dynamic Workout Plans Matrix  
create table public.workout\_plans (  
  id uuid default gen\_random\_uuid() primary key,  
  user\_id uuid references public.profiles(id) on delete cascade not null,  
  day\_of\_week text check (day\_of\_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')) not null,  
  exercises jsonb default '\[\]'::jsonb not null, \-- Array of clinical moves \+ 5-sec loop URLs  
  created\_at timestamp with time zone default timezone('utc'::text, now()) not null  
);

\-- SECURITY ENFORCEMENT (Row-Level Security)  
alter table public.profiles enable row level security;  
alter table public.fitness\_goals enable row level security;  
alter table public.user\_game\_state enable row level security;  
alter table public.workout\_plans enable row level security;

create policy "Profiles isolated access" on public.profiles for all using (auth.uid() \= id);  
create policy "Goals isolated access" on public.fitness\_goals for all using (auth.uid() \= user\_id);  
create policy "Game state isolated access" on public.user\_game\_state for all using (auth.uid() \= user\_id);  
create policy "Workouts isolated access" on public.workout\_plans for all using (auth.uid() \= user\_id);

## **3\. Cloud Vision Pipeline (2D Photos to 3D Mesh & Texture)**

This microservice isolates, meshes, and bakes high-fidelity textures over standard shapes.

### **Infrastructure Specs**

* **Runtime Environments:** Modal or RunPod Serverless.  
* **Hardware Target:** NVIDIA RTX 4090 Container instance (CUDA 11.8 / PyTorch core).

### **Step-by-Step Computer Vision Algorithm**

1. **Isolation Block:** The Python worker downloads both image targets from the Supabase storage URLs. It processes them via **SAM (Segment Anything Model)** to strip background textures and compile a binary transparency mask of the user.  
2. **Volumetric Skeleton Fit:** The **Full-Body Scan** is processed via **HMR 2.0 (Human Mesh Recovery)**. It calculates structural bone segments, shoulder-to-waist indices, and global height markers. It deforms a standard low-poly humanoid mesh base to replicate the user's base structural frame.  
3. **Macro-Texture Projections:** The **Targeted Area Scan** undergoes perspective spatial calibration. Using **Trimesh** and **OpenCV**, high-resolution texture maps from this micro-photo are baked directly over the specialized vertex target zones (GROUP\_ABS, GROUP\_GLUTES) of the standardized UV coordinate map.  
4. **Ephemeral Data Cleanup:** The file system immediately runs a secure purge routine:  
5. Python

import os, shutil  
def purge\_session\_cache(session\_dir):  
    if os.path.exists(session\_dir):  
        shutil.rmtree(session\_dir) \# Complete physical sector deletion

6.   
7. 

## **4\. Headless Rigging & Muscle-Pointer Video Generator**

Generates hardware-accelerated, short-form reference video loops using standard animation assets.

### **Infrastructure Specs**

* **Environment Engine:** Headless Blender 4.x+ via the Python Blender API (bpy) running inside a scalable docker instance.  
* **Target Frame Specs:** 5 Seconds, 30 FPS (Exactly 150 Frames total), exported via **Blender Eevee Render Pipeline**.

Python  
import bpy  
import math

def generate\_target\_pointer\_clip(user\_glb\_path, exercise\_key, targeted\_bone\_name, output\_path):  
    \# Initialize blank slate and render options  
    bpy.ops.wm.read\_factory\_settings(use\_empty=True)  
    scene \= bpy.context.scene  
    scene.render.engine \= 'BLENDER\_EEVEE'  
    scene.render.fps \= 30  
    scene.frame\_start \= 1  
    scene.frame\_end \= 150  
      
    \# 1\. Import morphed and textured user avatar mesh  
    bpy.ops.import\_scene.gltf(filepath=user\_glb\_path)  
    avatar\_model \= bpy.context.selected\_objects\[0\]  
      
    \# 2\. Append pre-recorded standard skeletal motion track (e.g., Squat)  
    bpy.ops.import\_scene.gltf(filepath=f"/lib/animations/{exercise\_key}.gltf")  
    armature \= bpy.data.objects\['Armature'\]  
      
    \# 3\. Dynamic 3D UI Pointer Insertion  
    target\_bone \= armature.pose.bones.get(targeted\_bone\_name)  
    if target\_bone:  
        \# Spawn a stylized geometric arrow mesh  
        bpy.ops.mesh.primitive\_cone\_add(radius1=0.08, depth=0.25, location=(0, 0, 0))  
        pointer \= bpy.context.object  
          
        \# Assign a distinct emissive neon shader material  
        mat \= bpy.data.materials.new(name="Target\_Neon\_Glow")  
        mat.use\_nodes \= True  
        nodes \= mat.node\_tree.nodes  
        emission \= nodes.new(type\='ShaderNodeEmission')  
        emission.inputs\['Strength'\].default\_value \= 6.0  
        emission.inputs\['Color'\].default\_value \= (0.0, 0.5, 1.0, 1.0) \# Neon cyan  
        mat.node\_tree.links.new(emission.outputs\['Emission'\], nodes.get('Material Output').inputs\['Surface'\])  
        pointer.data.materials.append(mat)  
          
        \# Direct constraint binding to lock to muscle skeleton group  
        constraint \= pointer.constraints.new(type\='CHILD\_OF')  
        constraint.target \= armature  
        constraint.subtarget \= target\_bone.name  
        pointer.location \= (0, \-0.4, 0) \# Offsets pointer cleanly in front of targeted bone  
          
        \# Keyframe execution for pulsing visualization  
        for frame in range(scene.frame\_start, scene.frame\_end \+ 1):  
            scene.frame\_set(frame)  
            pointer.scale \= (1.0 \+ math.sin(frame \* 0.15) \* 0.08, 1.0, 1.0)  
            pointer.keyframe\_insert(data\_path="scale", index=-1)  
              
    \# 4\. Render execution step  
    scene.render.image\_settings.file\_format \= 'FFMPEG'  
    scene.render.ffmpeg.format \= 'MPEG4'  
    scene.render.ffmpeg.codec \= 'H264'  
    scene.render.filepath \= output\_path  
    bpy.ops.render.render(animation=True)

## **5\. Multivariable Timeline & Prediction Calculations**

The algorithmic calculations balance physiological constraints against environmental parameters mapped out during onboarding.

### **Shape-Key Vertex Displacement Formula**

Every vertex coordinate changes dynamically along normal vectors across target coordinates:  
$$New\\\_Vertex\\\_Pos \= Old\\\_Vertex\\\_Pos \+ (Normal\\\_Vector \\times Growth\\\_Factor \\times Efficiency\\\_Coeff)$$  
                          \[Core Metrics Input Matrix\]  
                                       │  
                ┌──────────────────────┴──────────────────────┐  
                ▼                                             ▼  
       \[Lean Muscle Growth\]                          \[Fat Reduction Visibility\]  
  \* Beginner: \+0.50 lbs/week                    \* Base Caloric Deficit Math  
  \* Intermediate: \+0.25 lbs/week                \* Male Definition: ≤ 12% Body Fat  
  \* Advanced: \+0.125 lbs/week                   \* Female Definition: ≤ 18-20% Body Fat  
                │                                             │  
                └──────────────────────┬──────────────────────┘  
                                       │  
                                       ▼  
                     \[Gemini Contextual Reality Filter\]  
                    Evaluates Location, Sleep & Resources  
                     Output: Efficiency Coefficient (0-1)

### **Script Execution Model (TypeScript Optimization Pipeline)**

TypeScript  
interface BiometricProfile {  
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';  
  timelineWeeks: number;  
  currentWeightKg: number;  
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';  
  location: string;  
}

export function calculateTimelinePredictions(profile: BiometricProfile): {  
  expectedMuscleGainKg: number;  
  efficiencyScore: number;  
  recommendedMorphInfluence: number;  
} {  
  // 1\. Establish biological growth barriers  
  let baseWeeklyMuscleGainLbs \= 0.25; // Intermediate default  
  if (profile.fitnessLevel \=== 'beginner') baseWeeklyMuscleGainLbs \= 0.50;  
  if (profile.fitnessLevel \=== 'advanced') baseWeeklyMuscleGainLbs \= 0.125;  
    
  // 2\. Compute baseline ideal output parameters  
  const totalIdealGainLbs \= baseWeeklyMuscleGainLbs \* profile.timelineWeeks;  
    
  // 3\. Apply Contextual Reality Filters  
  let environmentalCoeff \= 1.00;  
    
  // Down-regulate recovery output based on structural limitations (e.g., local power constraints)  
  if (profile.sleepQuality \=== 'poor') environmentalCoeff \-= 0.15;  
  if (profile.sleepQuality \=== 'fair') environmentalCoeff \-= 0.05;  
    
  const absoluteMuscleGainKg \= (totalIdealGainLbs \* environmentalCoeff) \* 0.453592;  
    
  return {  
    expectedMuscleGainKg: parseFloat(absoluteMuscleGainKg.toFixed(2)),  
    efficiencyScore: environmentalCoeff,  
    recommendedMorphInfluence: Math.min(parseFloat((environmentalCoeff \* (profile.timelineWeeks / 16)).toFixed(2)), 1.0)  
  };  
}

## **6\. Frontend Execution Architecture (React Native / Expo)**

Frontend interfaces segment canvas rendering cleanly to maintain execution cycles at a stable 60 FPS baseline.

### **High-Level App Screen Layout**

\[React Native Main Navigation Root\]  
  ├─ Custom Main Dashboard (Native Thread Reanimated Layer)  
  ├─ Workout Mission Hub  
  │     └─ Native Modals \-\> expo-video Player Component (Hardware Accelerated)  
  └─ Interactive Avatar Studio View  
        └─ Isolated WebGL Canvas Component \-\> expo-gl \+ three Component

### **Isolated Canvas Player Implementation Specs**

TypeScript  
import React, { useEffect, useRef } from 'react';  
import { View, StyleSheet } from 'react-native';  
import { GLView } from 'expo-gl';  
import { Renderer } from 'expo-three';  
import \* as THREE from 'three';  
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function IsolatedAvatarView({ morphValue, textureUrl, zoneFocus }) {  
  let frameId: number;

  const handleCanvasInit \= async (gl: any) \=\> {  
    // Canvas Setup Pipeline  
    const renderer \= new Renderer({ gl });  
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);  
      
    const scene \= new THREE.Scene();  
    scene.background \= new THREE.Color('\#0A0A0A'); // Strict app dark styling theme  
      
    const camera \= new THREE.PerspectiveCamera(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);  
      
    // Dynamic Frame Targeting Strategy  
    if (zoneFocus \=== 'abs') {  
      camera.position.set(0, 1.1, 1.6); // Lock position directly over the core  
    } else if (zoneFocus \=== 'glutes') {  
      camera.position.set(0.6, 0.8, \-1.4); // Pivot target viewpoint around back-profile  
    } else {  
      camera.position.set(0, 1.4, 3.2); // Default structural outline view  
    }

    // Volumetric Shadow Cast Lighting Configuration  
    const keyLight \= new THREE.DirectionalLight(0xffffff, 1.3);  
    keyLight.position.set(2, 4, 3);  
    scene.add(keyLight);  
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Asset Hydration Layer  
    const loader \= new GLTFLoader();  
    const txtLoader \= new THREE.TextureLoader();  
    const bodyTexture \= txtLoader.load(textureUrl);

    loader.load('https://cdn.stryft.com/assets/base\_skeleton.glb', (gltf) \=\> {  
      const model \= gltf.scene;  
        
      model.traverse((child) \=\> {  
        if ((child as THREE.Mesh).isMesh) {  
          const targetMesh \= child as THREE.Mesh;  
            
          // Map texture to custom mesh geometry  
          if (targetMesh.material && 'map' in targetMesh.material) {  
            (targetMesh.material as THREE.MeshStandardMaterial).map \= bodyTexture;  
            (targetMesh.material as THREE.MeshStandardMaterial).needsUpdate \= true;  
          }  
            
          // Apply computational target values to morph indices  
          if (targetMesh.morphTargetInfluences && targetMesh.morphTargetDictionary) {  
            const indexKey \= zoneFocus \=== 'abs' ? 'abs\_shred' : 'glute\_scale';  
            const targetIdx \= targetMesh.morphTargetDictionary\[indexKey\];  
            if (targetIdx \!== undefined) {  
              targetMesh.morphTargetInfluences\[targetIdx\] \= morphValue;  
            }  
          }  
        }  
      });  
      scene.add(model);  
    });

    // Rendering Execution Loop  
    const clock \= new THREE.Clock();  
    const renderLoop \= () \=\> {  
      frameId \= requestAnimationFrame(renderLoop);  
      const elapsed \= clock.getElapsedTime();  
        
      // Idle human simulation drift effect  
      scene.position.y \= Math.sin(elapsed \* 1.2) \* 0.015;  
        
      renderer.render(scene, camera);  
      gl.endFrameEXP();  
    };  
    renderLoop();  
  };

  useEffect(() \=\> {  
    return () \=\> {  
      if (frameId) cancelAnimationFrame(frameId); // Essential thread protection cleanup  
    };  
  }, \[\]);

  return (  
    \<View style\={styles.canvasContainer}\>  
      \<GLView style\={styles.engineFrame} onContextCreate\={handleCanvasInit} /\>  
    \</View\>  
  );  
}

const styles \= StyleSheet.create({  
  canvasContainer: { flex: 1, backgroundColor: '\#0A0A0A' },  
  engineFrame: { flex: 1 }  
});

## **7\. Critical Safeguards & Edge Cases for LLM Execution**

When parsing this configuration blueprint to programmatically generate execution components, force compliance across these three critical parameters:

1. **Strict Lifecycle De-allocation:** To prevent memory leaks, requestAnimationFrame hooks inside mobile view structures must be systematically disconnected from listeners whenever the user changes interface focus views.  
2. **Strict Morph Clamping Vectors:** All computed morph targets passed across runtime environments must enforce a bounding range threshold ($0.0 \\le \\text{Value} \\le 1.0$). Passing un-clamped arithmetic floats will warp bone joints, causing broken visual rigs.  
3. **Raster Engine Selection Enforcements:** Cloud workflow scripts using Blender code snippets must always be configured to use the BLENDER\_EEVEE processing engine. Setting standard outputs to Cycles will drop unit economics metrics by running long, high-overhead rendering operations on server backgrounds.

