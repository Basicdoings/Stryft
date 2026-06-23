import { ScanPhoto, ScanPose } from '@/store/useOnboardingStore';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';

export interface ScanPipelineResponse {
  status: 'success' | 'error' | 'processing' | 'rigging' | 'animating';
  provider?: string;
  tripo_task_id?: string;
  side_views_available?: boolean;
  generated_mesh_url?: string | null;
  generated_texture_url?: string | null;
  generated_preview_url?: string | null;
  // Animation pipeline fields
  rig_task_id?: string | null;
  retarget_task_id?: string | null;
  rigged_mesh_url?: string | null;
  animated_mesh_url?: string | null;
  message?: string;
}

type ScanPhotoMap = Record<ScanPose, ScanPhoto | null>;

export async function submitThreeViewScan(userId: string, photos: ScanPhotoMap): Promise<ScanPipelineResponse> {
  const front = photos.front?.base64;
  const right = photos.right?.base64;
  const left = photos.left?.base64;
  if (!front || !right || !left) {
    throw new Error('Front, right, and left scan photos are required.');
  }

  // Dynamically resolve your computer's local IP address for physical Android testing
  const hostUri = Constants.expoConfig?.hostUri;
  const ipAddress = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
  const edgeFunctionUrl = `http://${ipAddress}:54321/functions/v1/process-scan`;

  // Temporarily use direct fetch to hit the local Deno server instead of the cloud invoke
  try {
    const anonKey = (supabase as any).supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({
        user_id: userId,
        front_b64: front,
        right_b64: right,
        left_b64: left,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process scan');
    }

    const data = await response.json();
    
    if (data.status === 'processing' && data.tripo_task_id) {
      // Poll for completion
      const taskId = data.tripo_task_id;
      const startedAt = Date.now();
      const timeoutMs = 300_000; // 5 minutes

      while (Date.now() - startedAt < timeoutMs) {
        // Wait 5 seconds between polls
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const pollResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
          },
          body: JSON.stringify({
            action: 'check_status',
            task_id: taskId,
          }),
        });

        if (!pollResponse.ok) {
          continue; // Ignore transient errors and keep polling
        }

        const pollData = await pollResponse.json();
        
        if (pollData.status === 'success') {
          return pollData as ScanPipelineResponse;
        } else if (pollData.status === 'error') {
          throw new Error(pollData.message || 'Tripo task failed during polling');
        }
        // If status is 'processing', loop continues
      }
      
      throw new Error('Timed out waiting for 3D model generation');
    }

    return data as ScanPipelineResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred during the scan pipeline.');
  }
}

/**
 * Request animation (rigging + retargeting) for a completed Tripo model task.
 * Call this after the base model scan completes successfully.
 */
export async function requestAnimation(
  tripoTaskId: string,
  animations: string[] = ['idle'],
): Promise<ScanPipelineResponse> {
  const hostUri = Constants.expoConfig?.hostUri;
  const ipAddress = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
  const edgeFunctionUrl = `http://${ipAddress}:54321/functions/v1/process-scan`;
  const anonKey = (supabase as any).supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
      'apikey': anonKey,
    },
    body: JSON.stringify({
      action: 'animate',
      original_model_task_id: tripoTaskId,
      animations,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to start animation pipeline');
  }

  return response.json() as Promise<ScanPipelineResponse>;
}

/**
 * Poll animation pipeline status (rig + retarget tasks).
 * Returns the final result with rigged_mesh_url and animated_mesh_url.
 */
export async function pollAnimationStatus(
  rigTaskId: string,
  retargetTaskId?: string | null,
  timeoutMs = 300_000,
): Promise<ScanPipelineResponse> {
  const hostUri = Constants.expoConfig?.hostUri;
  const ipAddress = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
  const edgeFunctionUrl = `http://${ipAddress}:54321/functions/v1/process-scan`;
  const anonKey = (supabase as any).supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({
        action: 'check_animation_status',
        rig_task_id: rigTaskId,
        retarget_task_id: retargetTaskId,
      }),
    });

    if (!response.ok) continue;

    const data = await response.json() as ScanPipelineResponse;

    if (data.status === 'success') {
      return data;
    } else if (data.status === 'error') {
      throw new Error(data.message || 'Animation pipeline failed');
    }
    // If rigging/animating, keep polling
  }

  throw new Error('Timed out waiting for animation pipeline');
}

