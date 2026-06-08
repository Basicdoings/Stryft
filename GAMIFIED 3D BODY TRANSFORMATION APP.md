# **GAMIFIED 3D BODY TRANSFORMATION APP**

## **Master Technical & Product Documentation**

## **Version: 1.0 (Gamified & AI-Enhanced)**

## **Date: November 2025**

# **PART 1: THE PRODUCT MANUAL**

## **1\. Executive Summary**

Project Atlas is not just a fitness app; it is a "Body-Tamagotchi." It combines clinical-grade 3D body scanning with high-retention RPG (Role-Playing Game) mechanics. Users don't just track weight; they evolve an avatar. The app uses Generative AI to create hyper-localized plans (e.g., Nigerian diet compatibility) and visualizes the future body to provide immediate psychological gratification for delayed physiological results.

## **2\. Core Features (The "Hook")**

**Visual Prediction:** Users see their "Future Self" immediately upon signup using 3D Morphing technology.  
**The Avatar System:** A 3D character that mirrors the user. If the user eats well, the avatar glows. If the user misses a workout, the avatar looks tired.  
**Gamified Stats:** Health data is converted into RPG attributes (Strength, Agility, Wisdom).  
**Hyper-Local AI:** Meal plans that understand "Ofada Rice" and "Moi Moi" alongside generic macros, specifically tuned for the Nigerian/African market.

## **3\. User Journey**

**The Scan:** User uploads a photo. AI generates a 3D mesh.  
**The Contract:** User sets a goal (e.g., "Warrior Physique"). The app predicts the timeline.  
**The Quest:** Daily workouts are presented as "Missions."  
**The Reward:** Completing missions earns "Sweat Coins" to buy digital gear for the avatar.  
**The Reality Check:** Weekly re-scans verify progress. Anti-cheat AI ensures the user isn't faking results.

## **4\. Monetization Strategy**

**Freemium:** Basic Scan \+ Generic Quests.  
**Premium ($9.99/mo):** Unlimited Scans, Localized AI Meal Plans, Social Guilds.  
**Microtransactions:** Cosmetic items for the 3D Avatar (Digital fashion).

# **PART 2: THE ENGINEERING CODEX (Technical)**

## **5\. System Architecture**

Type: Hybrid Cloud / Edge Computing  
Core Philosophy: "Heavy Compute on Cloud, Rendering on Device."

## **5.1 High-Level Diagram**

code  
Text  
\[Mobile App (React Native)\]   
      \<-- Realtime Websockets (Supabase) \--\>   
\[Supabase Platform (Auth/DB/Edge Functions)\]  
      \--\> \[Trigger\] \--\> \[RunPod Serverless GPU\]  
                                |  
                        \[AI Context Engine (Gemini)\]

## **5.2 Technology Stack**

Frontend: React Native (Expo SDK 50+), Three.js (expo-three) for 3D rendering.  
Backend: Supabase (PostgreSQL 15, Edge Functions, Auth, Storage).  
AI/LLM: Google Gemini 2.0 Flash (Context/Planning).  
3D Compute: RunPod Serverless (Python 3.10, PyTorch, CUDA 11.8).  
3D Engine: SAM 3D (Segment Anything), Trimesh, OpenCV.

## **6\. The 3D Processing Pipeline**

This module converts 2D photos into a playable, morphable 3D asset.

## **6.1 RunPod Worker (Python)**

The worker runs on an NVIDIA RTX 4090 container.  
Input: User photo URL.  
Segmentation: SAM (Segment Anything Model) masks the user.  
Depth Estimation: HMR 2.0 estimates volumetric depth.  
Texture Baking: Projects the photo onto the mesh UV map.  
Output: .obj file (Mesh) and .jpg (Texture Map).

## **6.2 Mesh Morphing Engine (The "Prediction")**

Transforms the mesh based on the "Efficiency Score."  
Formula: New\_Vertex\_Pos \= Old\_Vertex\_Pos \+ (Normal\_Vector \* Growth\_Factor \* Efficiency\_Coeff)  
Groups: Vertices are tagged by group (GROUP\_GLUTES, GROUP\_ABS) to allow targeted morphing.

## **7\. The Gamification Engine**

Transforms biometric data into Game State.

## **7.1 Attribute Calculation (TypeScript)**

Logic enables the "Stat Hexagon" visualization.  
code  
TypeScript  
interface GameStats {  
  STR: number; // Strength: Based on Volume (kg \* reps)  
  END: number; // Endurance: Based on Cardio Duration  
  WIS: number; // Wisdom: Based on Logging Consistency  
  CON: number; // Constitution: Based on Sleep Quality  
}

function calculateLevel(xp: number): number {  
  return Math.floor(0.1 \* Math.sqrt(xp)); // Square root leveling curve  
}

## **7.2 Database Schema (PostgreSQL)**

code  
SQL  
create table user\_game\_state (  
  user\_id uuid references auth.users,  
  current\_xp int default 0,  
  level int default 1,  
  attributes jsonb default '{"STR": 10, "WIS": 10}',  
  equipped\_items jsonb, \-- Stores URLs of 3D assets (clothes)  
  last\_login timestamptz  
);

## **7.3 Visual Rewards (Three.js Layering)**

The frontend renders two meshes:  
Body Mesh: The morphed user scan.  
Item Mesh: 3D accessories rigged to the same skeleton.  
Effect: When streak \> 7, apply BloomFilter (Glowing Aura).

## **8\. AI Prediction & Context Engine**

The "Brain" that adjusts expectations based on reality.

## **8.1 The Reality Filter**

Instead of linear math, we use Gemini to calculate an Efficiency Coefficient (0.0 \- 1.0).  
Input Context:  
Location: "Lagos, Nigeria"  
Resources: "Generators often off (no AC for sleep)", "Access to gym"  
Diet: "High carb (Cassava based)"  
AI Processing: The AI reduces the hypertrophy prediction coefficient because poor sleep (due to heat/power) reduces recovery by 15%.

## **8.2 Hyper-Local Planning**

Solves the "Availability" problem.  
Prompt Strategy: "You are a Nigerian Nutritionist. Suggest high protein meals using ONLY ingredients found in a standard Lagos market (e.g., Mile 12)."  
Sample Output: "Substituted Quinoa for Couscous/Garri (Budget Friendly)."

## **9\. Infrastructure & Security**

## **9.1 Serverless GPU (RunPod)**

Configuration: Docker container based on pytorch/cuda:11.8.  
Auto-scale: Scales to zero when idle. Scales up to 50 concurrent workers during peak.  
Privacy: rm \-rf /tmp/user\_data executes immediately after upload.

## **9.2 Security**

Biometrics: Photos are encrypted at rest (AES-256).  
RLS Policies: Supabase Row Level Security ensures users can only query their own game state.  
Anti-Cheat:  
Users challenging friends to "Transformation Duels" must upload video.  
AI analyzes video optical flow to detect "sucking in stomach" vs "actual fat loss."

## **10\. Cost Analysis (Unit Economics)**

GPU Scan: $0.024 per scan.  
AI Plan: $0.002 per week.  
Storage: $0.001 per user/mo.  
Total Monthly Cost per Active User: \~$0.15  
Subscription: $9.99  
Profit Margin: \~98%

## **11\. Deployment Guide**

Database: supabase db push (Deploys Schema & RPCs).  
Edge Functions: supabase functions deploy process-scan.  
RunPod: Build Docker image \-\> Push to Registry \-\> Update RunPod Template.  
Mobile: eas build \--profile production.