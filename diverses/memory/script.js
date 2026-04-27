document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.memory-card');
  const attemptsDisplay = document.getElementById('attempts');
  const highscoreDisplay = document.getElementById('highscore');
  const resetButton = document.getElementById('resetButton');

  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard, secondCard;
  let attempts = 0;
  
  let highscore = null;
  try {
    highscore = localStorage.getItem('memoryHighscore'); // Highscore sicher laden
  } catch (e) {
    console.warn('LocalStorage nicht verfügbar');
  }

  let unflipTimeout; // Variable für den Timeout

  if (highscore !== null) {
    highscoreDisplay.textContent = highscore;
  }

  // Funktion: Karte klicken
  function flipCard() {
    if (lockBoard) return; // Sperre aktiv? Abbrechen
    if (this === firstCard) return; // Gleiche Karte? Abbrechen

    this.classList.add('flip'); // Karte umdrehen (CSS-Klasse hinzufügen)

    if (!hasFlippedCard) {
      hasFlippedCard = true; // Erste Karte umgedreht
      firstCard = this; // Speichere erste Karte
      return;
    }

    // Zweite Karte
    secondCard = this;
    checkForMatch();
  }

  // Funktion: Überprüfen, ob zwei Karten übereinstimmen
  function checkForMatch() {
    attempts++;
    attemptsDisplay.textContent = attempts;

    const isMatch = firstCard.dataset.card === secondCard.dataset.card;

    if (isMatch) {
      disableCards(); // Treffer: Karten deaktivieren
      updateHighscore();
    } else {
      unflipCards(); // Kein Treffer: Karten zurückdrehen
    }
  }

  // Funktion: Karten deaktivieren (bei Treffer)
  function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
  }

  // Funktion: Karten zurückdrehen (bei keinem Treffer)
  function unflipCards() {
    lockBoard = true;

    unflipTimeout = setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetBoard();
    }, 1000);
  }

  // Funktion: Spielbrett zurücksetzen
  function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  // Funktion: Karten mischen
  function shuffleCards() {
    cards.forEach(card => {
      const randomPos = Math.floor(Math.random() * cards.length);
      card.style.order = randomPos; // CSS-Eigenschaft "order" ändern
    });
  }

  // Funktion: Spiel zurücksetzen
  function resetGame() {
    clearTimeout(unflipTimeout); // Laufenden Timeout abbrechen
    lockBoard = true; // Board sperren während der Animation
    attempts = 0;
    attemptsDisplay.textContent = attempts;
    cards.forEach(card => card.classList.remove('flip')); // Karten zurücksetzen
    cards.forEach(card => {
      card.removeEventListener('click', flipCard); // Alte Listener entfernen
      card.addEventListener('click', flipCard);    // Event neu hinzufügen
    });
    
    setTimeout(() => {
      shuffleCards(); // Karten neu mischen
      resetBoard(); // Board entsperren und Status zurücksetzen
    }, 500);
  }

  // Funktion: Highscore aktualisieren
  function updateHighscore() {
    const totalFlippedCards = document.querySelectorAll('.memory-card.flip').length;
    if (totalFlippedCards === cards.length) {
      // Highscore aktualisieren, wenn noch keiner existiert oder der neue besser (niedriger) ist
      const currentHighscore = highscore === null ? null : parseInt(highscore);
      if (currentHighscore === null || attempts < currentHighscore) {
        highscore = attempts;
        highscoreDisplay.textContent = highscore;
        try {
          localStorage.setItem('memoryHighscore', highscore); // Highscore speichern
        } catch (e) {}
      }
    }
  }

  // Event-Listener hinzufügen
  cards.forEach(card => card.addEventListener('click', flipCard));
  resetButton.addEventListener('click', resetGame);
  shuffleCards(); // Karten beim Laden der Seite mischen
});
