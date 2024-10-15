let secretCode = [];
let currentAttempt = [];
const maxSelection = 4;
const colors = ["red", "green", "blue", "purple"]; // Solo 4 colores posibles
let maxAttempts = 10;
let timer;
let timeLeft = 60;
let attemptsHistory = [];

// Generar código secreto
function generateSecretCode() {
    secretCode = [];
    for (let i = 0; i < maxSelection; i++) { // Ahora solo 4 colores
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        secretCode.push(randomColor);
    }
}

// Mostrar la selección actual del usuario en colores debajo de los colores seleccionables
function updateCurrentAttemptDisplay() {
    const attemptDiv = document.getElementById('current-attempt');
    attemptDiv.innerHTML = ''; // Limpiar selección anterior
    currentAttempt.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.classList.add('color-preview');
        colorDiv.style.backgroundColor = color;
        colorDiv.style.width = '40px';
        colorDiv.style.height = '40px';
        colorDiv.style.display = 'inline-block';
        colorDiv.style.marginRight = '10px';
        colorDiv.style.borderRadius = '50%';
        attemptDiv.appendChild(colorDiv);
    });
}

// Comprobar intento del jugador automáticamente
function checkAttempt() {
    let correctPosition = 0;
    let correctColor = 0;

    const tempSecret = [...secretCode];
    const tempAttempt = [...currentAttempt];

    // Primero, comprobar colores en la posición correcta
    for (let i = 0; i < tempAttempt.length; i++) {
        if (tempAttempt[i] === tempSecret[i]) {
            correctPosition++;
            tempSecret[i] = tempAttempt[i] = null;
        }
    }

    // Después, comprobar colores correctos pero en la posición incorrecta
    for (let i = 0; i < tempAttempt.length; i++) {
        if (tempAttempt[i] && tempSecret.includes(tempAttempt[i])) {
            correctColor++;
            tempSecret[tempSecret.indexOf(tempAttempt[i])] = null;
        }
    }

    const attemptDiv = document.createElement('div');
    attemptDiv.classList.add('attempt');
    
    currentAttempt.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = color;
        colorDiv.classList.add('color-circle');
        attemptDiv.appendChild(colorDiv);
    });

    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('feedback');

    // Pistas en formato 2x2
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

    const incorrectPicks = maxSelection - correctPosition - correctColor;
    for (let i = 0; i < incorrectPicks; i++) {
        const circle = document.createElement('div');
        circle.classList.add('feedback-circle', 'incorrect');
        feedbackDiv.appendChild(circle);
    }

    feedbackDiv.style.display = 'grid';
    feedbackDiv.style.gridTemplateColumns = 'repeat(2, 1fr)'; // Configurar en formato 2x2

    attemptDiv.appendChild(feedbackDiv);
    document.getElementById('attempts').appendChild(attemptDiv);

    // Almacenar en el historial
    attemptsHistory.push({ colors: [...currentAttempt], feedback: { correctPosition, correctColor } });

    if (correctPosition === maxSelection) { // Ahora son 4 colores
        alert("¡Has ganado!");
        clearInterval(timer);
    } else if (--maxAttempts <= 0 || timeLeft <= 0) {
        showSecretCode();
    }

    currentAttempt = [];
    updateCurrentAttemptDisplay(); // Llamada para mostrar la nueva selección después de verificar
}

// Mostrar el código secreto utilizando la sección de selección actual
function showSecretCode() {
    const attemptDiv = document.getElementById('current-attempt');
    attemptDiv.innerHTML = ''; // Limpiar contenido anterior

    secretCode.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = color;
        colorDiv.classList.add('color-preview');
        colorDiv.style.width = '40px';
        colorDiv.style.height = '40px';
        colorDiv.style.display = 'inline-block';
        colorDiv.style.marginRight = '10px';
        colorDiv.style.borderRadius = '50%';
        attemptDiv.appendChild(colorDiv);
    });
}

// Añadir color a la selección del usuario
function addColorToAttempt(color) {
    if (currentAttempt.length < maxSelection) {
        currentAttempt.push(color);
        updateCurrentAttemptDisplay(); // Actualizar la visualización cada vez que se seleccione un color
    } else {
        alert(`Solo puedes seleccionar ${maxSelection} colores.`);
    }
}

// Mostrar el patrón secreto al hacer clic en el botón de revelar patrón
function revealPattern() {
    showSecretCode();
}

// Reiniciar el juego
function restartGame() {
    generateSecretCode();
    maxAttempts = 10;
    timeLeft = 60;
    clearInterval(timer);
    startTimer();
    currentAttempt = [];
    attemptsHistory = [];
    document.getElementById('attempts').innerHTML = "";
    document.getElementById('secret-code').innerHTML = ""; // Limpiar código secreto
    updateCurrentAttemptDisplay();
}

// Temporizador
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Tiempo restante: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showSecretCode();
        }
    }, 1000);
}

// Iniciar juego
document.getElementById('restart-game').addEventListener('click', restartGame);
document.getElementById('reveal-pattern').addEventListener('click', revealPattern);

// Agregar eventos a los botones de selección de colores
document.querySelectorAll('.color').forEach(button => {
    button.addEventListener('click', () => addColorToAttempt(button.getAttribute('data-color')));
});

// Generar código secreto y temporizador al cargar la página
generateSecretCode();
startTimer();
