const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dynamische Canvas-Größe (Responsive)
canvas.width = Math.min(window.innerWidth, 400); // Max. Breite 400px
canvas.height = canvas.width;
const cellSize = canvas.width / 12; // 12x12 Labyrinth

// Labyrinth-Daten (1 = Wand, 0 = leer, 2 = Ziel)
const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Kugel-Position
let ball = { x: 1.5 * cellSize, y: 1.5 * cellSize }; // Startposition
const ballRadius = 10;

// Gyroskop-Daten
let tiltX = 0; // Links/Rechts
let tiltY = 0; // Vor/Zurück

// Geschwindigkeit
const speedFactor = 0.1;

// Timer
let startTime = Date.now();

// Labyrinth zeichnen
function drawMaze() {
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col] === 1) {
        ctx.fillStyle = 'blue'; // Wand
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      } else if (maze[row][col] === 2) {
        ctx.fillStyle = 'green'; // Ziel
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Kugel zeichnen
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath();
}

// Prüfen, ob die Kugel mit der Wand kollidiert
function isCollision(newX, newY) {
  const buffer = 2; // Leichte Überschneidung
  const left = newX - ballRadius + buffer;
  const right = newX + ballRadius - buffer;
  const top = newY - ballRadius + buffer;
  const bottom = newY + ballRadius - buffer;

  const leftCol = Math.floor(left / cellSize);
  const rightCol = Math.floor(right / cellSize);
  const topRow = Math.floor(top / cellSize);
  const bottomRow = Math.floor(bottom / cellSize);

  return (
    maze[topRow][leftCol] === 1 ||
    maze[topRow][rightCol] === 1 ||
    maze[bottomRow][leftCol] === 1 ||
    maze[bottomRow][rightCol] === 1
  );
}

// Kugel-Bewegung prüfen und aktualisieren
function updateBallPosition() {
  const newX = ball.x + tiltX * speedFactor;
  const newY = ball.y + tiltY * speedFactor;

  if (isCollision(newX, newY)) {
    alert('Verloren! Du bist gegen eine Wand gestoßen.');
    resetGame();
    return;
  }

  const col = Math.floor(newX / cellSize);
  const row = Math.floor(newY / cellSize);
  if (maze[row] && maze[row][col] === 2) {
    alert(`Geschafft! Du hast das Ziel in ${Math.floor((Date.now() - startTime) / 1000)} Sekunden erreicht.`);
    resetGame();
    return;
  }

  ball.x = Math.min(Math.max(newX, ballRadius), canvas.width - ballRadius);
  ball.y = Math.min(Math.max(newY, ballRadius), canvas.height - ballRadius);
}

// Spiel zurücksetzen
function resetGame() {
  ball.x = 1.5 * cellSize;
  ball.y = 1.5 * cellSize;
  startTime = Date.now();
}

// Timer anzeigen
function displayTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Zeit: ${elapsed}s`, 10, 20);
}

// Haupt-Spielschleife
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawBall();
  displayTimer();
  updateBallPosition();
  requestAnimationFrame(gameLoop);
}

// Gyroskop-Daten verarbeiten
function handleOrientation(event) {
  tiltX = event.gamma || 0;
  tiltY = event.beta || 0;
}

// Bewegung mit Pfeiltasten (Fallback)
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      tiltY = -10;
      break;
    case 'ArrowDown':
      tiltY = 10;
      break;
    case 'ArrowLeft':
      tiltX = -10;
      break;
    case 'ArrowRight':
      tiltX = 10;
      break;
  }
});

// Berechtigungen für Bewegungssensoren anfordern (iOS 13+)
if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
  const button = document.createElement('button');
  button.innerText = 'Bewegungssensor aktivieren';
  button.style.position = 'absolute';
  button.style.top = '50%';
  button.style.left = '50%';
  button.style.transform = 'translate(-50%, -50%)';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  document.body.appendChild(button);

  button.addEventListener('click', async () => {
    const permissionState = await DeviceOrientationEvent.requestPermission();
    if (permissionState === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation);
      document.body.removeChild(button);
      gameLoop();
    } else {
      alert('Bewegungssensoren nicht aktiviert.');
    }
  });
} else {
  window.addEventListener('deviceorientation', handleOrientation);
  gameLoop();
}