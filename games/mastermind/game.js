let secretCode = [];
let currentAttempt = [];
const colors = ["red", "green", "blue", "yellow", "orange", "purple"];
let maxAttempts = 10;
let timer;
let timeLeft = 60;

// Generar código secreto
function generateSecretCode() {
    secretCode = [];
    for (let i = 0; i < 7; i++) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        secretCode.push(randomColor);
    }
}

// Comprobar intento del jugador
function checkAttempt() {
    let correctPosition = 0;
    let correctColor = 0;

    const tempSecret = [...secretCode];
    const tempAttempt = [...currentAttempt];

    // Primero, comprobar colores en la posición correcta
    for (let i = 0; i < tempAttempt.length; i++) {
        if (tempAttempt[i] === tempSecret[i]) {
            correctPosition++;
            tempSecret[i] = tempAttempt[i] = null; // Eliminar para evitar duplicados
        }
    }

    // Después, comprobar colores correctos pero en la posición incorrecta
    for (let i = 0; i < tempAttempt.length; i++) {
        if (tempAttempt[i] && tempSecret.includes(tempAttempt[i])) {
            correctColor++;
            tempSecret[tempSecret.indexOf(tempAttempt[i])] = null;
        }
    }

    // Mostrar feedback visual
    const attemptDiv = document.createElement('div');
    attemptDiv.classList.add('attempt');
    currentAttempt.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = color;
        colorDiv.classList.add('color-circle');
        attemptDiv.appendChild(colorDiv);
    });

    // Mostrar pistas visuales
    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('feedback');
    for (let i = 0; i < correctPosition; i++) {
        const circle = document.createElement('div');
        circle.classList.add('feedback-circle', 'correct-position');
        feedbackDiv.appendChild(circle);
    }
    for (let i = 0; i < correctColor; i++) {
        const circle = document.createElement('div');
        circle.classList.add('feedback-circle', 'correct-color');
        feedbackDiv.appendChild(circle);
    }

    attemptDiv.appendChild(feedbackDiv);
    document.getElementById('attempts').appendChild(attemptDiv);

    if (correctPosition === 7) {
        alert("¡Has ganado!");
        clearInterval(timer);
        restartGame();
    } else if (--maxAttempts <= 0 || timeLeft <= 0) {
        alert("¡Se acabaron los intentos! El código era: " + secretCode.join(", "));
        clearInterval(timer);
        restartGame();
    }

    currentAttempt = [];
}

// Reiniciar el juego
function restartGame() {
    generateSecretCode();
    maxAttempts = 10;
    timeLeft = 60;
    clearInterval(timer);
    startTimer();
    currentAttempt = [];
    document.getElementById('attempts').innerHTML = "";
}

// Temporizador
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Tiempo restante: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("¡Tiempo agotado!");
            restartGame();
        }
    }, 1000);
}

// Iniciar juego
document.getElementById('check-guess').addEventListener('click', checkAttempt);
document.getElementById('restart-game').addEventListener('click', restartGame);

// Generar código secreto y temporizador al cargar la página
generateSecretCode();
startTimer();
