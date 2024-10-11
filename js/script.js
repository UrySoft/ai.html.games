let wordToGuess = '';
let currentGuess = [];
let attempts = 0;
let timeLeft = 60;
let timer;

const letterGrid = document.querySelector('.letter-grid');
const currentGuessDisplay = document.getElementById('current-guess');
const attemptCountDisplay = document.getElementById('attempt-count');
const timerDisplay = document.getElementById('timer');
const resultMessage = document.getElementById('result-message');
const hintDisplay = document.getElementById('hints-list');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

document.getElementById('checkGuess').addEventListener('click', checkGuess);
document.getElementById('restartGame').addEventListener('click', startGame);

function startGame() {
    wordToGuess = getRandomWord();
    currentGuess = [];
    attempts = 0;
    timeLeft = 60;
    resultMessage.textContent = '';
    currentGuessDisplay.textContent = '';
    attemptCountDisplay.textContent = 'Intentos: 0';
    timerDisplay.textContent = `Temps: 60s`;
    hintDisplay.textContent = 'Pista: ' + wordToGuess.hint;
    
    generateLetterGrid();
    startTimer();
}

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function generateLetterGrid() {
    letterGrid.innerHTML = '';
    const letters = shuffleArray(wordToGuess.word.split(''));
    letters.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.addEventListener('click', () => selectLetter(letter, button));
        letterGrid.appendChild(button);
    });
}

function selectLetter(letter, button) {
    if (currentGuess.length < wordToGuess.word.length) {
        currentGuess.push(letter);
        updateGuessDisplay();
        button.disabled = true;
        button.style.backgroundColor = '#ccc';
    }
}

function updateGuessDisplay() {
    currentGuessDisplay.textContent = currentGuess.join('');
}

function checkGuess() {
    attempts++;
    attemptCountDisplay.textContent = `Intentos: ${attempts}`;
    const guess = currentGuess.join('');
    
    if (guess === wordToGuess.word) {
        resultMessage.textContent = "Felicitats! Has encertat la paraula!";
        if (correctSound) correctSound.play();  // Verificación del audio
        clearInterval(timer);
    } else {
        resultMessage.textContent = "Paraula incorrecta!";
        if (incorrectSound) incorrectSound.play();  // Verificación del audio
        resetLetterSelection();
    }
}

function resetLetterSelection() {
    currentGuess = [];
    updateGuessDisplay();
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Temps: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            resultMessage.textContent = "Temps esgotat! Has perdut!";
            if (incorrectSound) incorrectSound.play();  // Verificación del audio
        }
    }, 1000);
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
