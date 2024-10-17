
document.addEventListener("DOMContentLoaded", () => {
    let barcoSeleccionado = null;
    let orientacionHorizontal = true;

    // Obtener todos los botones de barcos
    const botonesBarco = document.querySelectorAll(".barco-grid");
    const tableroMisBarcos = document.getElementById("mis-barcos");

    // Al hacer clic en un botón de barco, seleccionarlo y cambiar orientación si ya estaba seleccionado
    botonesBarco.forEach((boton) => {
        boton.addEventListener("click", () => {
            if (barcoSeleccionado === boton) {
                // Si ya estaba seleccionado, cambiar la orientación
                orientacionHorizontal = !orientacionHorizontal;
                actualizarCasillasBarco(boton, orientacionHorizontal);
            } else {
                // Seleccionar el barco
                barcoSeleccionado?.classList.remove("barco-seleccionado");
                barcoSeleccionado = boton;
                barcoSeleccionado.classList.add("barco-seleccionado");
            }
        });
    });

    // Pintar el barco en el tablero si es una posición válida
    tableroMisBarcos.addEventListener("click", (event) => {
        if (barcoSeleccionado) {
            const celda = event.target;
            const coordenadas = obtenerCoordenadas(celda.innerText);
            if (esPosicionValida(coordenadas, barcoSeleccionado)) {
                colocarBarco(coordenadas, barcoSeleccionado);
                barcoSeleccionado.classList.remove("barco-seleccionado");
                barcoSeleccionado.disabled = true;
                barcoSeleccionado = null;
            }
        }
    });

    // Actualizar la orientación de las casillas visuales del barco
    function actualizarCasillasBarco(boton, esHorizontal) {
        const casillas = boton.querySelectorAll(".casilla");
        casillas.forEach((casilla, index) => {
            if (esHorizontal) {
                casilla.style.display = "inline-block";
            } else {
                casilla.style.display = "block";
            }
        });
    }

    // Validar si la posición es válida para colocar el barco
    function esPosicionValida(coordenadas, barco) {
        const tamanoBarco = parseInt(barco.dataset.tamaño);
        const [columna, fila] = coordenadas;

        for (let i = 0; i < tamanoBarco; i++) {
            const nuevaColumna = orientacionHorizontal ? columna + i : columna;
            const nuevaFila = orientacionHorizontal ? fila : fila + i;

            // Comprobar si la posición está libre y no hay agua ni barcos cerca
            if (!esCeldaLibre(nuevaColumna, nuevaFila)) {
                return false;
            }
        }
        return true;
    }

    // Comprobar si una celda está libre (no tiene barco ni agua)
    function esCeldaLibre(columna, fila) {
        const celda = document.querySelector(`[data-coordenada='${columna}${fila}']`);
        return !celda.classList.contains("ocupada") && !celda.classList.contains("agua");
    }

    // Colocar el barco en el tablero
    function colocarBarco(coordenadas, barco) {
        const tamanoBarco = parseInt(barco.dataset.tamaño);
        const [columna, fila] = coordenadas;

        for (let i = 0; i < tamanoBarco; i++) {
            const nuevaColumna = orientacionHorizontal ? columna + i : columna;
            const nuevaFila = orientacionHorizontal ? fila : fila + i;

            const celda = document.querySelector(`[data-coordenada='${nuevaColumna}${nuevaFila}']`);
            celda.classList.add("ocupada");
            celda.style.backgroundColor = "orange"; // Color para indicar que hay un barco
        }

        // Marcar el área alrededor del barco como agua
        marcarAguaAlrededor(coordenadas, tamanoBarco);
    }

    // Marcar el área alrededor del barco como "agua"
    function marcarAguaAlrededor(coordenadas, tamanoBarco) {
        const [columna, fila] = coordenadas;

        for (let i = -1; i <= tamanoBarco; i++) {
            for (let j = -1; j <= 1; j++) {
                const nuevaColumna = orientacionHorizontal ? columna + i : columna + j;
                const nuevaFila = orientacionHorizontal ? fila + j : fila + i;

                if (esCoordenadaValida(nuevaColumna, nuevaFila)) {
                    const celda = document.querySelector(`[data-coordenada='${nuevaColumna}${nuevaFila}']`);
                    if (!celda.classList.contains("ocupada")) {
                        celda.classList.add("agua");
                        celda.style.backgroundColor = "lightblue"; // Color para indicar agua
                    }
                }
            }
        }
    }

    // Validar que la coordenada esté dentro del tablero
    function esCoordenadaValida(columna, fila) {
        return columna >= 0 && columna < 10 && fila >= 1 && fila <= 10;
    }

    // Obtener las coordenadas de una celda en formato [columna, fila]
    function obtenerCoordenadas(textoCelda) {
        const letra = textoCelda.charAt(0);
        const numero = parseInt(textoCelda.slice(1));
        const columna = letra.charCodeAt(0) - "A".charCodeAt(0);
        return [columna, numero];
    }
});
