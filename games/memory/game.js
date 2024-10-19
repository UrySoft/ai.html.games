
let tablero = [];
let primeraSeleccion = null;
let segundaSeleccion = null;
let turnos = 0;
let tiempo = 0;
let parejasEncontradas = 0;
let tiempoInterval;

// Imágenes para el juego (15 parejas)
const imagenes = [
    'img1.png', 'img2.png', 'img3.png', 'img4.png', 'img5.png',
    'img6.png', 'img7.png', 'img8.png', 'img9.png', 'img10.png',
    'img11.png', 'img12.png', 'img13.png', 'img14.png', 'img15.png'
];

// Duplicar las imágenes y mezclar
function generarTablero() {
    let imagenesDoble = imagenes.concat(imagenes); // Duplicamos las imágenes
    imagenesDoble.sort(() => Math.random() - 0.5); // Mezclamos las imágenes
    tablero = imagenesDoble;
    actualizarTablero();
}

// Actualizar el tablero en la interfaz
function actualizarTablero() {
    const tableroDiv = document.getElementById('tablero');
    tableroDiv.innerHTML = ''; // Limpiar el tablero
    tablero.forEach((imagen, index) => {
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
        mostrarImagen(index);
    } else if (segundaSeleccion === null && index !== primeraSeleccion) {
        segundaSeleccion = index;
        mostrarImagen(index);
        verificarPareja();
    }
}

// Mostrar la imagen de la carta seleccionada
function mostrarImagen(index) {
    const carta = document.querySelector(`.carta[data-index="${index}"]`);
    carta.style.backgroundImage = `url('${tablero[index]}')`;
}

// Verificar si las cartas seleccionadas son pareja
function verificarPareja() {
    if (tablero[primeraSeleccion] === tablero[segundaSeleccion]) {
        parejasEncontradas++;
        resetSeleccion();
        if (parejasEncontradas === imagenes.length) {
            clearInterval(tiempoInterval);
            alert('¡Ganaste!');
        }
    } else {
        setTimeout(() => {
            ocultarImagen(primeraSeleccion);
            ocultarImagen(segundaSeleccion);
            resetSeleccion();
        }, 1000);
    }
    turnos++;
    document.getElementById('turns').textContent = turnos;
}

// Ocultar la imagen de la carta
function ocultarImagen(index) {
    const carta = document.querySelector(`.carta[data-index="${index}"]`);
    carta.style.backgroundImage = 'none';
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
