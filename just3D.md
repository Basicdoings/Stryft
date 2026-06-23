\# STRYFT: PRODUCTION TECHNICAL IMPLEMENTATION SPECIFICATION

\*\*Version:\*\* 1.2

\*\*Target:\*\* Full-Stack System Architecture & LLM Context Injection Blueprint

\*\*Date:\*\* June 2026

\---

\#\# 1\. System Engineering Architecture & Production Data Flow

Stryft executes a decoupled, hybrid architecture designed to maintain an ultra-performant 60 FPS mobile user interface while processing asynchronous asset pipeline operations on the cloud.

By using the \*\*Tripo3D Multiview Generation API\*\*, the cloud computing layout avoids hosting heavy Machine Learning containers, using \*\*Modal Serverless\*\* instead for lighting setups, target pointer injection, and headless file rendering.

\`\`\`  
┌─────────────────┐       (Concurrently Uploads 3 Scans)        ┌─────────────────────────┐  
│ Mobile App      ├────────────────────────────────────────────►│ Supabase Storage Bucket │  
│ (Expo / React N)│                                             └────────────┬────────────┘  
└────────▲────────┘                                                          │  
         │                                                                   ▼ (Database Trigger)  
         │                                                      ┌─────────────────────────┐  
         │                                                      │  Supabase Edge Function │  
         │                                                      └────────────┬────────────┘  
         │                                                                   │  
         │ (Stream Video / Live WebGL Mesh)                                  ▼ (Multiview Request)  
         │                                                      ┌─────────────────────────┐  
         └──────────────────────────────────────────────────────┤      Tripo3D API        │  
                                                                └─────────────────────────┘

\`\`\`

\---

\#\# 2\. Production Database Schema (Supabase Migration SQL)

This schema configures the core structural boundaries for user identities, multivariable body tracking metrics, 3-sided photo scan storage, and gamified RPG loops.

\`\`\`sql  
\-- Target Database Environment: PostgreSQL 15+  
create extension if not exists "uuid-ossp";

\-- 2.1 Profiles Table (Skeletal and Environmental Metrics)  
create table public.profiles (  
  id uuid references auth.users on delete cascade primary key,  
  updated\_at timestamp with time zone default timezone('utc'::text, now()) not null,  
  gender text check (gender in ('male', 'female', 'other')) not null,  
  age integer check (age between 18 and 99\) not null,  
  current\_weight\_kg decimal(5,2) not null,  
  fitness\_level text check (fitness\_level in ('beginner', 'intermediate', 'advanced')) not null,  
  sleep\_quality text check (sleep\_quality in ('poor', 'fair', 'good', 'excellent')) not null,  
  location text default 'Lagos, Nigeria' not null  
);

\-- 2.2 Fitness Goals & 3-Sided Scan Registry  
create table public.fitness\_goals (  
  id uuid default gen\_random\_uuid() primary key,  
  user\_id uuid references public.profiles(id) on delete cascade not null,  
  primary\_goal\_zone text check (primary\_goal\_zone in ('abs', 'glutes', 'v-taper', 'hourglass', 'arms', 'thighs')) not null,  
  secondary\_goal\_zone text,  
  timeline\_weeks integer check (timeline\_weeks in (8, 12, 16)) not null,  
    
  \-- 3-Sided Image Storage Bucket Pointers  
  scan\_front\_url text not null,  
  scan\_side\_url text not null,  
  scan\_back\_url text not null,  
    
  \-- Cloud Asset Trackers  
  tripo\_task\_id text,  
  generated\_avatar\_glb\_url text,  
  efficiency\_coefficient decimal(3,2) default 1.00 not null,  
    
  created\_at timestamp with time zone default timezone('utc'::text, now()) not null  
);

\-- 2.3 RPG Gamification State Engine  
create table public.user\_game\_state (  
  user\_id uuid references public.profiles(id) on delete cascade primary key,  
  current\_xp integer default 0 not null,  
  level integer default 1 not null,  
  attributes jsonb default '{"STR": 10, "END": 10, "WIS": 10, "CON": 10}'::jsonb not null,  
  equipped\_items jsonb default '\[\]'::jsonb not null,  
  last\_login\_at timestamp with time zone default timezone('utc'::text, now())  
);

\-- 2.4 Normalized Workout Master Plans  
create table public.workout\_plans (  
  id uuid default gen\_random\_uuid() primary key,  
  user\_id uuid references public.profiles(id) on delete cascade not null,  
  day\_of\_week text check (day\_of\_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')) not null,  
  exercises jsonb default '\[\]'::jsonb not null, \-- Array of clinical moves \+ animation targeting data  
  created\_at timestamp with time zone default timezone('utc'::text, now()) not null  
);

\-- 2.5 Row-Level Security (RLS) Policies  
alter table public.profiles enable row level security;  
alter table public.fitness\_goals enable row level security;  
alter table public.user\_game\_state enable row level security;  
alter table public.workout\_plans enable row level security;

create policy "Allow profile read/write for owner" on public.profiles for all using (auth.uid() \= id);  
create policy "Allow goals access for owner" on public.fitness\_goals for all using (auth.uid() \= user\_id);  
create policy "Allow game state modification for owner" on public.user\_game\_state for all using (auth.uid() \= user\_id);  
create policy "Allow workout schedule viewing for owner" on public.workout\_plans for all using (auth.uid() \= user\_id);

\`\`\`

\---

\#\# 3\. Tripo3D Ingestion Framework (Supabase Edge Function)

This service compiles the 3 distinct multi-angle image URLs from Supabase Storage and pipes them into Tripo3D's multiview processing system, targeting a clean quad configuration capped at 10,000 faces for mobile rendering performance.

\`\`\`typescript  
// Location: backend/supabase/functions/process-tripo/index.ts  
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"  
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const TRIPO\_API\_KEY \= Deno.env.get("TRIPO\_API\_KEY")\!;  
const SUPABASE\_URL \= Deno.env.get("SUPABASE\_URL")\!;  
const SUPABASE\_SERVICE\_ROLE\_KEY \= Deno.env.get("SUPABASE\_SERVICE\_ROLE\_KEY")\!;

serve(async (req) \=\> {  
  if (req.method \=== 'OPTIONS') {  
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '\*' } });  
  }

  try {  
    const { goal\_id, user\_id, scan\_front\_url, scan\_side\_url, scan\_back\_url } \= await req.json();  
    const supabase \= createClient(SUPABASE\_URL, SUPABASE\_SERVICE\_ROLE\_KEY);

    // 1\. Dispatch Request Payload to Tripo3D Multiview Endpoint  
    const tripoReq \= await fetch("https://api.tripo3d.ai/v2/openapi/task", {  
      method: "POST",  
      headers: {  
        "Content-Type": "application/json",  
        "Authorization": \`Bearer ${TRIPO\_API\_KEY}\`  
      },  
      body: JSON.stringify({  
        type: "multiview\_to\_model",  
        images: \[  
          { name: "front.jpg", url: scan\_front\_url },  
          { name: "side.jpg", url: scan\_side\_url },  
          { name: "back.jpg", url: scan\_back\_url }  
        \],  
        quad: true,              // Structural grid flow alignment  
        face\_limit: 10000,       // Polygon limit capped for smooth rendering performance  
        texture\_quality: "standard", // Target file weights between 3MB and 5MB  
        pbr: true                // Color, Roughness, and Metallic vectors included  
      })  
    });

    const tripoRes \= await tripoReq.json();  
    if (\!tripoRes.data || \!tripoRes.data.task\_id) {  
      throw new Error(\`Tripo Registration Interrupted: ${JSON.stringify(tripoRes)}\`);  
    }

    const taskId \= tripoRes.data.task\_id;

    // 2\. Track Task Execution State via Asynchronous Polling Loop  
    let modelGlbUrl \= "";  
    let pollingAttempts \= 0;  
      
    while (\!modelGlbUrl && pollingAttempts \< 40\) {  
      await new Promise(resolve \=\> setTimeout(resolve, 4000));  
      pollingAttempts++;

      const checkReq \= await fetch(\`https://api.tripo3d.ai/v2/openapi/task/${taskId}\`, {  
        headers: { "Authorization": \`Bearer ${TRIPO\_API\_KEY}\` }  
      });  
      const checkRes \= await checkReq.json();

      if (checkRes.data.status \=== "success") {  
        modelGlbUrl \= checkRes.data.output.model\_mesh.url;  
      } else if (checkRes.data.status \=== "failed") {  
        throw new Error("Tripo3D geometric topology computation failed.");  
      }  
    }

    if (\!modelGlbUrl) throw new Error("Task tracking timed out.");

    // 3\. Persist Generated Asset Path to Database Ecosystem  
    await supabase  
      .from("fitness\_goals")  
      .update({   
        tripo\_task\_id: taskId,  
        generated\_avatar\_glb\_url: modelGlbUrl   
      })  
      .eq("id", goal\_id);

    return new Response(JSON.stringify({ success: true, glbUrl: modelGlbUrl }), {  
      status: 200,  
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '\*' }  
    });

  } catch (err) {  
    return new Response(JSON.stringify({ error: err.message }), {  
      status: 500,  
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '\*' }  
    });  
  }  
});

\`\`\`

\---

\#\# 4\. Multivariable Timeline Calculation Engine

Calculations for the "Future Self" model balance biological limits with the contextual reality filters processed by Gemini.

\#\#\# Predictive Equation Set

The mathematical evolution of targeted vertex sets combines biological boundaries with environmental constraints:

$$New\\\_Vertex\\\_Pos \= Old\\\_Vertex\\\_Pos \+ (Normal\\\_Vector \\times Growth\\\_Factor \\times Efficiency\\\_Coeff)$$

1\. \*\*Muscle Growth Upper Boundary Limits ($Growth\\\_Factor$):\*\*

$$\\text{Weekly Base Growth (Lbs)} \= \\begin{cases} 0.50 & \\text{if User Tier} \= \\text{Beginner} \\\\ 0.25 & \\text{if User Tier} \= \\text{Intermediate} \\\\ 0.125 & \\text{if User Tier} \= \\text{Advanced} \\end{cases}$$

2\. \*\*Contextual Efficiency Down-Regulation Matrix ($Efficiency\\\_Coeff$):\*\*

$$\\text{Base Efficiency} \= 1.00$$

$$\\text{Sleep Quality Multiplier Penalty} \= \\begin{cases} \-0.15 & \\text{if Sleep} \= \\text{Poor} \\\\ \-0.05 & \\text{if Sleep} \= \\text{Fair} \\\\ 0.00 & \\text{if Sleep} \\ge \\text{Good} \\end{cases}$$

\`\`\`typescript  
// Location: mobile-app/src/utils/predictionEngine.ts

interface ComputationInput {  
  experienceTier: 'beginner' | 'intermediate' | 'advanced';  
  weeksDuration: 8 | 12 | 16;  
  sleepMetric: 'poor' | 'fair' | 'good' | 'excellent';  
}

export function computeTargetEvolutions(input: ComputationInput): {  
  targetMorphWeight: number; // Scaled value clamped precisely between 0.0 and 1.0  
  calculatedEfficiency: number;  
} {  
  // 1\. Match biological growth thresholds  
  let biologicalWeeklyConstant \= 0.25;  
  if (input.experienceTier \=== 'beginner') biologicalWeeklyConstant \= 0.50;  
  if (input.experienceTier \=== 'advanced') biologicalWeeklyConstant \= 0.125;

  const baselinePotentialGrowth \= biologicalWeeklyConstant \* input.weeksDuration;

  // 2\. Compute Environmental Adjustments  
  let coreEfficiencyMultiplier \= 1.00;  
  if (input.sleepMetric \=== 'poor') coreEfficiencyMultiplier \-= 0.15;  
  if (input.sleepMetric \=== 'fair') coreEfficiencyMultiplier \-= 0.05;

  // 3\. Normalize outputs into explicit 3D shape engine boundaries  
  const localizedOutputFactor \= (baselinePotentialGrowth \* coreEfficiencyMultiplier) / (0.50 \* 16);  
  const strictClampedMorphTarget \= Math.max(0.0, Math.min(localizedOutputFactor, 1.0));

  return {  
    targetMorphWeight: parseFloat(strictClampedMorphTarget.toFixed(2)),  
    calculatedEfficiency: coreEfficiencyMultiplier  
  };  
}

\`\`\`

\---

\#\# 5\. Live On-Device Multi-Pose Canvas State Machine

This optimized client component handles on-device WebGL canvas rendering, utilizing a cross-faded animation mixer loop to shift between the 5 asset styles without causing ui thread lag.

\`\`\`typescript  
// Location: mobile-app/src/components/LiveAvatarStateCanvas.tsx  
import React, { useEffect, useRef } from 'react';  
import { View, StyleSheet, AppState } from 'react-native';  
import { GLView } from 'expo-gl';  
import { Renderer } from 'expo-three';  
import \* as THREE from 'three';  
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface StateCanvasProps {  
  tripoMeshUrl: string;  
  activeState: 'sit' | 'look\_around' | 'press\_up' | 'warm-up' | 'fold\_arms';  
  morphWeight: number; // Programmatic scalar target value delivered via prediction matrix  
}

export default function LiveAvatarStateCanvas({ tripoMeshUrl, activeState, morphWeight }: StateCanvasProps) {  
  const requestFrameRef \= useRef\<number | null\>(null);  
  const animationMixerRef \= useRef\<THREE.AnimationMixer | null\>(null);  
  const activeActionRef \= useRef\<THREE.AnimationAction | null\>(null);  
  const registeredActionsMap \= useRef\<{ \[key: string\]: THREE.AnimationAction }\>({});  
  const localIsComponentActive \= useRef\<boolean\>(true);

  // Camera settings optimized to match specific postures  
  const reframeCameraSpace \= (camera: THREE.PerspectiveCamera, currentPose: string) \=\> {  
    if (currentPose \=== 'sit') {  
      camera.position.set(0, 0.55, 1.65);  
    } else if (currentPose \=== 'look\_around') {  
      camera.position.set(0, 1.25, 1.05); // Frame directly over upper posture lines  
    } else {  
      camera.position.set(0, 1.00, 2.10); // Standard full framework configuration  
    }  
    camera.lookAt(0, 0.5, 0);  
  };

  const handleWebGLInit \= async (gl: any) \=\> {  
    const renderer \= new Renderer({ gl });  
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene \= new THREE.Scene();  
    scene.background \= null; // Maintain transparent canvas context to inherit underlying native card aesthetics

    const camera \= new THREE.PerspectiveCamera(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 50);  
    reframeCameraSpace(camera, activeState);

    // Dynamic High-Contrast Rim Lighting Architecture  
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));  
    const structuralKeyLight \= new THREE.DirectionalLight(0xffffff, 1.1);  
    structuralKeyLight.position.set(1.5, 3, 2);  
    scene.add(structuralKeyLight);

    const localizedRimGlow \= new THREE.DirectionalLight(0x00bfff, 1.4); // Electric Cyan highlight color theme  
    localizedRimGlow.position.set(-2, 1.5, \-2);  
    scene.add(localizedRimGlow);

    // Initialize asset ingestion loaders  
    const gltfLoader \= new GLTFLoader();  
      
    gltfLoader.load(tripoMeshUrl, (gltf) \=\> {  
      const modelAsset \= gltf.scene;  
      scene.add(modelAsset);  
      modelAsset.position.set(0, 0, 0);

      // Evaluate geometry maps and assign multivariable morph constants  
      modelAsset.traverse((meshChild) \=\> {  
        if ((meshChild as THREE.Mesh).isMesh) {  
          const targetMesh \= meshChild as THREE.Mesh;  
          if (targetMesh.morphTargetInfluences && targetMesh.morphTargetDictionary) {  
            const structuralIndex \= targetMesh.morphTargetDictionary\['glute\_growth\_target'\];  
            if (structuralIndex \!== undefined) {  
              targetMesh.morphTargetInfluences\[structuralIndex\] \= morphWeight;  
            }  
          }  
        }  
      });

      // Bind Animation Systems  
      const engineMixer \= new THREE.AnimationMixer(modelAsset);  
      animationMixerRef.current \= engineMixer;

      const systemicPoseKeys \= \['sit', 'look\_around', 'press\_up', 'warm-up', 'fold\_arms'\];  
      systemicPoseKeys.forEach((poseName) \=\> {  
        // Hydrate bone coordinate files stored locally in the package bundle  
        const skeletalJSONMap \= require(\`../../assets/animations/${poseName}.json\`);  
        const structuralClip \= THREE.AnimationClip.parse(skeletalJSONMap);  
        const proceduralAction \= engineMixer.clipAction(structuralClip);  
          
        proceduralAction.loop \= THREE.LoopRepeat;  
        registeredActionsMap.current\[poseName\] \= proceduralAction;  
      });

      // Play default state track  
      const baselineAction \= registeredActionsMap.current\[activeState\];  
      if (baselineAction) {  
        baselineAction.play();  
        activeActionRef.current \= baselineAction;  
      }  
    });

    const runtimeClock \= new THREE.Clock();  
    const renderingExecutionLoop \= () \=\> {  
      if (\!localIsComponentActive.current) return; // Prevent background thread processing leaks

      requestFrameRef.current \= requestAnimationFrame(renderingExecutionLoop);  
      const deltaScalar \= runtimeClock.getDelta();

      if (animationMixerRef.current) {  
        animationMixerRef.current.update(deltaScalar);  
      }

      renderer.render(scene, camera);  
      gl.endFrameEXP();  
    };

    renderingExecutionLoop();  
  };

  // State Transition Cross-Fade Automation Hook  
  useEffect(() \=\> {  
    const inboundTrackAction \= registeredActionsMap.current\[activeState\];  
    const trackingOutboundAction \= activeActionRef.current;

    if (inboundTrackAction && inboundTrackAction \!== trackingOutboundAction) {  
      if (trackingOutboundAction) {  
        inboundTrackAction.reset().setEffectiveWeight(1).play();  
        trackingOutboundAction.crossFadeTo(inboundTrackAction, 0.35, true);  
      } else {  
        inboundTrackAction.play();  
      }  
      activeActionRef.current \= inboundTrackAction;  
    }  
  }, \[activeState\]);

  // Handle AppState lifecycle changes to pause rendering when backgrounded  
  useEffect(() \=\> {  
    const handleStateMutation \= (incomingAppState: string) \=\> {  
      if (incomingAppState \!== 'active') {  
        localIsComponentActive.current \= false;  
        if (requestFrameRef.current) cancelAnimationFrame(requestFrameRef.current);  
      } else {  
        localIsComponentActive.current \= true;  
      }  
    };

    const lifecycleSubscription \= AppState.addEventListener('change', handleStateMutation);  
    return () \=\> {  
      localIsComponentActive.current \= false;  
      if (requestFrameRef.current) cancelAnimationFrame(requestFrameRef.current);  
      lifecycleSubscription.remove();  
    };  
  }, \[\]);

  return (  
    \<View style={styles.canvasFrameContainer}\>  
      \<GLView style={styles.renderingCoreViewport} onContextCreate={handleWebGLInit} /\>  
    \</View\>  
  );  
}

const styles \= StyleSheet.create({  
  canvasFrameContainer: { flex: 1, backgroundColor: 'transparent' },  
  renderingCoreViewport: { flex: 1 }  
});

\`\`\`

\---

\#\# 6\. Critical Technical Safeguards for LLM Engine Build

To guarantee production-grade execution when parsing this documentation through any code generation agent, enforce strict compliance across the following parameters:

1\. \*\*Loop Frame Purging:\*\* Inside the \`LiveAvatarStateCanvas\` component, the \`cancelAnimationFrame\` cleanup wrapper must execute when the component unmounts or the app shifts focus to a different screen layout context. Failure to do so will cause WebGL leaks, driving battery drain and frame rate drops on mobile devices.  
2\. \*\*Strict Range Bounding Caps:\*\* All calculated parameters fed into \`morphTargetInfluences\` values must wrap tightly inside checking logic forcing limits of ($0.0 \\le \\text{Value} \\le 1.0$). If an invalid float breaches these bounds, the vertex positions will distort, warping the model's rigged bone joints.  
3\. \*\*Texture Dimension Regulation:\*\* Force all ingestion buckets processing image conversions to configure incoming Tripo assets via standard map distributions ($2048 \\times 2048$ resolution arrays max). This locks the raw bundle down to a light 3MB–5MB target, ensuring quick, low-latency downloads on local networks.