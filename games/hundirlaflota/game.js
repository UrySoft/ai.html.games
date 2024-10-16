
let orientacion = 'horizontal'; // Inicialmente horizontal
let barcoSeleccionado = null;
let tamañoBarco = 0;
const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Actualizar visualización de los barcos con cambio de orientación
function actualizarSeleccionVisual() {
    const barcos = [
        { id: 'portaaviones', tamaño: 5 },
        { id: 'buque', tamaño: 4 },
        { id: 'submarino', tamaño: 3 },
        { id: 'destructor', tamaño: 3 },
        { id: 'patrullero', tamaño: 2 }
    ];

    barcos.forEach(barco => {
        const squaresContainer = document.getElementById(`${barco.id}-squares`);
        squaresContainer.innerHTML = '';  // Limpiar el contenido antes de actualizar

        for (let i = 0; i < barco.tamaño; i++) {
            const square = document.createElement('div');
            square.classList.add('barco-square');
            if (orientacion === 'horizontal') {
                square.style.display = 'inline-block';
            } else {
                square.style.display = 'block';
            }
            squaresContainer.appendChild(square);
        }
    });
}

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
        // Eliminar selección anterior
        document.querySelectorAll('.barco').forEach(btn => btn.classList.remove('barco-seleccionado'));
        
        // Cambiar color del barco seleccionado
        barco.classList.add('barco-seleccionado');
        barcoSeleccionado = event.currentTarget.id;
        tamañoBarco = parseInt(event.currentTarget.dataset.tamaño);
    });
});

// Cambiar la orientación del barco y actualizar el indicador de orientación y la visualización de los barcos.
document.getElementById('orientacion-btn').addEventListener('click', () => {
    orientacion = orientacion === 'horizontal' ? 'vertical' : 'horizontal';
    actualizarSeleccionVisual();  // Actualizar la visualización de la selección
});

// Crear tableros al cargar la página
crearTablero('mis-barcos');
crearTablero('sus-barcos');

// Iniciar la visualización inicial de los barcos
actualizarSeleccionVisual();
