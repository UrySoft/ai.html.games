
let tablero = [];
let barcosColocados = {};

// Inicialización del tablero como un array 10x10 lleno de ceros
function inicializarTablero() {
    tablero = Array.from({ length: 10 }, () => Array(10).fill(0));
    actualizarTablero();
}

// Actualizar visualmente el tablero con las celdas
function actualizarTablero() {
    const misBarcosContainer = document.getElementById('mis-barcos');
    misBarcosContainer.innerHTML = '';
    for (let fila = 0; fila < 10; fila++) {
        for (let col = 0; col < 10; col++) {
            const celda = document.createElement('button');
            celda.classList.add('boton-grid');
            celda.dataset.fila = fila;
            celda.dataset.col = col;
            // Colocar la fila con letras (A-J) y las columnas con números (1-10)
            celda.textContent = String.fromCharCode(65 + fila) + (col + 1);
            if (tablero[fila][col] === 1) {
                celda.classList.add('barco-colocado');
            }
            celda.addEventListener('click', () => colocarBarco(fila, col));
            misBarcosContainer.appendChild(celda);
        }
    }
}

// Colocar barco en el tablero si es posible
function colocarBarco(fila, col) {
    const barcoSeleccionado = document.querySelector('.barco-seleccionado');
    if (!barcoSeleccionado) {
        alert('Primero selecciona un barco.');
        return;
    }

    const tamano = parseInt(barcoSeleccionado.dataset.tamaño);
    const orientacion = barcoSeleccionado.dataset.orientacion || 'horizontal';
    
    if (!esPosicionValida(fila, col, tamano, orientacion)) {
        alert('Posición inválida para el barco.');
        return;
    }

    // Marcar las posiciones del barco en el tablero
    for (let i = 0; i < tamano; i++) {
        if (orientacion === 'horizontal') {
            tablero[fila][col + i] = 1;
        } else {
            tablero[fila + i][col] = 1;
        }
    }

    // Añadir barco a la lista de colocados
    barcosColocados[barcoSeleccionado.id] = { fila, col, tamano, orientacion };
    barcoSeleccionado.classList.add('desactivado');
    barcoSeleccionado.classList.remove('barco-seleccionado');
    actualizarTablero();
}

// Verificar si la posición del barco es válida
function esPosicionValida(fila, col, tamano, orientacion) {
    if (orientacion === 'horizontal') {
        if (col + tamano > 10) return false;
        for (let i = 0; i < tamano; i++) {
            if (tablero[fila][col + i] === 1) return false;
        }
    } else {
        if (fila + tamano > 10) return false;
        for (let i = 0; i < tamano; i++) {
            if (tablero[fila + i][col] === 1) return false;
        }
    }
    return true;
}

// Inicializar tablero al cargar el juego
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablero();
    
    // Seleccionar barco y cambiar orientación
    document.querySelectorAll('.barco-grid').forEach(barco => {
        barco.addEventListener('click', () => {
            if (barco.classList.contains('desactivado')) return;
            if (barco.classList.contains('barco-seleccionado')) {
                // Cambiar orientación
                barco.dataset.orientacion = barco.dataset.orientacion === 'horizontal' ? 'vertical' : 'horizontal';
                actualizarBarcoVisual(barco);
            } else {
                document.querySelectorAll('.barco-grid').forEach(b => b.classList.remove('barco-seleccionado'));
                barco.classList.add('barco-seleccionado');
            }
        });
    });
});

function actualizarBarcoVisual(barco) {
    const casillas = barco.querySelector('.barco-squares');
    const tamano = parseInt(barco.dataset.tamaño);
    const orientacion = barco.dataset.orientacion;
    casillas.innerHTML = '';
    for (let i = 0; i < tamano; i++) {
        const casilla = document.createElement('div');
        casilla.classList.add('casilla');
        casillas.appendChild(casilla);
    }
    casillas.style.flexDirection = orientacion === 'horizontal' ? 'row' : 'column';
}
