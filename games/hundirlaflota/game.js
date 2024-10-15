
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

// Cambiar la orientación del barco y actualizar el indicador de orientación
document.getElementById('cambiar-orientacion').addEventListener('click', () => {
    orientacion = orientacion === 'horizontal' ? 'vertical' : 'horizontal';
    document.getElementById('orientacion-indicador').textContent = `Orientación: ${orientacion.charAt(0).toUpperCase() + orientacion.slice(1)}`;
});

// Verificar si el barco cabe en la posición seleccionada y si está rodeado por agua
function verificarColocacion(fila, columna) {
    for (let i = -1; i <= tamañoBarco; i++) {
        for (let j = -1; j <= 1; j++) {
            let checkFila = orientacion === 'horizontal' ? fila + j : fila + i;
            let checkColumna = orientacion === 'horizontal' ? columna + i : columna + j;
            if (checkFila >= 0 && checkFila < 10 && checkColumna >= 0 && checkColumna < 10) {
                const celda = document.querySelector(`[data-fila='${checkFila}'][data-columna='${checkColumna}']`);
                if (celda && celda.style.backgroundColor === '#f4b400') {
                    return false;  // Hay otro barco cerca o en la posición
                }
            }
        }
    }
    return true;  // Está rodeado por agua
}

// Colocar barco en el tablero
function colocarBarco(event) {
    if (barcoSeleccionado === null) {
        alert('Selecciona un barco primero.');
        return;
    }

    const fila = parseInt(event.target.dataset.fila);
    const columna = parseInt(event.target.dataset.columna);

    // Verificar si el barco cabe en la posición seleccionada y está rodeado por agua
    if ((orientacion === 'horizontal' && columna + tamañoBarco <= 10) ||
        (orientacion === 'vertical' && fila + tamañoBarco <= 10)) {
        
        if (!verificarColocacion(fila, columna)) {
            alert('No puedes colocar el barco aquí. Debe estar rodeado por agua y no tocar otros barcos.');
            return;
        }

        // Colocar el barco en el tablero
        for (let i = 0; i < tamañoBarco; i++) {
            if (orientacion === 'horizontal') {
                document.querySelector(`[data-fila='${fila}'][data-columna='${columna + i}']`).style.backgroundColor = '#f4b400';
            } else {
                document.querySelector(`[data-fila='${fila + i}'][data-columna='${columna}']`).style.backgroundColor = '#f4b400';
            }
        }
    } else {
        alert('El barco no cabe en esta posición.');
    }

    barcoSeleccionado = null; // Resetea la selección del barco después de colocarlo
}

// Crear tableros al cargar la página
crearTablero('mis-barcos');
crearTablero('sus-barcos');
