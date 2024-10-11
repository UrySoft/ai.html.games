let secretCode = [];
let currentAttempt = [];
const maxSelection = 5; // Máximo de 5 colores por intento
const colors = ["red", "green", "blue", "yellow", "orange"];
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

// Mostrar selección del usuario en colores
function updateCurrentAttemptDisplay() {
    const attemptDiv = document.getElementById('current-attempt');
    attemptDiv.innerHTML = ''; // Limpiar selección anterior
    currentAttempt.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.classList.add('color-preview');
        colorDiv.style.backgroundColor = color;
        attemptDiv.appendChild(colorDiv);
    });
}

// Comprobar intento del jugador
function checkAttempt() {
    if (currentAttempt.length !== maxSelection) {
        alert(`Debes seleccionar exactamente ${maxSelection} colores`);
        return;
    }

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

    // Mostrar intento del jugador y las pistas visuales
    const attemptDiv = document.createElement('div');
    attemptDiv.classList.add('attempt');
    
    currentAttempt.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = color;
        colorDiv.classList.add('color-circle');
        attemptDiv.appendChild(colorDiv);
    });

    // Crear una sección para las pistas
    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('feedback');
    
    // Añadir pistas según los resultados
    for (let i = 0; i < correctPosition; i++) {
        const circle = document.createElement('div');
        circle.classList.add('feedback-circle');
        circle.style.backgroundColor = 'black'; // Color y posición correcta
        feedbackDiv.appendChild(circle);
    }
    for (let i = 0; i < correctColor; i++) {
        const circle = document.createElement('div');
        circle.classList.add('feedback-circle');
        circle.style.backgroundColor = 'red'; // Solo color correcto
        feedbackDiv.appendChild(circle);
    }
    
    // Rellenar con pistas incorrectas
    const incorrectPicks = maxSelection - correctPosition - correctColor;
    for (let i = 0; i < incorrectPicks; i++) {
        const circle = document.createElement('div');
        circle.classList.add('feedback-circle');
        circle.style.backgroundColor = 'gray'; // Ni color ni posición correctos
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
    updateCurrentAttemptDisplay();
}

// Añadir color a la selección del usuario
function addColorToAttempt(color) {
    if (currentAttempt.length < maxSelection) {
        currentAttempt.push(color);
        updateCurrentAttemptDisplay();
    } else {
        alert(`Solo puedes seleccionar ${maxSelection} colores.`);
    }
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
    updateCurrentAttemptDisplay();
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

// Agregar eventos a los botones de selección de colores
document.querySelectorAll('.color').forEach(button => {
    button.addEventListener('click', () => addColorToAttempt(button.getAttribute('data-color')));
});

// Generar código secreto y temporizador al cargar la página
generateSecretCode();
startTimer();
