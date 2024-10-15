
let orientacion = 'horizontal'; // Inicialmente horizontal
let barcosColocados = [];
let barcosDisponibles = ['portaaviones', 'buque', 'submarino', 'destructor', 'patrullero'];
let fase = 'colocacion'; // Fase actual

// Crear tableros
function crearTablero(tableroID) {
    const tablero = document.getElementById(tableroID);
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const celda = document.createElement('button');
            celda.dataset.fila = i;
            celda.dataset.columna = j;
            celda.addEventListener('click', manejarCelda);
            tablero.appendChild(celda);
        }
    }
}

// Manejar los clics en los tableros
function manejarCelda(event) {
    const fila = event.target.dataset.fila;
    const columna = event.target.dataset.columna;

    if (fase === 'colocacion') {
        // Colocar los barcos en el Tablero 1
        alert(`Colocando barco en fila ${fila}, columna ${columna}`);
        // Implementar la lógica de colocación de barcos aquí
    } else if (fase === 'juego') {
        if (event.currentTarget.id === 'tablero-barcos') {
            // Marcar los disparos recibidos del oponente en Tablero 1
            alert(`Disparo recibido en fila ${fila}, columna ${columna}`);
            // Implementar lógica de disparos recibidos
        } else if (event.currentTarget.id === 'tablero-disparos') {
            // Registrar los disparos hechos al oponente en Tablero 2
            alert(`Disparo realizado en fila ${fila}, columna ${columna}`);
            // Implementar lógica de disparos al oponente
        }
    }
}

// Cambiar orientación de los barcos
document.getElementById('cambiar-orientacion').addEventListener('click', () => {
    orientacion = orientacion === 'horizontal' ? 'vertical' : 'horizontal';
    alert(`Nueva orientación: ${orientacion}`);
});

// Cambiar a la fase de juego
document.getElementById('listo').addEventListener('click', () => {
    fase = 'juego';
    document.getElementById('barcos-disponibles').style.display = 'none'; // Ocultar los barcos
    document.getElementById('fase-titulo').textContent = 'Marcar disparos recibidos y realizar disparos al oponente';
});

// Iniciar el juego
crearTablero('tablero-barcos'); // Tablero 1
crearTablero('tablero-disparos'); // Tablero 2
