// Solo un juego disponible por ahora: Tres en Ratlla
const gameName = "Tres en Ratlla";
const gameDirectory = "tresenralla";

// Obtener el contenedor de la lista de juegos
const gameListContainer = document.querySelector('.game-list');

// Crear el botón para el juego Tres en Ratlla
const button = document.createElement('button');
button.textContent = gameName;
button.addEventListener('click', () => {
    // Navegar al índice del juego correspondiente al pulsar el botón
    window.location.href = `games/${gameDirectory}/index.html`;
});
gameListContainer.appendChild(button);
