
let tablero = [];
let primeraSeleccion = null;
let segundaSeleccion = null;
let turnos = 0;
let tiempo = 0;
let parejasEncontradas = 0;
let tiempoInterval;

// Numeros para el juego (15 parejas de números)
const numeros = Array.from({ length: 15 }, (_, i) => i + 1);

// Duplicar los números y mezclar
function generarTablero() {
    let numerosDoble = numeros.concat(numeros); // Duplicamos los números
    numerosDoble.sort(() => Math.random() - 0.5); // Mezclamos los números
    tablero = numerosDoble;
    actualizarTablero();
}

// Actualizar el tablero en la interfaz
function actualizarTablero() {
    const tableroDiv = document.getElementById('tablero');
    tableroDiv.innerHTML = ''; // Limpiar el tablero
    tablero.forEach((numero, index) => {
        const carta = document.createElement('div');
        carta.classList.add('carta');
        carta.dataset.index = index;
        carta.addEventListener('click', seleccionarCarta);
        tableroDiv.appendChild(carta);
    });
}

// Seleccionar una carta
function seleccionarCarta(event) {
    const index = event.target.dataset.index;
    if (primeraSeleccion === null) {
        primeraSeleccion = index;
        mostrarNumero(index);
    } else if (segundaSeleccion === null && index !== primeraSeleccion) {
        segundaSeleccion = index;
        mostrarNumero(index);
        verificarPareja();
    }
}

// Mostrar el número de la carta seleccionada
function mostrarNumero(index) {
    const carta = document.querySelector(`.carta[data-index="${index}"]`);
    carta.textContent = tablero[index];
}

// Verificar si las cartas seleccionadas son pareja
function verificarPareja() {
    if (tablero[primeraSeleccion] === tablero[segundaSeleccion]) {
        parejasEncontradas++;
        resetSeleccion();
        if (parejasEncontradas === numeros.length) {
            clearInterval(tiempoInterval);
            alert('¡Ganaste!');
        }
    } else {
        setTimeout(() => {
            ocultarNumero(primeraSeleccion);
            ocultarNumero(segundaSeleccion);
            resetSeleccion();
        }, 1000);
    }
    turnos++;
    document.getElementById('turns').textContent = turnos;
}

// Ocultar el número de la carta
function ocultarNumero(index) {
    const carta = document.querySelector(`.carta[data-index="${index}"]`);
    carta.textContent = '';
}

// Resetear la selección de cartas
function resetSeleccion() {
    primeraSeleccion = null;
    segundaSeleccion = null;
}

// Reiniciar el juego
document.getElementById('restart').addEventListener('click', reiniciarJuego);

function reiniciarJuego() {
    parejasEncontradas = 0;
    turnos = 0;
    tiempo = 0;
    document.getElementById('turns').textContent = turnos;
    document.getElementById('time').textContent = tiempo;
    clearInterval(tiempoInterval);
    iniciarTemporizador();
    generarTablero();
}

// Iniciar el temporizador
function iniciarTemporizador() {
    tiempoInterval = setInterval(() => {
        tiempo++;
        document.getElementById('time').textContent = tiempo;
    }, 1000);
}

// Inicializar el juego al cargar
document.addEventListener('DOMContentLoaded', () => {
    generarTablero();
    iniciarTemporizador();
});
