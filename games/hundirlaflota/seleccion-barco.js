
let orientacion = 'horizontal'; // Inicialmente horizontal
let barcoSeleccionado = null;
let tamañoBarco = 0;

// Actualizar visualización de los barcos con cambio de orientación
function actualizarSeleccionVisual() {
    const barcos = [
        { id: 'portaaviones', tamaño: 5 },
        { id: 'buque', tamaño: 4 },
        { id: 'submarino', tamaño: 3 },
        { id: 'destructor', tamaño: 3 },
        { id: 'patrullero', tamaño: 2 },
        { id: 'lancha', tamaño: 1 }
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

// Iniciar la visualización inicial de los barcos
actualizarSeleccionVisual();
