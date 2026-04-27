// Würfel mit Shake-Erkennung in einer Datei

// 1. Doppeltipp-/Doppelklick-Zoom verhindern
(function preventZoomSetup() {
  function preventZoom(e) { e.preventDefault(); }
  document.addEventListener('dblclick', preventZoom, { passive: false });
  let lastTouch = 0, DOUBLE_TAP_DELAY = 300;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouch <= DOUBLE_TAP_DELAY) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
})();

// 2. Dot-Rendering
function getDotPositions(val) {
  switch (val) {
    case 1: return [[2,2]];
    case 2: return [[1,1],[3,3]];
    case 3: return [[1,1],[2,2],[3,3]];
    case 4: return [[1,1],[1,3],[3,1],[3,3]];
    case 5: return [[1,1],[1,3],[2,2],[3,1],[3,3]];
    case 6: return [[1,1],[2,1],[3,1],[1,3],[2,3],[3,3]];
    default: return [];
  }
}

function renderDots(cubeEl) {
  const faces = cubeEl.querySelectorAll('.face');
  faces.forEach(face => {
    const value = Number(face.dataset.value);
    face.textContent = '';
    const frag = document.createDocumentFragment();
    getDotPositions(value).forEach(([col, row]) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.gridColumn = col;
      dot.style.gridRow = row;
      frag.appendChild(dot);
    });
    face.appendChild(frag);
  });
}

// 3. Cube-Roll-Logik
let currentX = -20, currentY = 30;
function getRandomRotation() {
  return Math.floor(Math.random() * 4) * 90;
}
function rollCube(cubeEl, rotatorEl) {
  try {
    const newX = getRandomRotation();
    const newY = getRandomRotation();
    if (newX === currentX && newY === currentY) return;

    cubeEl.classList.add('animate');
    cubeEl.addEventListener('animationend', () => {
      cubeEl.classList.remove('animate');
    }, { once: true });

    setTimeout(() => {
      rotatorEl.style.transform = `rotateX(${newX}deg) rotateY(${newY}deg)`;
      renderDots(cubeEl);
      currentX = newX;
      currentY = newY;
    }, 250);
  } catch (err) {
    console.error('Fehler beim Würfeln:', err);
  }
}

// 4. Shake-Detection
const SHAKE_THRESHOLD = 15;
let lastShake = 0;
function initShake(onShakeCallback) {
  function handleMotion(e) {
    try {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (x == null || y == null || z == null) return;
      const acc = Math.hypot(x, y, z);
      const now = Date.now();
      if (acc > SHAKE_THRESHOLD && now - lastShake > 1500) {
        lastShake = now;
        onShakeCallback();
      }
    } catch (err) {
      console.error('Fehler im Shake-Handler:', err);
    }
  }

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(res => {
        if (res === 'granted') window.addEventListener('devicemotion', handleMotion, false);
      })
      .catch(err => console.error('Permission-Error:', err));
  } else {
    window.addEventListener('devicemotion', handleMotion, false);
  }
}

// 5. Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  const cubeEl    = document.getElementById('cube');
  const rotatorEl = document.getElementById('rotator');
  const rollBtn   = document.getElementById('rollButton');

  renderDots(cubeEl);
  rollBtn.addEventListener('click', () => rollCube(cubeEl, rotatorEl));
  initShake(() => rollCube(cubeEl, rotatorEl));
});
