import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// --- Globals & DOM Elements ---
const els = {
    mainOverlay: document.getElementById('main-overlay'),
    playOverlay: document.getElementById('play-overlay'),
    btnInit: document.getElementById('btn-init'),
    btnForcePlay: document.getElementById('btn-force-play'),
    btnText: document.getElementById('btn-text'),
    btnSpinner: document.getElementById('btn-spinner'),
    uiLayer: document.getElementById('ui-layer'),
    gyroToggle: document.getElementById('gyro-toggle'),
    btnVideoControl: document.getElementById('btn-video-control'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnCardboardVr: document.getElementById('btn-cardboard-vr'),
    vrDivider: document.getElementById('vr-divider'),
    iconPlay: document.getElementById('icon-play'),
    iconPause: document.getElementById('icon-pause'),
    container: document.getElementById('canvas-container'),
    fileInput: document.getElementById('file-input'),
    video: document.getElementById('video-source'),
    errorLog: document.getElementById('error-log'),
    btnSettings: document.getElementById('btn-settings'),
    settingsPanel: document.getElementById('settings-panel'),
    settingFormat: document.getElementById('setting-format'),
    settingRotation: document.getElementById('setting-rotation'),
    rotVal: document.getElementById('rot-val'),
    settingShape: document.getElementById('setting-shape'),
    shapeVal: document.getElementById('shape-val'),
    settingIpd: document.getElementById('setting-ipd'),
    ipdVal: document.getElementById('ipd-val'),
    settingFov: document.getElementById('setting-fov'),
    fovVal: document.getElementById('fov-val'),
    settingScale: document.getElementById('setting-scale'),
    scaleVal: document.getElementById('scale-val'),
    vrLeft: null, 
    vrRight: null
};

const state = {
    useGyro: false,
    isUserInteracting: false,
    lat: 0, lon: 0, targetLat: 0, targetLon: 0,
    onPointerDownX: 0, onPointerDownY: 0, onPointerDownLon: 0, onPointerDownLat: 0,
    currentObjectUrl: null,
    isVideo: false,
    videoContext: null,
    videoCanvas: null,
    texLeft: null,
    texRight: null,
    mediaFormat: 'mono', 
    rotationOffset: 0,
    shapeMorph: 0, 
    isCardboardVR: false,
    eyeSeparation: 0, 
    geometry: null,
    
    // VR UI States
    vrUiActive: false,
    vrAnchorYaw: 0,
    gazeTarget: null,
    gazeStartTime: 0
};

const CONFIG = { fov: 75, damping: 0.1, rotateSpeed: 0.2 };
let camera, scene, renderer, controls, DeviceOrientationControls;
let meshGroup, meshLeft, meshRight;
let isRunning = false;

let uiTimeout;

function resetUiTimer() {
    if (state.isCardboardVR) return; // In VR regelt die Blickrichtung die UI
    
    els.uiLayer.classList.add('viewer__ui-layer--visible');
    clearTimeout(uiTimeout);
    
    uiTimeout = setTimeout(() => {
        els.uiLayer.classList.remove('viewer__ui-layer--visible');
        els.settingsPanel.classList.remove('viewer__settings-panel--open');
        els.btnSettings.classList.remove('viewer__btn--active');
    }, 4000);
}

function syncVrUiState() {
    const isPaused = els.video.paused || !state.isVideo;
    document.querySelectorAll('#icon-play, [data-vr-id="icon-play"]').forEach(el => el.style.display = isPaused ? 'block' : 'none');
    document.querySelectorAll('#icon-pause, [data-vr-id="icon-pause"]').forEach(el => el.style.display = isPaused ? 'none' : 'block');
    
    const isVideoControlVisible = state.isVideo ? 'inline-flex' : 'none';
    document.querySelectorAll('#btn-video-control, [data-vr-id="btn-video-control"]').forEach(el => el.style.display = isVideoControlVisible);
    
    document.querySelectorAll('#btn-cardboard-vr, [data-vr-id="btn-cardboard-vr"]').forEach(el => {
        if (state.isCardboardVR) el.classList.add('viewer__btn--active');
        else el.classList.remove('viewer__btn--active');
    });
}

window.onerror = (msg) => { 
    els.errorLog.style.display = 'block'; 
    els.errorLog.textContent = `Error: ${msg}`; 
};

// =========================================================================
// 1. INIT & SENSOR LOGIC
// =========================================================================

els.btnInit.addEventListener('click', async () => {
    let iosPermissionGranted = false;
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const perm = await DeviceOrientationEvent.requestPermission();
            iosPermissionGranted = (perm === 'granted');
        } catch(e) { 
            console.warn("iOS Sensor Permission denied oder abgebrochen:", e); 
        }
    } else {
        iosPermissionGranted = true; 
    }

    els.btnInit.disabled = true;
    els.btnSpinner.style.display = 'inline-block';
    els.btnText.textContent = "Lade...";

    try {
        if (!isRunning) { initThree(); isRunning = true; }
        
        const mod = await import('./DeviceOrientationControls.js');
        DeviceOrientationControls = mod.DeviceOrientationControls;
        
        if (iosPermissionGranted) {
            if (window.DeviceOrientationEvent) {
                const check = (e) => { 
                    if (e.alpha !== null) { 
                        activateGyro(); 
                        window.removeEventListener('deviceorientation', check); 
                    }
                };
                window.addEventListener('deviceorientation', check);
                if(typeof DeviceOrientationEvent.requestPermission === 'function') activateGyro();
            }
        }

        els.mainOverlay.classList.add('viewer__overlay--hidden');
        els.container.classList.add('viewer__canvas--visible');
        setTimeout(() => {
            els.mainOverlay.style.display = 'none';
            resetUiTimer(); 
        }, 500);

    } catch (e) {
        alert("Start Error: " + e.message);
        els.btnInit.disabled = false;
    }
});

function activateGyro() {
    if(!controls && DeviceOrientationControls) controls = new DeviceOrientationControls(camera);
    if(controls) {
        controls.connect();
        state.useGyro = true;
        els.gyroToggle.checked = true;
    }
}

// =========================================================================
// 2. CORE THREE.JS ENGINE & UPDATE LOOP
// =========================================================================

function initThree() {
    const w = window.innerWidth, h = window.innerHeight;
    camera = new THREE.PerspectiveCamera(CONFIG.fov, w/h, 1, 1100);
    camera.position.set(0, 0, 0); 
    
    scene = new THREE.Scene();
    meshGroup = new THREE.Group();
    scene.add(meshGroup);

    const geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    const posAttr = geo.attributes.position;
    const uvAttr = geo.attributes.uv;
    
    geo.userData.originalPositions = new Float32Array(posAttr.array);
    geo.userData.targetPositions = new Float32Array(posAttr.array.length);

    for (let i = 0; i < posAttr.count; i++) {
        const ox = posAttr.getX(i), oy = posAttr.getY(i), oz = posAttr.getZ(i);
        const rXZ = Math.sqrt(ox * ox + oz * oz);
        let tx, tz;
        if (rXZ > 0.001) {
            tx = (ox / rXZ) * 500;
            tz = (oz / rXZ) * 500;
        } else {
            const u = uvAttr.getX(i);
            tx = 500 * Math.cos(2 * Math.PI * u);
            tz = 500 * Math.sin(2 * Math.PI * u);
        }
        const elevation = Math.asin(THREE.MathUtils.clamp(oy / 500, -1, 1));
        geo.userData.targetPositions[i * 3] = tx;
        geo.userData.targetPositions[i * 3 + 1] = 500 * elevation;
        geo.userData.targetPositions[i * 3 + 2] = tz;
    }

    state.geometry = geo;
    
    meshLeft = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
    meshLeft.layers.enable(0); 
    meshLeft.layers.enable(1);
    meshLeft.layers.enable(2);
    
    meshRight = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
    meshRight.layers.set(2);
    meshRight.visible = false; 
    
    meshGroup.add(meshLeft, meshRight);

    createMediaTextures(createPlaceholderTexture(), false);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.xr.enabled = true;
    els.container.appendChild(renderer.domElement);

    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then(supported => {
            if (supported) {
                const vrBtn = VRButton.createButton(renderer);
                vrBtn.id = "native-vr-btn";
                els.uiLayer.appendChild(vrBtn);
                els.btnCardboardVr.style.display = 'none'; 
            }
        });
    }

    els.container.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointermove', onPointerMove);
    
    document.addEventListener('pointerdown', resetUiTimer);
    document.addEventListener('pointermove', resetUiTimer);

    window.addEventListener('resize', onWindowResize);
    els.fileInput.addEventListener('change', handleUpload);
    
    renderer.setAnimationLoop(update);
}

function resetGaze() {
    if (state.gazeTarget) {
        state.gazeTarget.style.transform = '';
        state.gazeTarget.style.boxShadow = '';
        state.gazeTarget = null;
    }
    if (els.vrLeft && els.vrRight) {
        els.vrLeft.reticleFill.style.transform = 'scale(0)';
        els.vrRight.reticleFill.style.transform = 'scale(0)';
    }
}

function update() {
    if (state.isVideo && state.videoContext && state.texLeft && els.video.readyState >= 2 && !els.video.paused) {
        state.videoContext.drawImage(els.video, 0, 0, state.videoCanvas.width, state.videoCanvas.height);
        state.texLeft.needsUpdate = true; state.texRight.needsUpdate = true;
    }

    if (!renderer.xr.isPresenting) {
        if (state.useGyro && controls) {
            controls.update();
        } else {
            state.lat += (state.targetLat - state.lat) * CONFIG.damping;
            state.lon += (state.targetLon - state.lon) * CONFIG.damping;
            state.lat = Math.max(-85, Math.min(85, state.lat));
            const phi = THREE.MathUtils.degToRad(90 - state.lat);
            const theta = THREE.MathUtils.degToRad(state.lon);
            camera.lookAt(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
        }
    }

    // --- RENDER LOGIK ---
    if (renderer.xr.isPresenting) {
        renderer.render(scene, camera);
    } else if (state.isCardboardVR) {
        const w = window.innerWidth, h = window.innerHeight, halfW = Math.floor(w / 2); 
        renderer.setScissorTest(true);

        camera.translateX(-state.eyeSeparation);
        renderer.setScissor(0, 0, halfW, h); renderer.setViewport(0, 0, halfW, h);
        camera.layers.set(1); renderer.render(scene, camera);

        camera.translateX(state.eyeSeparation * 2); 
        renderer.setScissor(halfW, 0, halfW, h); renderer.setViewport(halfW, 0, halfW, h);
        camera.layers.set(2); renderer.render(scene, camera);

        camera.translateX(-state.eyeSeparation);
        renderer.setScissorTest(false); camera.layers.set(0); 
        
        // --- VR GAZE & UI LOGIK FÜR SMARTPHONES ---
        if (els.vrLeft && els.vrRight) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            
            // Menü-Logik (Ein/Ausblenden)
            if (dir.y < -0.98 && !state.vrUiActive) {
                state.vrUiActive = true;
                const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
                state.vrAnchorYaw = euler.y;
                els.vrLeft.clone.classList.add('viewer__vr-ui-layer--visible');
                els.vrRight.clone.classList.add('viewer__vr-ui-layer--visible');
            } 
            else if (dir.y > -0.94 && state.vrUiActive) {
                state.vrUiActive = false;
                els.vrLeft.clone.classList.remove('viewer__vr-ui-layer--visible');
                els.vrRight.clone.classList.remove('viewer__vr-ui-layer--visible');
                resetGaze();
            }
            
            if (state.vrUiActive) {
                const currentYaw = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
                let deltaYaw = currentYaw - state.vrAnchorYaw;
                while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
                while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;
                
                const shiftX = deltaYaw * (window.innerWidth / Math.PI) * 1.5; 
                const transformStr = `translate(calc(-50% + ${shiftX}px), -50%) scale(1.1)`;
                
                els.vrLeft.clone.style.transform = transformStr;
                els.vrRight.clone.style.transform = transformStr;
                
                // Smartphone Hit-Detection
                const reticleRect = els.vrLeft.reticleFill.parentElement.getBoundingClientRect();
                const x = reticleRect.left + reticleRect.width / 2;
                const y = reticleRect.top + reticleRect.height / 2;
                
                els.vrLeft.reticleFill.parentElement.style.visibility = 'hidden';
                const el = document.elementFromPoint(x, y);
                els.vrLeft.reticleFill.parentElement.style.visibility = 'visible';
                
                const btn = el ? el.closest('.viewer__btn, .viewer__switch') : null;
                
                if (btn) {
                    if (state.gazeTarget !== btn) {
                        resetGaze();
                        state.gazeTarget = btn;
                        state.gazeStartTime = performance.now();
                        
                        btn.style.transform = 'scale(1.15)';
                        btn.style.boxShadow = '0 0 15px rgba(212, 160, 23, 0.6)';
                    } else {
                        const progress = Math.min((performance.now() - state.gazeStartTime) / 3000, 1.0);
                        els.vrLeft.reticleFill.style.transform = `scale(${progress})`;
                        els.vrRight.reticleFill.style.transform = `scale(${progress})`;
                        
                        if (progress >= 1.0) {
                            const origId = btn.dataset.vrId || btn.id;
                            if (origId) {
                                const origBtn = document.getElementById(origId);
                                if (origBtn) origBtn.click();
                            } else if (btn.tagName === 'LABEL' && btn.classList.contains('viewer__switch')) {
                                const checkbox = document.getElementById('gyro-toggle');
                                if (checkbox) checkbox.click();
                            }
                            
                            state.gazeStartTime = performance.now() + 1500;
                            resetGaze();
                        }
                    }
                } else {
                    resetGaze();
                }
            }
        }
    } else {
        renderer.render(scene, camera);
    }
}

// =========================================================================
// 3. UI, MEDIA & HELPERS
// =========================================================================

function updateGeometryShape() {
    if (!state.geometry) return;
    const posAttr = state.geometry.attributes.position;
    const orig = state.geometry.userData.originalPositions;
    const target = state.geometry.userData.targetPositions;
    const t = state.shapeMorph;
    for (let i = 0; i < orig.length; i++) {
        posAttr.array[i] = orig[i] * (1 - t) + target[i] * t;
    }
    posAttr.needsUpdate = true;
}

function applyMediaFormat() {
    if (!state.texLeft || !state.texRight) return;
    
    [state.texLeft, state.texRight].forEach(t => { t.repeat.set(1, 1); t.offset.set(0, 0); });
    
    if (state.mediaFormat === 'sbs') {
        meshLeft.layers.disable(2);
        meshLeft.layers.enable(0); 
        meshLeft.layers.enable(1); 
        meshRight.layers.set(2);
        
        state.texLeft.repeat.set(0.5, 1);
        state.texRight.repeat.set(0.5, 1); state.texRight.offset.set(0.5, 0); 
        meshRight.visible = true;
    } else if (state.mediaFormat === 'tb') {
        meshLeft.layers.disable(2);
        meshLeft.layers.enable(0); 
        meshLeft.layers.enable(1); 
        meshRight.layers.set(2);
        
        state.texLeft.repeat.set(1, 0.5); state.texLeft.offset.set(0, 0.5); 
        state.texRight.repeat.set(1, 0.5);
        meshRight.visible = true;
    } else {
        meshLeft.layers.enable(0); 
        meshLeft.layers.enable(1);
        meshLeft.layers.enable(2);
        meshRight.visible = false;
    }
    
    meshLeft.material.needsUpdate = true; 
    meshRight.material.needsUpdate = true;
}

function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    cleanup();
    if (file.type.startsWith('video')) {
        state.isVideo = true; state.currentObjectUrl = URL.createObjectURL(file);
        els.video.src = state.currentObjectUrl; els.video.load();
        
        syncVrUiState(); 

        els.video.onloadedmetadata = () => {
            state.videoCanvas = document.createElement('canvas');
            state.videoCanvas.width = els.video.videoWidth; state.videoCanvas.height = els.video.videoHeight;
            state.videoContext = state.videoCanvas.getContext('2d');
            createMediaTextures(null, true);
        };
        els.playOverlay.classList.remove('viewer__overlay--hidden');
    } else {
        state.currentObjectUrl = URL.createObjectURL(file);
        createMediaTextures(state.currentObjectUrl, false);
    }
}

function cleanup() {
    if (state.texLeft) state.texLeft.dispose();
    if (state.texRight) state.texRight.dispose();
    if (state.currentObjectUrl) URL.revokeObjectURL(state.currentObjectUrl);
    state.videoContext = null; state.isVideo = false;
    els.video.pause(); els.video.removeAttribute('src'); els.video.load();
    syncVrUiState();
}

function createMediaTextures(source, isVideo) {
    if (state.texLeft) state.texLeft.dispose();
    if (state.texRight) state.texRight.dispose();

    if (isVideo) {
        state.texLeft = new THREE.CanvasTexture(state.videoCanvas);
        state.texRight = new THREE.CanvasTexture(state.videoCanvas);
        setupTexture(state.texLeft, true);
        setupTexture(state.texRight, true);
        applyMediaFormat();
    } else {
        const loader = new THREE.TextureLoader();
        const onLoaded = (tex) => {
            state.texLeft = tex;
            state.texRight = tex.clone();
            setupTexture(state.texLeft, false);
            setupTexture(state.texRight, false);
            applyMediaFormat();
        };
        
        if (source instanceof HTMLCanvasElement) {
            onLoaded(new THREE.CanvasTexture(source));
        } else {
            loader.load(source, onLoaded);
        }
    }
}

function setupTexture(tex, isVideo) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    if (!isVideo) tex.generateMipmaps = false;
    
    meshLeft.material.map = state.texLeft;
    meshRight.material.map = state.texRight;
    meshLeft.material.needsUpdate = true;
    meshRight.material.needsUpdate = true;
}

function createPlaceholderTexture() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,1024,512);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    for(let i = 0; i <= 1024; i += 64) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke(); }
    for(let i = 0; i <= 512; i += 64) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke(); }
    ctx.fillStyle = '#d4a017'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('360° VIEWER PRO', 512, 256);
    return c;
}

// --- VR DOM Generator ---
function initVrUi() {
    if (document.getElementById('vr-ui-left')) return; 

    const createVrSide = (side) => {
        const container = document.createElement('div');
        container.className = `viewer__vr-ui-container viewer__vr-ui-container--${side}`;
        container.id = `vr-ui-${side}`;
        
        const clone = els.uiLayer.cloneNode(true);
        clone.id = '';
        clone.className = 'viewer__ui-layer viewer__vr-ui-layer';
        
        clone.querySelectorAll('[id]').forEach(el => {
            el.dataset.vrId = el.id;
            el.removeAttribute('id');
        });
        
        container.appendChild(clone);
        
        // Fadenkreuz initialisieren
        const reticle = document.createElement('div');
        reticle.className = 'vr-reticle';
        reticle.innerHTML = '<div class="vr-reticle-fill"></div>';
        container.appendChild(reticle);
        
        document.querySelector('.viewer').appendChild(container);
        return { container, clone, reticleFill: reticle.querySelector('.vr-reticle-fill') };
    };
    
    els.vrLeft = createVrSide('left');
    els.vrRight = createVrSide('right');
    syncVrUiState();
}

// --- UI Bindings ---
els.gyroToggle.addEventListener('change', (e) => { if(e.target.checked) activateGyro(); else { state.useGyro = false; if(controls) controls.disconnect(); }});
els.settingFormat.addEventListener('change', (e) => { state.mediaFormat = e.target.value; applyMediaFormat(); });
els.settingRotation.addEventListener('input', (e) => { state.rotationOffset = parseInt(e.target.value, 10); els.rotVal.textContent = state.rotationOffset + "°"; meshGroup.rotation.y = THREE.MathUtils.degToRad(state.rotationOffset); });
els.settingShape.addEventListener('input', (e) => { state.shapeMorph = e.target.value / 100; els.shapeVal.textContent = e.target.value + "%"; updateGeometryShape(); });

els.settingIpd.addEventListener('input', (e) => { 
    state.eyeSeparation = parseInt(e.target.value, 10); 
    els.ipdVal.textContent = e.target.value; 
});

els.settingFov.addEventListener('input', (e) => { 
    const newFov = parseInt(e.target.value, 10);
    camera.fov = newFov; 
    camera.updateProjectionMatrix(); 
    els.fovVal.textContent = newFov + "°"; 
});

els.settingScale.addEventListener('input', (e) => { 
    const scale = parseFloat(e.target.value);
    meshGroup.scale.set(scale, scale, scale); 
    els.scaleVal.textContent = scale.toFixed(1) + "x"; 
});

els.btnCardboardVr.addEventListener('click', () => { 
    state.isCardboardVR = !state.isCardboardVR; 
    
    if (state.isCardboardVR) {
        initVrUi(); 
        document.querySelector('.viewer').classList.add('viewer--vr');
        els.vrDivider.style.display = 'block'; 
    } else {
        document.querySelector('.viewer').classList.remove('viewer--vr');
        els.vrDivider.style.display = 'none'; 
        state.vrUiActive = false;
        if(els.vrLeft) {
            els.vrLeft.clone.classList.remove('viewer__vr-ui-layer--visible');
            els.vrRight.clone.classList.remove('viewer__vr-ui-layer--visible');
        }
    }
    
    syncVrUiState();
    onWindowResize(); 
});

els.iconPause.style.display = 'none';

els.btnForcePlay.addEventListener('click', () => { 
    if(state.isVideo) els.video.play().then(() => { 
        els.video.muted = false; 
        els.playOverlay.classList.add('viewer__overlay--hidden'); 
        syncVrUiState();
    }); 
});

els.btnVideoControl.addEventListener('click', () => {
    if (!state.isVideo) return;
    if (els.video.paused) {
        els.video.play();
    } else {
        els.video.pause();
    }
    syncVrUiState();
});

els.btnFullscreen.addEventListener('click', () => {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen();
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen(); 
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); 
    }
});

els.btnSettings.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    els.settingsPanel.classList.toggle('viewer__settings-panel--open');
    els.btnSettings.classList.toggle('viewer__btn--active');
});


function onPointerDown(e) { 
    if (state.useGyro || renderer.xr.isPresenting || e.target.closest('#ui-layer') || e.target.closest('#settings-panel')) return; 
    
    state.isUserInteracting = true; 
    state.onPointerDownX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    state.onPointerDownY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    state.onPointerDownLon = state.targetLon; 
    state.onPointerDownLat = state.targetLat; 
}

function onPointerMove(e) { 
    if (state.isUserInteracting) { 
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0); 
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0); 
        state.targetLon = state.onPointerDownLon - (clientX - state.onPointerDownX) * CONFIG.rotateSpeed; 
        state.targetLat = state.onPointerDownLat + (clientY - state.onPointerDownY) * CONFIG.rotateSpeed; 
    }
}

function onPointerUp() { state.isUserInteracting = false; }
function onWindowResize() { camera.aspect = (state.isCardboardVR ? window.innerWidth/2 : window.innerWidth) / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

// =========================================================================
// 4. iOS "ADD TO HOME SCREEN" POPUP LOGIK
// =========================================================================

function initIosPwaPopup() {
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };

    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
    const hasBeenDismissed = localStorage.getItem('iosPwaPopupDismissed');

    if (isIos() && !isInStandaloneMode() && !hasBeenDismissed) {
        const popup = document.getElementById('ios-pwa-popup');
        const closeBtn = document.getElementById('ios-pwa-popup-close');

        if (popup && closeBtn) {
            setTimeout(() => {
                popup.classList.remove('hidden');
            }, 2000);

            closeBtn.addEventListener('click', () => {
                popup.classList.add('hidden');
                localStorage.setItem('iosPwaPopupDismissed', 'true');
            });
        }
    }
}

initIosPwaPopup();