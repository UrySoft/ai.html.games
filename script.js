
let wordObj;
let wordToGuess;
let currentGuess = [];
let attempts = 0;
let timeLeft = 60;

const letterGrid = document.querySelector('.letter-grid');
const currentGuessDisplay = document.getElementById('current-guess');
const hintsList = document.getElementById('hints-list');
const attemptCount = document.getElementById('attempt-count');
const resultMessage = document.getElementById('result-message');
const timerDisplay = document.getElementById('timer');

// Generar dinámicamente los botones de letras
function generateLetterGrid() {
    letterGrid.innerHTML = ''; // Limpiar botones anteriores
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => Math.random() - 0.5).slice(0, 9);
    letters.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.addEventListener('click', () => {
            if (currentGuess.length < wordToGuess.length) {
                currentGuess.push(letter);
                updateGuessDisplay();
            }
        });
        letterGrid.appendChild(button);
    });
}

// Actualizar la visualización de la palabra que se está formando
function updateGuessDisplay() {
    currentGuessDisplay.textContent = currentGuess.join('') + '_'.repeat(wordToGuess.length - currentGuess.length);
}

// Mostrar pista basada en el significado
function showHint() {
    hintsList.innerHTML = ''; // Limpiar pista anterior
    const hintItem = document.createElement('li');
    hintItem.textContent = wordObj.hint;
    hintsList.appendChild(hintItem);
}

// Comprobar la palabra ingresada
document.getElementById('check').addEventListener('click', () => {
    if (currentGuess.length === wordToGuess.length) {
        attempts++;
        attemptCount.textContent = attempts;
        checkGuess();
        if (currentGuess.join('') === wordToGuess) {
            clearInterval(timerInterval);
            resultMessage.textContent = 'Felicitats! Has encertat la paraula!';
        } else {
            showHint();
            resetLetterSelection();
        }
    } else {
        alert('Has d'introduir totes les lletres!');
    }
});

// Lógica de verificación
function checkGuess() {
    let buttons = document.querySelectorAll('.letter-grid button');
    currentGuess.forEach((letter, index) => {
        let button = Array.from(buttons).find(btn => btn.textContent === letter);
        if (wordToGuess[index] === letter) {
            button.classList.add('correct');
        } else if (wordToGuess.includes(letter)) {
            button.classList.add('partial');
        } else {
            button.classList.add('wrong');
        }
    });
}

// Reiniciar la selección de letras
function resetLetterSelection() {
    currentGuess = [];
    updateGuessDisplay();
    document.querySelectorAll('.letter-grid button').forEach(button => {
        button.classList.remove('correct', 'partial', 'wrong');
    });
}

// Reiniciar el juego
document.getElementById('reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    wordObj = words[Math.floor(Math.random() * words.length)];
    wordToGuess = wordObj.word;
    currentGuess = [];
    attempts = 0;
    timeLeft = 60;
    attemptCount.textContent = attempts;
    timerDisplay.textContent = `Temps restant: ${timeLeft}`;
    updateGuessDisplay();
    hintsList.innerHTML = '';
    resultMessage.textContent = '';
    resetLetterSelection();
    generateLetterGrid();
    startTimer();
});

// Iniciar el temporizador
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Temps restant: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            resultMessage.textContent = 'Temps esgotat! Has perdut!';
        }
    }, 1000);
}

let timerInterval = startTimer();
generateLetterGrid();
updateGuessDisplay();
