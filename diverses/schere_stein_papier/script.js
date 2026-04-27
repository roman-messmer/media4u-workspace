document.addEventListener('dblclick', function(event) {
    event.preventDefault();  // Verhindert das Zoomen beim Doppelklick
});

let playerScore = 0; // Punktestand Spieler
let computerScore = 0; // Punktestand Computer

// Standardbild setzen beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("computer-choice-image").src = "leer_schere_stein_papier.jpg";
});

function playGame(playerChoice) {
    const options = ["Schere", "Stein", "Papier"];
    const computerChoice = options[Math.floor(Math.random() * options.length)];
    
    let result = "";
    if (playerChoice === computerChoice) {
        result = "Unentschieden! Beide haben " + playerChoice + " gewählt.";
    } else if (
        (playerChoice === "Schere" && computerChoice === "Papier") ||
        (playerChoice === "Stein" && computerChoice === "Schere") ||
        (playerChoice === "Papier" && computerChoice === "Stein")
    ) {
        result = "Du gewinnst! " + playerChoice + " schlägt " + computerChoice + ".";
        playerScore++;
    } else {
        result = "Du verlierst! " + computerChoice + " schlägt " + playerChoice + ".";
        computerScore++;
    }

    // Ergebnis anzeigen
    document.getElementById("result").innerText = result;

    // Computerwahl anzeigen
    const computerChoiceImage = document.getElementById("computer-choice-image");
    computerChoiceImage.src = computerChoice.toLowerCase() + ".jpg";
    computerChoiceImage.alt = computerChoice;

    // Punktestände aktualisieren
    document.getElementById("player-score").innerText = playerScore;
    document.getElementById("computer-score").innerText = computerScore;

    // Hauptsieger prüfen
    checkWinner();
}

function checkWinner() {
    if (playerScore === 10) {
        document.getElementById("result").innerText = "Du bist der Hauptsieger!";
        showResetButton();
    } else if (computerScore === 10) {
        document.getElementById("result").innerText = "Der Computer ist der Hauptsieger!";
        showResetButton();
    }
}

function showResetButton() {
    // Buttons deaktivieren
    document.querySelectorAll(".button-container .button").forEach(button => {
        button.disabled = true;
    });

    // Reset-Button anzeigen
    document.getElementById("reset-container").style.display = "block";
}

function resetGame() {
    // Punktestände zurücksetzen
    playerScore = 0;
    computerScore = 0;

    // Punktestände im DOM aktualisieren
    document.getElementById("player-score").innerText = playerScore;
    document.getElementById("computer-score").innerText = computerScore;

    // Ergebnis und Computer-Wahl zurücksetzen
    document.getElementById("result").innerText = "";
    const computerChoiceImage = document.getElementById("computer-choice-image");
    computerChoiceImage.src = "leer_schere_stein_papier.jpg"; // Standardbild setzen
    computerChoiceImage.alt = "Wähle deine Option"; // Alternativtext setzen

    // Buttons aktivieren
    document.querySelectorAll(".button-container .button").forEach(button => {
        button.disabled = false;
    });

    // Reset-Button ausblenden
    document.getElementById("reset-container").style.display = "none";
}
