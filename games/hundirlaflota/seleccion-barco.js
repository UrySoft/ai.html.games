
document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar barco y cambiar orientación al hacer clic
    document.querySelectorAll('.barco-grid').forEach(barco => {
        barco.addEventListener('click', () => {
            if (barco.classList.contains('desactivado')) return;
            if (barco.classList.contains('barco-seleccionado')) {
                // Cambiar orientación si el barco ya está seleccionado
                barco.dataset.orientacion = barco.dataset.orientacion === 'horizontal' ? 'vertical' : 'horizontal';
                actualizarBarcoVisual(barco);
            } else {
                // Quitar selección de otros barcos y seleccionar este
                document.querySelectorAll('.barco-grid').forEach(b => b.classList.remove('barco-seleccionado'));
                barco.classList.add('barco-seleccionado');
            }
        });
    });
});

// Actualizar la visualización del barco seleccionado según la orientación
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
