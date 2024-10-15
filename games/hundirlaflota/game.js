
let orientacion = 'horizontal'; // Inicialmente horizontal
let barcoSeleccionado = null;
let tamañoBarco = 0;
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

// Selección del barco
document.querySelectorAll('.barco').forEach(barco => {
    barco.addEventListener('click', (event) => {
        barcoSeleccionado = event.target.id;
        tamañoBarco = parseInt(event.target.dataset.tamaño);
        alert(`Has seleccionado ${barcoSeleccionado} con tamaño ${tamañoBarco}`);
    });
});

// Cambiar la orientación del barco
document.getElementById('cambiar-orientacion').addEventListener('click', () => {
    orientacion = orientacion === 'horizontal' ? 'vertical' : 'horizontal';
    alert(`Nueva orientación: ${orientacion}`);
});

// Colocar barco en el tablero
function colocarBarco(event) {
    if (barcoSeleccionado === null) {
        alert('Selecciona un barco primero.');
        return;
    }

    const fila = parseInt(event.target.dataset.fila);
    const columna = parseInt(event.target.dataset.columna);

    if (orientacion === 'horizontal') {
        if (columna + tamañoBarco > 10) {
            alert('El barco no cabe horizontalmente en esta posición.');
            return;
        }
        for (let i = 0; i < tamañoBarco; i++) {
            document.querySelector(`[data-fila='${fila}'][data-columna='${columna + i}']`).style.backgroundColor = '#f4b400';
        }
    } else {
        if (fila + tamañoBarco > 10) {
            alert('El barco no cabe verticalmente en esta posición.');
            return;
        }
        for (let i = 0; i < tamañoBarco; i++) {
            document.querySelector(`[data-fila='${fila + i}'][data-columna='${columna}']`).style.backgroundColor = '#f4b400';
        }
    }

    barcoSeleccionado = null; // Resetea la selección del barco después de colocarlo
}

// Crear tableros al cargar la página
crearTablero('mis-barcos');
crearTablero('sus-barcos');
