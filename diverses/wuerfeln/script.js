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
// Mapping: Welche Rotation (X, Y) zeigt welche Zahl (Face)?
// Basierend auf Standard-CSS-Würfel (Front=1, Back=2, Right=3, Left=4, Top=5, Bottom=6)
// Um z.B. "Rechts" (3) anzuzeigen, müssen wir den Container entgegengesetzt drehen.
const faceRotations = {
  1: { x: 0, y: 0 },      // Front
  2: { x: 180, y: 0 },    // Back
  3: { x: 0, y: -90 },    // Right (Face ist bei +90, also Container -90 drehen)
  4: { x: 0, y: 90 },     // Left
  5: { x: -90, y: 0 },    // Top
  6: { x: 90, y: 0 }      // Bottom
};

function rollCube(cubeEl, rotatorEl) {
  try {
    // 1. Zufallszahl bestimmen (1-6)
    const result = Math.floor(Math.random() * 6) + 1;
    
    // 2. Ziel-Rotation holen
    const target = faceRotations[result];

    // 3. Zufällige zusätzliche Umdrehungen hinzufügen (für den visuellen Effekt)
    // Wir addieren Vielfache von 360 Grad, damit die Ausrichtung gleich bleibt
    const extraSpinsX = (Math.floor(Math.random() * 3) + 1) * 360; 
    const extraSpinsY = (Math.floor(Math.random() * 3) + 1) * 360;

    const newX = target.x + extraSpinsX;
    const newY = target.y + extraSpinsY;

    cubeEl.classList.add('animate');

    // Timeout passend zur CSS-Animation (hier angenommen ca. 1-2 Sekunden Shake)
    // Wir setzen die Rotation kurz nach Start der Animation, damit er am Ende dort landet
    setTimeout(() => {
      rotatorEl.style.transform = `rotateX(${newX}deg) rotateY(${newY}deg)`;
      cubeEl.classList.remove('animate');
      console.log(`Gewürfelt: ${result}`); // Ergebnis in Konsole (oder später UI)
    }, 500); // Zeit muss zur CSS-Animation passen
  } catch (err) {
    console.error('Fehler beim Würfeln:', err);
  }
}

// 4. Shake-Detection
const SHAKE_THRESHOLD = 20; // Schwelle leicht erhöht, um versehentliches Würfeln zu vermeiden
let lastShake = 0;
function setupShake(onShakeCallback) {
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

  // iOS 13+ benötigt Permission auf User-Interaktion (Klick)
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    return function requestPermission() {
      DeviceMotionEvent.requestPermission()
        .then(res => {
          if (res === 'granted') window.addEventListener('devicemotion', handleMotion, false);
        })
        .catch(err => console.error('Permission-Error:', err));
    };
  } else {
    window.addEventListener('devicemotion', handleMotion, false);
    return function() {}; // Leerfunktion für Android/Desktop
  }
}

// 5. Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  const cubeEl    = document.getElementById('cube');
  const rotatorEl = document.getElementById('rotator');
  const rollBtn   = document.getElementById('rollButton');

  renderDots(cubeEl);

  const enableShake = setupShake(() => rollCube(cubeEl, rotatorEl));

  rollBtn.addEventListener('click', () => {
    enableShake(); // Permission beim Klick anfordern (wichtig für iOS)
    rollCube(cubeEl, rotatorEl);
  });
});
