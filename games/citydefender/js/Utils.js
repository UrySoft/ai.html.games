// modules/Utils.js
export const Utils = {
    getDeltaTime: () => {
        // Implementar la lógica para calcular el deltaTime si es necesario
        // Por simplicidad, asumiremos un deltaTime fijo
        return 1 / 60;
    },

    getPointerPosition: (event, canvas) => {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (event.touches && event.touches.length > 0) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        return { x: x, y: y };
    },

    generateCities: (canvas, number) => {
        const cities = [];
        for (let i = 0; i < number; i++) {
            const cityWidth = (canvas.width * 0.02) + Math.random() * (canvas.width * 0.05);
            const cityHeight = (canvas.height * 0.05) + Math.random() * (canvas.height * 0.15);
            const xPosition = Math.random() * (canvas.width - cityWidth);
            const yPosition = canvas.height - cityHeight; // Mover la ciudad más abajo
            cities.push({
                x: xPosition,
                y: yPosition,
                width: cityWidth,
                height: cityHeight,
                destroyed: false,
                color: `rgb(0, ${50 + Math.floor(Math.random() * 205)}, 255)`,
                draw: function(ctx) {
                    if (!this.destroyed) {
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                }
            });
        }
        return cities;
    },

    cleanUpEntities: (enemyShips, enemyMissiles, enemyHangars, enemyFighters, playerMissiles, energyBullets, explosions, particles) => {
        // Eliminar objetos destruidos o fuera de pantalla
        // Implementar según las necesidades específicas de cada array
    },

    isGameOver: (cities, baseShip) => {
        return (cities.every(city => city.destroyed)) || (baseShip.destroyed || !baseShip);
    },

    endGame: (score) => {
        alert(`¡Fin del juego! Puntos: ${score}`);
    },

    isWaveCompleted: (enemyShips, enemyHangars, enemyFighters, enemyMissiles, explosions) => {
        return (enemyShips.length === 0 && enemyHangars.length === 0 && enemyFighters.length === 0 && enemyMissiles.length === 0 && explosions.length === 0);
    }
};

