
const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Crear el tablero de 10x10 con coordenadas
function crearTablero(tableroID) {
    const tablero = document.getElementById(tableroID);
    
    // Añadir coordenadas horizontales (A-J)
    for (let i = 0; i <= 10; i++) {
        for (let j = 0; j <= 10; j++) {
            const celda = document.createElement('button');
            if (i === 0 && j === 0) {
                celda.classList.add('coord');
            } else if (i === 0) {
                celda.textContent = letras[j - 1];
                celda.classList.add('coord');
            } else if (j === 0) {
                celda.textContent = i;
                celda.classList.add('coord');
            } else {
                celda.dataset.fila = i - 1;
                celda.dataset.columna = j - 1;
                celda.addEventListener('click', colocarBarco);
            }
            tablero.appendChild(celda);
        }
    }
}

// Crear tableros al cargar la página
crearTablero('mis-barcos');
crearTablero('sus-barcos');
