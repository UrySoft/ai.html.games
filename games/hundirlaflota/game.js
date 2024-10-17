
// Función para colocar el barco en el tablero
function colocarBarcoEnTablero(fila, columna) {
    const barcoSeleccionado = document.querySelector('.barco-seleccionado');
    if (!barcoSeleccionado) {
        alert('Por favor selecciona un barco primero.');
        return;
    }

    const tamaño = parseInt(barcoSeleccionado.getAttribute('data-tamaño'));
    let puedeColocar = true;

    // Verificar si el barco cabe en la orientación seleccionada
    if (orientacionHorizontal) {
        if (columna + tamaño > 10) {
            puedeColocar = false;
        }
    } else {
        if (fila + tamaño > 10) {
            puedeColocar = false;
        }
    }

    // Colocar el barco si hay espacio
    if (puedeColocar) {
        for (let i = 0; i < tamaño; i++) {
            if (orientacionHorizontal) {
                document.getElementById(`celda-${fila}-${columna + i}`).classList.add('barco-colocado');
            } else {
                document.getElementById(`celda-${fila + i}-${columna}`).classList.add('barco-colocado');
            }
        }

        // Deshabilitar el botón del barco una vez colocado
        deshabilitarBarcoSeleccionado();
    } else {
        alert('El barco no cabe en esa posición.');
    }
}

// Asignar eventos a las celdas del tablero para poder hacer clic y colocar el barco
document.querySelectorAll('.celda-tablero').forEach(celda => {
    celda.addEventListener('click', function() {
        const fila = parseInt(this.getAttribute('data-fila'));
        const columna = parseInt(this.getAttribute('data-columna'));
        colocarBarcoEnTablero(fila, columna);
    });
});

