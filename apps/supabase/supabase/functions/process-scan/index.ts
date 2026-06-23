import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

type ScanRequest = {
  action?: 'create' | 'check_status' | 'animate' | 'check_animation_status';
  task_id?: string;
  user_id?: string;
  front_b64?: string;
  right_b64?: string;
  left_b64?: string;
  // Animation pipeline fields
  original_model_task_id?: string;
  animations?: string[];  // e.g., ['idle', 'walk']
  rig_task_id?: string;
  retarget_task_id?: string;
};

type JsonRecord = Record<string, unknown>;

const TRIPO_API_BASE_URL = Deno.env.get('TRIPO_API_BASE_URL') ?? 'https://api.tripo3d.ai/v2/openapi';
const TRIPO_API_KEY = Deno.env.get('TRIPO_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ status: 'error', message: 'Method not allowed.' }, 405);
  }

  if (!TRIPO_API_KEY) {
    return json({ status: 'error', provider: 'tripo3d', message: 'TRIPO_API_KEY is not configured.' }, 500);
  }

  try {
    const body = await request.json() as ScanRequest;
    
    if (body.action === 'check_status' && body.task_id) {
      const payload = await tripoFetch(`/task/${body.task_id}`, { method: 'GET' });
      const task = isRecord(payload.data) ? payload.data : payload;
      const status = String(task.status ?? '').toLowerCase();
      
      if (['success', 'succeeded', 'completed', 'complete'].includes(status)) {
        const modelUrl = extractModelUrl(task);
        const thumbnailUrl = extractFirstUrl(task, ['rendered_image', 'thumbnail', 'preview', 'image']);
        return json({
          status: 'success',
          provider: 'tripo3d',
          tripo_task_id: body.task_id,
          generated_mesh_url: modelUrl,
          generated_texture_url: thumbnailUrl,
          generated_preview_url: thumbnailUrl,
        });
      } else if (['failed', 'failure', 'cancelled', 'canceled', 'error'].includes(status)) {
        return json({ status: 'error', provider: 'tripo3d', message: `Tripo task ${body.task_id} failed.` }, 500);
      } else {
        return json({ status: 'processing', provider: 'tripo3d', tripo_task_id: body.task_id });
      }
    }

    // ── Animation Pipeline: Start rigging + retargeting ──
    if (body.action === 'animate' && body.original_model_task_id) {
      const result = await animateModel(
        body.original_model_task_id,
        body.animations ?? ['idle']
      );
      return json({
        status: 'processing',
        provider: 'tripo3d',
        ...result,
        message: 'Animation pipeline started. Poll with check_animation_status.',
      });
    }

    // ── Animation Pipeline: Check status ──
    if (body.action === 'check_animation_status') {
      // Check rig task first
      if (body.rig_task_id) {
        const rigPayload = await tripoFetch(`/task/${body.rig_task_id}`, { method: 'GET' });
        const rigTask = isRecord(rigPayload.data) ? rigPayload.data : rigPayload;
        const rigStatus = String(rigTask.status ?? '').toLowerCase();

        if (['failed', 'failure', 'cancelled', 'canceled', 'error'].includes(rigStatus)) {
          return json({ status: 'error', provider: 'tripo3d', message: 'Rigging failed.' }, 500);
        }

        if (!['success', 'succeeded', 'completed', 'complete'].includes(rigStatus)) {
          return json({ status: 'rigging', provider: 'tripo3d', rig_task_id: body.rig_task_id });
        }

        // Rig is done — extract rigged model URL
        const riggedUrl = extractFirstUrl(rigTask, ['model_mesh', 'glb', 'model', 'output', 'pbr_model']);

        // If we also have a retarget task, check that too
        if (body.retarget_task_id) {
          const retargetPayload = await tripoFetch(`/task/${body.retarget_task_id}`, { method: 'GET' });
          const retargetTask = isRecord(retargetPayload.data) ? retargetPayload.data : retargetPayload;
          const retargetStatus = String(retargetTask.status ?? '').toLowerCase();

          if (['failed', 'failure', 'cancelled', 'canceled', 'error'].includes(retargetStatus)) {
            return json({ status: 'error', provider: 'tripo3d', message: 'Animation retarget failed.' }, 500);
          }

          if (!['success', 'succeeded', 'completed', 'complete'].includes(retargetStatus)) {
            return json({
              status: 'animating',
              provider: 'tripo3d',
              rig_task_id: body.rig_task_id,
              retarget_task_id: body.retarget_task_id,
              rigged_mesh_url: riggedUrl,
            });
          }

          // Both done — extract animated model URL
          const animatedUrl = extractFirstUrl(retargetTask, ['model_mesh', 'glb', 'model', 'output', 'pbr_model']);
          return json({
            status: 'success',
            provider: 'tripo3d',
            rig_task_id: body.rig_task_id,
            retarget_task_id: body.retarget_task_id,
            rigged_mesh_url: riggedUrl,
            animated_mesh_url: animatedUrl,
          });
        }

        // No retarget — rig-only success
        return json({
          status: 'success',
          provider: 'tripo3d',
          rig_task_id: body.rig_task_id,
          rigged_mesh_url: riggedUrl,
        });
      }

      return json({ status: 'error', message: 'rig_task_id is required for check_animation_status.' }, 400);
    }

    const { front_b64, right_b64, left_b64, user_id } = body;

    if (!front_b64 || !right_b64 || !left_b64) {
      return json({ status: 'error', provider: 'tripo3d', message: 'Front, right, and left scan photos are required.' }, 400);
    }

    const result = await generateMultiviewModel(
      front_b64, 
      right_b64, 
      left_b64, 
      `${user_id ?? 'user'}`
    );

    return json({
      status: 'processing',
      provider: 'tripo3d',
      tripo_task_id: result.taskId,
      side_views_available: true,
      message: 'Task created successfully, polling required.'
    });
  } catch (error) {
    console.error("EDGE FUNCTION ERROR:", error);
    const message = error instanceof Error ? error.message : 'Scan processing failed.';
    return json({ status: 'error', provider: 'tripo3d', message }, 500);
  }
});

async function generateMultiviewModel(frontB64: string, rightB64: string, leftB64: string, prefix: string) {
  // 1. Upload all 3 images concurrently
  console.log("Uploading 3 images to Tripo3D...");
  const [frontToken, rightToken, leftToken] = await Promise.all([
    uploadFile(decodeBase64Image(frontB64), `${prefix}_front.jpg`),
    uploadFile(decodeBase64Image(rightB64), `${prefix}_right.jpg`),
    uploadFile(decodeBase64Image(leftB64), `${prefix}_left.jpg`)
  ]);

  // 2. Dispatch Multiview Task
  console.log("Dispatching multiview_to_model task...");
  const payload = await tripoFetch('/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'multiview_to_model',
      files: [
        { type: "jpg", file_token: frontToken },
        { type: "jpg", file_token: leftToken },
        {},
        { type: "jpg", file_token: rightToken }
      ],
      quad: false,
      face_limit: 10000,
      texture_quality: "standard",
      pbr: true,
      model_version: "v3.1-20260211" // H-Series model version for high fidelity human avatars
    }),
  });

  const taskId = getNested(payload, ['data', 'task_id']) ?? getNested(payload, ['data', 'id']);
  if (!taskId) {
    throw new Error('Tripo multiview task creation failed.');
  }

  console.log(`Task ${taskId} created successfully! Return for polling.`);

  return { taskId: String(taskId) };
}

// ─── Animation Pipeline ───────────────────────────────────────────────────────

async function animateModel(originalModelTaskId: string, animations: string[]) {
  // Step 1: Pre-rig check
  console.log(`Running prerigcheck on task ${originalModelTaskId}...`);
  const preRigPayload = await tripoFetch('/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'animate_prerigcheck',
      original_model_task_id: originalModelTaskId,
    }),
  });

  const preRigTaskId = getNested(preRigPayload, ['data', 'task_id']) ?? getNested(preRigPayload, ['data', 'id']);
  if (!preRigTaskId) {
    throw new Error('Tripo prerigcheck task creation failed.');
  }

  // Wait for prerigcheck to complete (usually fast)
  const preRigResult = await waitForTask(String(preRigTaskId));
  console.log('Prerigcheck passed:', JSON.stringify(preRigResult));

  // Step 2: Rig the model
  console.log(`Rigging model with BIPED skeleton...`);
  const rigPayload = await tripoFetch('/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'animate_rig',
      original_model_task_id: originalModelTaskId,
      out_format: 'glb',
    }),
  });

  const rigTaskId = getNested(rigPayload, ['data', 'task_id']) ?? getNested(rigPayload, ['data', 'id']);
  if (!rigTaskId) {
    throw new Error('Tripo rig task creation failed.');
  }
  console.log(`Rig task ${rigTaskId} created.`);

  // Step 3: Start retarget animation (don't wait — let client poll)
  let retargetTaskId: string | null = null;
  if (animations.length > 0) {
    // Wait for rig to complete first before retargeting
    await waitForTask(String(rigTaskId));
    console.log('Rig completed. Starting animation retarget...');

    const retargetPayload = await tripoFetch('/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'animate_retarget',
        original_model_task_id: originalModelTaskId,
        out_format: 'glb',
      }),
    });

    retargetTaskId = String(
      getNested(retargetPayload, ['data', 'task_id']) ?? getNested(retargetPayload, ['data', 'id']) ?? ''
    );
    if (retargetTaskId) {
      console.log(`Retarget task ${retargetTaskId} created.`);
    }
  }

  return {
    rig_task_id: String(rigTaskId),
    retarget_task_id: retargetTaskId,
  };
}

async function uploadFile(fileBytes: Uint8Array, filename: string) {
  const formData = new FormData();
  formData.append('file', new Blob([fileBytes], { type: 'image/jpeg' }), filename);

  const payload = await tripoFetch('/upload', {
    method: 'POST',
    body: formData,
  });

  const token = getNested(payload, ['data', 'file_token']) ?? getNested(payload, ['data', 'image_token']) ?? getNested(payload, ['data', 'token']);
  if (!token) {
    console.log("Tripo upload failed. Full payload:", JSON.stringify(payload));
    throw new Error('Tripo upload did not return a file token.');
  }

  return String(token);
}

async function waitForTask(taskId: string) {
  const startedAt = Date.now();
  const timeoutMs = 285_000; // 4.75 minutes

  while (Date.now() - startedAt < timeoutMs) {
    const payload = await tripoFetch(`/task/${taskId}`, { method: 'GET' });
    const task = isRecord(payload.data) ? payload.data : payload;
    const status = String(task.status ?? '').toLowerCase();

    if (['success', 'succeeded', 'completed', 'complete'].includes(status)) {
      return task;
    }

    if (['failed', 'failure', 'cancelled', 'canceled', 'error'].includes(status)) {
      throw new Error(`Tripo task ${taskId} failed.`);
    }

    await delay(5000);
  }

  throw new Error(`Timed out waiting for Tripo task ${taskId}.`);
}

async function tripoFetch(path: string, init: RequestInit) {
  const response = await fetch(`${TRIPO_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TRIPO_API_KEY}`,
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Tripo API Error payload:", JSON.stringify(payload));
    throw new Error(`Tripo request failed with ${response.status}: ${JSON.stringify(payload)}`);
  }
  if (!isRecord(payload)) {
    throw new Error('Tripo returned an unexpected response.');
  }

  return payload;
}

function decodeBase64Image(imageB64: string) {
  const encoded = imageB64.includes(',') ? imageB64.split(',').at(-1) ?? '' : imageB64;
  return decode(encoded);
}

function extractModelUrl(task: JsonRecord) {
  console.log("Completed Tripo task payload:", JSON.stringify(task));
  const modelUrl = extractFirstUrl(task, ['model_mesh', 'glb', 'model', 'base_model', 'model_url', 'url', 'pbr_model']);
  if (!modelUrl) {
    throw new Error('Completed Tripo task did not include a model URL.');
  }

  return modelUrl;
}

function extractFirstUrl(payload: JsonRecord, keys: string[]) {
  const output = isRecord(payload.output) ? payload.output : payload;
  const candidates = [output, ...Object.values(output).filter(isRecord)];

  for (const candidate of candidates) {
    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === 'string' && value.startsWith('http')) {
        const path = value.split('?')[0].toLowerCase();
        if (path.endsWith('.glb') || path.endsWith('.gltf')) {
          return value;
        }
      }
      if (isRecord(value)) {
        const nestedUrl = value.url ?? value.href;
        if (typeof nestedUrl === 'string' && nestedUrl.startsWith('http')) {
          const path = nestedUrl.split('?')[0].toLowerCase();
          if (path.endsWith('.glb') || path.endsWith('.gltf')) {
            return nestedUrl;
          }
        }
      }
    }
  }

  return null;
}

function getNested(payload: JsonRecord, path: string[]) {
  let current: unknown = payload;
  for (const key of path) {
    if (!isRecord(current) || !(key in current)) {
      return null;
    }
    current = current[key];
  }

  return current;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function json(body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
