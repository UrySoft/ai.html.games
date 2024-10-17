
// Variables globales
let orientacionHorizontal = true;  // Por defecto, los barcos se colocan en horizontal

// Función para cambiar la orientación del barco
function cambiarOrientacion() {
    orientacionHorizontal = !orientacionHorizontal;
    actualizarOrientacionEnBotones();
}

// Función para actualizar los botones de selección de barcos según la orientación
function actualizarOrientacionEnBotones() {
    const barcos = document.querySelectorAll('.barco-grid');

    barcos.forEach(barco => {
        const tamaño = barco.getAttribute('data-tamaño');
        const squares = barco.querySelector('.barco-squares');
        if (orientacionHorizontal) {
            squares.textContent = `${tamaño} casillas (horizontal)`;
        } else {
            squares.textContent = `${tamaño} casillas (vertical)`;
        }
    });
}

// Función para seleccionar un barco
function seleccionarBarco(event) {
    const barcos = document.querySelectorAll('.barco-grid');
    
    // Eliminar la selección previa
    barcos.forEach(barco => barco.classList.remove('barco-seleccionado'));

    // Añadir la clase de selección al barco clicado
    const barcoSeleccionado = event.currentTarget;
    barcoSeleccionado.classList.add('barco-seleccionado');
}

// Función para deshabilitar el botón después de colocar el barco
function deshabilitarBarcoSeleccionado() {
    const barcoSeleccionado = document.querySelector('.barco-seleccionado');
    if (barcoSeleccionado) {
        barcoSeleccionado.classList.add('disabled');
        barcoSeleccionado.classList.remove('barco-seleccionado');
        barcoSeleccionado.removeEventListener('click', seleccionarBarco);
    }
}

// Asignar evento a los botones de selección de barcos
document.querySelectorAll('.barco-grid').forEach(barco => {
    barco.addEventListener('click', seleccionarBarco);
});

// Asignar evento al botón de orientación
document.getElementById('orientacion-btn').addEventListener('click', cambiarOrientacion);

// Asignar evento al botón de quitar último barco
document.getElementById('quitar-barco').addEventListener('click', deshabilitarBarcoSeleccionado);

// Inicialización
actualizarOrientacionEnBotones();
