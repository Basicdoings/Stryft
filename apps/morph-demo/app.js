// Stryft 3D Morphing Studio Logic (Premium High-Fidelity Version)

// Global state
let scene, camera, renderer, controls;
let avatarGroup, xbotModel, skeletonHelper, holographicPlane;
let activeMaterialMode = 'texture'; // texture, wireframe, skeleton
let currentPreset = 'balanced';
let currentPhotoTexture = null;
let defaultTexture = null;
let isRotating = true;

// Xbot bones references for anatomical morphing
let bSpine, bSpine1, bSpine2;
let bLShoulder, bRShoulder;
let bLArm, bRArm, bLForeArm, bRForeArm;
let bLUpLeg, bRUpLeg, bLLeg, bRLeg;
let bHips;

// UI Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('photo-upload');
const scanPlaceholder = document.getElementById('scan-placeholder');
const scanActiveView = document.getElementById('scan-active-view');
const uploadedImg = document.getElementById('uploaded-img');
const overlayCanvas = document.getElementById('scanner-overlay-canvas');
const scannerSweep = document.getElementById('scanner-sweep');
const overlayControls = document.getElementById('overlay-controls');
const toggleSamBtn = document.getElementById('toggle-sam');
const toggleHmrBtn = document.getElementById('toggle-hmr');
const logsConsole = document.getElementById('logs-console');
const loadingSpinner = document.getElementById('loading-spinner');
const targetZoneBadge = document.getElementById('target-zone-badge');

// Sliders and Inputs
const sliderAbs = document.getElementById('morph-abs');
const sliderGlutes = document.getElementById('morph-glutes');
const sliderTaper = document.getElementById('morph-taper');
const sliderArms = document.getElementById('morph-arms');
const sliderLegs = document.getElementById('morph-legs');

const valAbs = document.getElementById('val-abs');
const valGlutes = document.getElementById('val-glutes');
const valTaper = document.getElementById('val-taper');
const valArms = document.getElementById('val-arms');
const valLegs = document.getElementById('val-legs');

const inputLevel = document.getElementById('input-level');
const inputSleep = document.getElementById('input-sleep');
const inputWeeks = document.getElementById('input-weeks');
const inputCaloric = document.getElementById('input-caloric');

// Outputs
const metricEfficiency = document.getElementById('metric-efficiency');
const metricMuscle = document.getElementById('metric-muscle');
const metricWaist = document.getElementById('metric-waist');
const metricFat = document.getElementById('metric-fat');
const efficiencyTip = document.getElementById('efficiency-tip');
const efficiencyTipText = document.getElementById('efficiency-tip-text');

// Init application
window.addEventListener('load', () => {
  initThreeJS();
  initMesh();
  initEventListeners();
  updateMorphs();
});

// Write to console logger
function logMessage(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line ${type === 'muted' ? 'text-muted' : type === 'success' ? 'text-success' : type === 'warn' ? 'text-warn' : ''}`;
  const timestamp = new Date().toLocaleTimeString();
  line.innerText = `[${timestamp}] ${text}`;
  logsConsole.appendChild(line);
  logsConsole.scrollTop = logsConsole.scrollHeight;
}

// THREE.JS SETUP
function initThreeJS() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#08080B');

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.0, 3.8);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  controls.minDistance = 1.5;
  controls.maxDistance = 6;
  controls.target.set(0, 1.0, 0);

  // Premium Lighting Setup
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00D2FF, 0.8); // Cyan fill
  fillLight.position.set(-2, 1.5, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xFF6B00, 1.5); // Orange rim
  rimLight.position.set(0, 2, -4);
  scene.add(rimLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Ground grid
  const gridHelper = new THREE.GridHelper(10, 20, 0xFF6B00, 0x22222B);
  gridHelper.position.y = 0;
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Animation Loop
  const clock = new THREE.Clock();
  const tick = () => {
    const elapsed = clock.getElapsedTime();

    if (controls) controls.update();
    
    // Idle simulation
    if (avatarGroup) {
      avatarGroup.position.y = Math.sin(elapsed * 1.5) * 0.01; // subtle breathing/floating
      
      // Auto-rotation
      if (isRotating) {
        avatarGroup.rotation.y = elapsed * 0.15;
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// PREMIUM MODEL INITIALIZATION
function initMesh() {
  avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  // 1. Holographic Projection Plane (Floating behind avatar)
  const planeGeom = new THREE.PlaneGeometry(2.4, 2.4);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x00D2FF,
    transparent: true,
    opacity: 0.03, // faint grid when empty
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  // Draw a grid on the base holographic plane
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = 512; gridCanvas.height = 512;
  const ctx = gridCanvas.getContext('2d');
  ctx.strokeStyle = 'rgba(0, 210, 255, 0.5)';
  for(let i=0; i<512; i+=32) { ctx.strokeRect(i,0,32,512); ctx.strokeRect(0,i,512,32); }
  planeMat.map = new THREE.CanvasTexture(gridCanvas);

  holographicPlane = new THREE.Mesh(planeGeom, planeMat);
  holographicPlane.position.set(0, 1.2, -0.6); // Placed elegantly behind avatar
  avatarGroup.add(holographicPlane);

  // 2. Load high-fidelity Xbot GLB model
  const loader = new THREE.GLTFLoader();
  const modelUrl = 'https://unpkg.com/three@0.128.0/examples/models/gltf/Xbot.glb';
  
  loadingSpinner.classList.remove('hidden');
  loadingSpinner.querySelector('p').innerText = "Loading High-Fidelity Rig...";

  loader.load(modelUrl, (gltf) => {
    xbotModel = gltf.scene;
    
    // Premium dark metallic material (adjusted to catch diffuse light properly)
    const premiumMat = new THREE.MeshStandardMaterial({
      color: 0x8888AA, // Lighter titanium to stand out
      roughness: 0.4,
      metalness: 0.5, // Reduced metalness so it's visible without an envMap
    });

    xbotModel.traverse((child) => {
      if (child.isMesh) {
        child.material = premiumMat;
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // Extract specific bones for morphological scaling
      if (child.isBone) {
        if (child.name === 'mixamorigSpine') bSpine = child;
        if (child.name === 'mixamorigSpine1') bSpine1 = child;
        if (child.name === 'mixamorigSpine2') bSpine2 = child;
        if (child.name === 'mixamorigLeftShoulder') bLShoulder = child;
        if (child.name === 'mixamorigRightShoulder') bRShoulder = child;
        if (child.name === 'mixamorigLeftArm') bLArm = child;
        if (child.name === 'mixamorigRightArm') bRArm = child;
        if (child.name === 'mixamorigLeftForeArm') bLForeArm = child;
        if (child.name === 'mixamorigRightForeArm') bRForeArm = child;
        if (child.name === 'mixamorigLeftUpLeg') bLUpLeg = child;
        if (child.name === 'mixamorigRightUpLeg') bRUpLeg = child;
        if (child.name === 'mixamorigLeftLeg') bLLeg = child;
        if (child.name === 'mixamorigRightLeg') bRLeg = child;
        if (child.name === 'mixamorigHips') bHips = child;
      }
    });

    // Create skeleton helper for "Skeleton" view mode
    skeletonHelper = new THREE.SkeletonHelper(xbotModel);
    skeletonHelper.visible = false;
    scene.add(skeletonHelper);

    avatarGroup.add(xbotModel);
    loadingSpinner.classList.add('hidden');
    logMessage("High-fidelity Xbot GLB loaded & rigging initialized.", "success");
    
    updateMorphs(); // Apply initial morph state
  }, undefined, (error) => {
    console.error("GLTF Load Error:", error);
    logMessage("Failed to load model from CDN.", "warn");
    loadingSpinner.classList.add('hidden');
  });
}

// EVENT LISTENERS
function initEventListeners() {
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handlePhotoUpload(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handlePhotoUpload(e.target.files[0]);
  });

  const sliders = [sliderAbs, sliderGlutes, sliderTaper, sliderArms, sliderLegs];
  sliders.forEach(slider => {
    slider.addEventListener('input', () => {
      document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
      updateMorphs();
    });
  });

  const inputs = [inputLevel, inputSleep, inputWeeks, inputCaloric];
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      updateBiologicalPredictions();
    });
  });

  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPresetValues(btn.dataset.preset);
    });
  });

  document.getElementById('view-texture').addEventListener('click', () => setViewMode('texture'));
  document.getElementById('view-wireframe').addEventListener('click', () => setViewMode('wireframe'));
  document.getElementById('view-skeleton').addEventListener('click', () => setViewMode('skeleton'));

  document.getElementById('toggle-rotation').addEventListener('click', () => {
    isRotating = !isRotating;
    const btn = document.getElementById('toggle-rotation');
    if (isRotating) { btn.classList.add('active'); logMessage("Auto-rotate enabled."); } 
    else { btn.classList.remove('active'); logMessage("Auto-rotate paused."); }
  });

  document.getElementById('cam-front').addEventListener('click', () => {
    isRotating = false; document.getElementById('toggle-rotation').classList.remove('active');
    animateCamera(new THREE.Vector3(0, 1.0, 3.5), new THREE.Vector3(0, 1.0, 0));
  });
  document.getElementById('cam-side').addEventListener('click', () => {
    isRotating = false; document.getElementById('toggle-rotation').classList.remove('active');
    animateCamera(new THREE.Vector3(3.5, 1.0, 0), new THREE.Vector3(0, 1.0, 0));
  });
  document.getElementById('cam-back').addEventListener('click', () => {
    isRotating = false; document.getElementById('toggle-rotation').classList.remove('active');
    animateCamera(new THREE.Vector3(0, 1.0, -3.5), new THREE.Vector3(0, 1.0, 0));
  });

  toggleSamBtn.addEventListener('click', () => { toggleSamBtn.classList.toggle('active'); drawScanOverlay(); });
  toggleHmrBtn.addEventListener('click', () => { toggleHmrBtn.classList.toggle('active'); drawScanOverlay(); });
}

function animateCamera(targetPos, targetLook) {
  const startPos = camera.position.clone();
  const startTime = performance.now();
  const anim = (now) => {
    const progress = Math.min((now - startTime) / 800, 1.0);
    const ease = 1 - Math.pow(1 - progress, 3);
    camera.position.lerpVectors(startPos, targetPos, ease);
    controls.target.copy(targetLook);
    if (progress < 1.0) requestAnimationFrame(anim);
  };
  requestAnimationFrame(anim);
}

function applyPresetValues(preset) {
  currentPreset = preset;
  let abs = 0, glutes = 0, taper = 0, arms = 0, legs = 0;

  if (preset === 'shredded') { abs = 0.85; glutes = 0.2; taper = 0.4; arms = 0.3; legs = 0.2; logMessage("Preset 'Shredded Abs' applied."); } 
  else if (preset === 'glutes') { abs = 0.4; glutes = 0.9; taper = 0.15; arms = 0.15; legs = 0.6; logMessage("Preset 'Glute Builder' applied."); } 
  else if (preset === 'v-taper') { abs = 0.6; glutes = 0.3; taper = 0.95; arms = 0.8; legs = 0.4; logMessage("Preset 'V-Taper Hulk' applied."); } 
  else { abs = 0; glutes = 0; taper = 0; arms = 0; legs = 0; logMessage("Presets reset."); }

  sliderAbs.value = abs; sliderGlutes.value = glutes; sliderTaper.value = taper; sliderArms.value = arms; sliderLegs.value = legs;
  updateMorphs();
}

function setViewMode(mode) {
  activeMaterialMode = mode;
  document.querySelectorAll('.view-mode-group .btn-icon').forEach(btn => btn.classList.remove('active'));
  
  if (!xbotModel) return;

  if (mode === 'texture') {
    document.getElementById('view-texture').classList.add('active');
    xbotModel.traverse(c => {
      if (c.isMesh && c.material) {
        c.material.wireframe = false;
        c.material.transparent = false;
        c.material.opacity = 1.0;
      }
    });
    if (skeletonHelper) skeletonHelper.visible = false;
    logMessage("Rendering view: High-Fidelity PBR Texture.");
  } 
  else if (mode === 'wireframe') {
    document.getElementById('view-wireframe').classList.add('active');
    xbotModel.traverse(c => {
      if (c.isMesh && c.material) {
        c.material.wireframe = true;
        c.material.transparent = false;
        c.material.opacity = 1.0;
      }
    });
    if (skeletonHelper) skeletonHelper.visible = false;
    logMessage("Rendering view: Mesh vertex topology.");
  } 
  else if (mode === 'skeleton') {
    document.getElementById('view-skeleton').classList.add('active');
    xbotModel.traverse(c => {
      if (c.isMesh && c.material) {
        c.material.wireframe = true;
        c.material.transparent = true;
        c.material.opacity = 0.1; // Ghostly mesh shell
      }
    });
    if (skeletonHelper) skeletonHelper.visible = true;
    logMessage("Rendering view: Structural skeleton alignment.");
  }
}

// BONE-SCALING ANATOMICAL MORPH SYSTEM
function updateMorphs() {
  const absVal = parseFloat(sliderAbs.value);
  const gluteVal = parseFloat(sliderGlutes.value);
  const taperVal = parseFloat(sliderTaper.value);
  const armVal = parseFloat(sliderArms.value);
  const legVal = parseFloat(sliderLegs.value);

  valAbs.innerText = Math.round(absVal * 100) + '%';
  valGlutes.innerText = Math.round(gluteVal * 100) + '%';
  valTaper.innerText = Math.round(taperVal * 100) + '%';
  valArms.innerText = Math.round(armVal * 100) + '%';
  valLegs.innerText = Math.round(legVal * 100) + '%';

  if (absVal > 0.5) targetZoneBadge.innerText = "ZONE: ABDOMEN FOCUS";
  else if (gluteVal > 0.5) targetZoneBadge.innerText = "ZONE: POSTERIOR FOCUS";
  else if (taperVal > 0.5) targetZoneBadge.innerText = "ZONE: V-TAPER FOCUS";
  else targetZoneBadge.innerText = "ZONE: GLOBAL VIEW";

  if (!xbotModel) return;

  // 1. Abs/Waist (Fat reduction / Tightening via lower spine scaling)
  const waistScale = 1.0 - (absVal * 0.2);
  if (bSpine) bSpine.scale.set(waistScale, 1.0, waistScale);
  if (bSpine1) bSpine1.scale.set(waistScale + 0.05, 1.0, waistScale + 0.05);

  // 2. Glutes (Scaling hips along Z for posterior volume)
  const gluteScaleZ = 1.0 + (gluteVal * 0.4);
  const gluteScaleX = 1.0 + (gluteVal * 0.15);
  if (bHips) bHips.scale.set(gluteScaleX, 1.0, gluteScaleZ);

  // 3. V-Taper (Broadening shoulders and upper back)
  const taperScale = 1.0 + (taperVal * 0.35);
  if (bSpine2) bSpine2.scale.set(taperScale, 1.0, taperScale * 0.8);
  if (bLShoulder) bLShoulder.scale.set(1.0, 1.0 + taperVal * 0.3, 1.0);
  if (bRShoulder) bRShoulder.scale.set(1.0, 1.0 + taperVal * 0.3, 1.0);

  // 4. Arm Mass (Biceps/Triceps/Forearms)
  const armScale = 1.0 + (armVal * 0.45);
  if (bLArm) bLArm.scale.set(armScale, 1.0, armScale);
  if (bRArm) bRArm.scale.set(armScale, 1.0, armScale);
  if (bLForeArm) bLForeArm.scale.set(armScale * 0.85, 1.0, armScale * 0.85);
  if (bRForeArm) bRForeArm.scale.set(armScale * 0.85, 1.0, armScale * 0.85);

  // 5. Leg Mass (Thighs/Calves)
  const legScale = 1.0 + (legVal * 0.4);
  if (bLUpLeg) bLUpLeg.scale.set(legScale, 1.0, legScale);
  if (bRUpLeg) bRUpLeg.scale.set(legScale, 1.0, legScale);
  if (bLLeg) bLLeg.scale.set(legScale * 0.9, 1.0, legScale * 0.9);
  if (bRLeg) bRLeg.scale.set(legScale * 0.9, 1.0, legScale * 0.9);

  updateBiologicalPredictions();
}

function updateBiologicalPredictions() {
  const level = inputLevel.value;
  const sleep = inputSleep.value;
  const weeks = parseInt(inputWeeks.value);
  const caloric = inputCaloric.value;

  const absVal = parseFloat(sliderAbs.value);
  const gluteVal = parseFloat(sliderGlutes.value);
  const taperVal = parseFloat(sliderTaper.value);
  const armVal = parseFloat(sliderArms.value);
  const legVal = parseFloat(sliderLegs.value);
  
  let efficiency = 1.0;
  let penaltyText = "";

  if (sleep === 'poor') { efficiency -= 0.15; penaltyText += "Poor sleep quality down-regulates recovery by 15%. "; } 
  else if (sleep === 'fair') { efficiency -= 0.05; penaltyText += "Fair sleep slightly affects recovery efficiency (-5%). "; }
  if (caloric === 'deficit') { efficiency -= 0.10; penaltyText += "Caloric deficit restricts muscle growth potential (-10%)."; }

  const effPercent = Math.round(efficiency * 100);
  metricEfficiency.innerText = `${effPercent}%`;

  if (efficiency < 1.0) {
    efficiencyTip.classList.remove('hidden');
    efficiencyTipText.innerText = penaltyText;
    metricEfficiency.className = "m-val highlight text-warn";
  } else {
    efficiencyTip.classList.add('hidden');
    metricEfficiency.className = "m-val highlight";
  }

  let baseWeeklyGainLbs = 0.25; 
  if (level === 'beginner') baseWeeklyGainLbs = 0.50;
  if (level === 'advanced') baseWeeklyGainLbs = 0.125;

  const totalIdealGainLbs = baseWeeklyGainLbs * weeks;
  const caloricMult = caloric === 'surplus' ? 1.15 : caloric === 'deficit' ? 0.6 : 1.0;
  const muscleGainLbs = totalIdealGainLbs * efficiency * caloricMult;
  
  const morphIntensity = (absVal * 0.1 + gluteVal * 0.2 + taperVal * 0.15 + armVal * 0.15 + legVal * 0.2);
  const finalGainKg = (muscleGainLbs + morphIntensity * 4.0) * 0.453592;

  metricMuscle.innerText = `${finalGainKg.toFixed(2)} kg`;

  let waistChange = 0.0, fatChange = 0.0;
  if (caloric === 'deficit') {
    waistChange = -0.5 * weeks * efficiency - (absVal * 2.0);
    fatChange = -0.3 * weeks * efficiency - (absVal * 1.5);
  } else if (caloric === 'maintenance') {
    waistChange = -0.1 * weeks * efficiency - (absVal * 0.8);
    fatChange = -0.08 * weeks * efficiency - (absVal * 0.6);
  } else {
    waistChange = 0.08 * weeks - (absVal * 0.4);
    fatChange = 0.04 * weeks - (absVal * 0.2);
  }

  metricWaist.innerText = `${waistChange < 0 ? '' : '+'}${waistChange.toFixed(1)} cm`;
  metricFat.innerText = `${fatChange < 0 ? '' : '+'}${fatChange.toFixed(1)}%`;
}

function handlePhotoUpload(file) {
  if (!file || !file.type.startsWith('image/')) return alert("Please upload a valid image file.");
  logMessage("User uploaded body scan. Processing init...", "info");
  
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImg.src = e.target.result;
    scanPlaceholder.classList.add('hidden');
    scanActiveView.classList.remove('hidden');
    scannerSweep.classList.remove('hidden');
    overlayControls.classList.add('disabled');
    uploadedImg.onload = () => runSimulatedScannerPipeline();
  };
  reader.readAsDataURL(file);
}

// HOLOGRAPHIC PROJECTION PLANE UPDATE
function projectImageToMeshTexture() {
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 1024; texCanvas.height = 1024;
  const ctx = texCanvas.getContext('2d');

  ctx.clearRect(0, 0, 1024, 1024);

  // Simulated glowing aura behind projection
  ctx.shadowColor = 'rgba(0, 210, 255, 0.8)';
  ctx.shadowBlur = 40;
  
  const aspect = uploadedImg.naturalWidth / uploadedImg.naturalHeight;
  let drawH = 900, drawW = 900 * aspect;
  if (drawW > 900) { drawW = 900; drawH = 900 / aspect; }

  const xOffset = 512 - (drawW / 2);
  const yOffset = 512 - (drawH / 2);

  ctx.drawImage(uploadedImg, xOffset, yOffset, drawW, drawH);
  ctx.shadowBlur = 0;

  // Add high-tech alignment frame corners
  ctx.strokeStyle = 'rgba(0, 210, 255, 0.6)'; ctx.lineWidth = 6;
  const len = 60;
  ctx.beginPath(); ctx.moveTo(xOffset, yOffset + len); ctx.lineTo(xOffset, yOffset); ctx.lineTo(xOffset + len, yOffset); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xOffset + drawW - len, yOffset); ctx.lineTo(xOffset + drawW, yOffset); ctx.lineTo(xOffset + drawW, yOffset + len); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xOffset, yOffset + drawH - len); ctx.lineTo(xOffset, yOffset + drawH); ctx.lineTo(xOffset + len, yOffset + drawH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xOffset + drawW - len, yOffset + drawH); ctx.lineTo(xOffset + drawW, yOffset + drawH); ctx.lineTo(xOffset + drawW, yOffset + drawH - len); ctx.stroke();

  currentPhotoTexture = new THREE.CanvasTexture(texCanvas);
  
  // Apply photo texture to Holographic Plane
  if (holographicPlane) {
    holographicPlane.material.map = currentPhotoTexture;
    holographicPlane.material.color = new THREE.Color(0xffffff);
    holographicPlane.material.opacity = 0.35; // Faint hologram effect so the rig is clearly visible
    holographicPlane.material.needsUpdate = true;
  }
}

function drawScanOverlay() {
  const w = overlayCanvas.width = scanActiveView.clientWidth;
  const h = overlayCanvas.height = scanActiveView.clientHeight;
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  if (toggleSamBtn.classList.contains('active')) {
    ctx.fillStyle = 'rgba(66, 211, 146, 0.25)';
    ctx.strokeStyle = 'rgba(66, 211, 146, 0.85)';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.15); 
    ctx.bezierCurveTo(w * 0.58, h * 0.15, w * 0.58, h * 0.25, w * 0.54, h * 0.28); 
    ctx.lineTo(w * 0.68, h * 0.35); ctx.lineTo(w * 0.65, h * 0.55); 
    ctx.lineTo(w * 0.58, h * 0.58); ctx.lineTo(w * 0.60, h * 0.85); 
    ctx.lineTo(w * 0.52, h * 0.87); ctx.lineTo(w * 0.50, h * 0.70); 
    ctx.lineTo(w * 0.48, h * 0.87); ctx.lineTo(w * 0.40, h * 0.85); 
    ctx.lineTo(w * 0.42, h * 0.58); ctx.lineTo(w * 0.35, h * 0.55); 
    ctx.lineTo(w * 0.32, h * 0.35); ctx.lineTo(w * 0.46, h * 0.28); 
    ctx.bezierCurveTo(w * 0.42, h * 0.25, w * 0.42, h * 0.15, w * 0.5, h * 0.15); 
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#42D392'; ctx.font = 'bold 9px monospace';
    ctx.fillText("SAM MASK: ISOLATED SILHOUETTE", 12, 20);
  }

  if (toggleHmrBtn.classList.contains('active')) {
    const kps = {
      head: {x:w*0.5, y:h*0.2}, neck: {x:w*0.5, y:h*0.28},
      shoulderL: {x:w*0.4, y:h*0.33}, shoulderR: {x:w*0.6, y:h*0.33},
      elbowL: {x:w*0.36, y:h*0.48}, elbowR: {x:w*0.64, y:h*0.48},
      wristL: {x:w*0.34, y:h*0.62}, wristR: {x:w*0.66, y:h*0.62},
      hipL: {x:w*0.45, y:h*0.58}, hipR: {x:w*0.55, y:h*0.58},
      kneeL: {x:w*0.44, y:h*0.76}, kneeR: {x:w*0.56, y:h*0.76},
      ankleL: {x:w*0.43, y:h*0.9}, ankleR: {x:w*0.57, y:h*0.9}
    };

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.75)'; ctx.lineWidth = 2;
    const bones = [['head','neck'],['neck','shoulderL'],['neck','shoulderR'],['shoulderL','elbowL'],['shoulderR','elbowR'],['elbowL','wristL'],['elbowR','wristR'],['shoulderL','hipL'],['shoulderR','hipR'],['hipL','hipR'],['hipL','kneeL'],['hipR','kneeR'],['kneeL','ankleL'],['kneeR','ankleR']];
    bones.forEach(([p1,p2]) => { ctx.beginPath(); ctx.moveTo(kps[p1].x, kps[p1].y); ctx.lineTo(kps[p2].x, kps[p2].y); ctx.stroke(); });

    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#00D2FF'; ctx.lineWidth = 1.5;
    Object.values(kps).forEach(pt => { ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });

    ctx.fillStyle = '#00D2FF'; ctx.font = 'bold 9px monospace';
    ctx.fillText("HMR 2.0: 14 RIG SEGMENTS", 12, toggleSamBtn.classList.contains('active') ? 34 : 20);
  }
}

function runSimulatedScannerPipeline() {
  loadingSpinner.classList.remove('hidden');
  loadingSpinner.querySelector('p').innerText = "Processing Scan...";
  logMessage("Segmenting foreground... Calling SAM cloud worker", "info");
  
  setTimeout(() => {
    logMessage("SAM 3D: Isolated silhouette transparency mask calculated.", "success");
    toggleSamBtn.classList.add('active'); drawScanOverlay();
  }, 1000);

  setTimeout(() => {
    logMessage("HMR 2.0: Volumetric depth markers mapped to standard rig armature.", "success");
    toggleHmrBtn.classList.add('active'); drawScanOverlay();
  }, 2000);

  setTimeout(() => {
    logMessage("Holographic Projection: Syncing image map with spatial plane.", "success");
    projectImageToMeshTexture();
  }, 2800);

  setTimeout(() => {
    logMessage("Pipeline SUCCESS. 3D Studio fully loaded.", "success");
    loadingSpinner.classList.add('hidden');
    scannerSweep.classList.add('hidden');
    overlayControls.classList.remove('disabled');
    logMessage("Adjust morphological sliders to test Xbot anatomical deformations.", "warn");
  }, 3500);
}
