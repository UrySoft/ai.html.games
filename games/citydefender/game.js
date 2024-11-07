/* game.js */
// Bucle del juego
function gameLoop() {
    if (!gamePaused) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Iniciar el juego al cargar la página
window.onload = function() {
    initGame();
    gameLoop();
};
