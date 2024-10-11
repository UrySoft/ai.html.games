// Definir los nombres de los subdirectorios de juegos manualmente por ahora
const games = ["juego1", "juego2", "juego3"]; // Cambia estos nombres por los nombres de tus juegos

// Obtener el contenedor de la lista de juegos
const gameListContainer = document.querySelector('.game-list');

// Crear botones para cada juego
games.forEach(game => {
    const button = document.createElement('button');
    button.textContent = game;
    button.addEventListener('click', () => {
        // Navegar al índice del juego correspondiente al pulsar el botón
        window.location.href = `games/${game}/index.html`;
    });
    gameListContainer.appendChild(button);
});
