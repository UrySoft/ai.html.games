// js/modules/Utils.js

export const Utils = {
    // Inicializar variables de mejora
    costMissileLimit: 100, // Costo inicial para aumentar el límite de misiles
    costMissileSpeed: 150, // Costo inicial para mejorar la velocidad de los misiles
    costExplosionSize: 200, // Costo inicial para aumentar el tamaño de las explosiones
    costMissileDamage: 100, // Costo inicial para aumentar el daño de los misiles
    costUpgradeBaseShipHealth: 300, // Costo para aumentar la salud de la nave base
    costTurret: 250, // Costo para comprar una nueva ametralladora
    costTurretRange: 200, // Costo para mejorar el alcance de las ametralladoras
    costTurretDamage: 180, // Costo para mejorar el daño de las ametralladoras
    costShieldCapacity: 300, // Costo para aumentar la capacidad del escudo
    costShieldRegen: 250, // Costo para mejorar la regeneración del escudo

    // Variables de mejora
    missileSpeedMultiplier: 1.00, // Multiplicador de velocidad de misiles
    turretRange: 100, // Alcance de las ametralladoras en píxeles
    turretDamage: 1, // Daño de las ametralladoras
    turretFireRate: 1000, // Tiempo de recarga de las ametralladoras en ms
    missileDamage: 1, // Daño de los misiles
    explosionSizeMultiplier: 1, // Multiplicador de tamaño de explosiones

    // Función para calcular la distancia entre dos puntos
    calculateDistance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Función para calcular el ángulo entre dos puntos
    calculateAngle: (x1, y1, x2, y2) => {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    // Función para obtener el tiempo actual en milisegundos
    currentTime: () => {
        return Date.now();
    },

    // Función para obtener la posición del puntero (mouse o touch)
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

    // Función para generar ciudades en posiciones aleatorias
    generateCities: (canvas, number) => {
        const cities = [];
        for (let i = 0; i < number; i++) {
            const cityWidth = (canvas.width * 0.02) + Math.random() * (canvas.width * 0.05);
            const cityHeight = (canvas.height * 0.05) + Math.random() * (canvas.height * 0.15);
            const xPosition = Math.random() * (canvas.width - cityWidth);
            const yPosition = canvas.height - cityHeight; // Posicionar en la parte inferior
            cities.push(new City(xPosition, yPosition, cityWidth, cityHeight));
        }
        return cities;
    },

    // Función para crear partículas (estela)
    createParticle: (x, y, angle, type, particles) => {
        const speed = Math.random() * 1 + 0.5;
        const particleAngle = angle + (Math.random() * 0.4 - 0.2); // Variación aleatoria
        const lifeSpan = 50; // Vida de la partícula
        particles.push(new Particle(x, y, -Math.cos(particleAngle) * speed, -Math.sin(particleAngle) * speed, Math.random() * 2 + 1, lifeSpan, 1, type));
    },

    // Función para limpiar entidades destruidas de los arrays
    cleanUpEntities: (arrays) => {
        arrays.forEach(array => {
            for (let i = array.length - 1; i >= 0; i--) {
                if (array[i].destroyed) {
                    array.splice(i, 1);
                }
            }
        });
    },

    // Función para verificar colisión entre un objeto y un misil/proyectil
    checkCollision: (obj, bullet) => {
        return (
            bullet.x > obj.x - obj.width / 2 &&
            bullet.x < obj.x + obj.width / 2 &&
            bullet.y > obj.y - obj.height / 2 &&
            bullet.y < obj.y + obj.height / 2
        );
    },

    // Función para crear una explosión
    createExplosion: (x, y, isPlayerExplosion, explosions) => {
        const sizeMultiplier = isPlayerExplosion ? 1.5 : 1;
        const size = 20 * sizeMultiplier;
        explosions.push(new Explosion(x, y, size));
    },

    // Función para destruir una ciudad en una posición específica
    destroyCityAt: (x, y, cities) => {
        cities.forEach(city => {
            if (!city.destroyed && Utils.checkCollision(city, { x: x, y: y, width: 1, height: 1 })) {
                city.destroyed = true;
            }
        });
    },

    // Función para incrementar la puntuación
    incrementScore: (amount, scoreElement) => {
        score += amount;
        if (scoreElement) {
            scoreElement.innerText = score;
        }
    },

    // Función para incrementar las monedas
    incrementCoins: (amount, coinsElement) => {
        coinsToSpend += amount;
        if (coinsElement) {
            coinsElement.innerText = Math.floor(coinsToSpend);
        }
    },

    // Función para finalizar el juego
    endGame: (score) => {
        alert(`¡Fin del juego! Puntos: ${score}`);
    },

    // Función para verificar si el juego ha terminado
    isGameOver: (cities, baseShip) => {
        return (cities.every(city => city.destroyed)) || (baseShip.destroyed || !baseShip);
    },

    // Función para verificar si la oleada ha sido completada
    isWaveCompleted: (enemyShips, enemyHangars, enemyFighters, enemyMissiles, explosions) => {
        return (enemyShips.length === 0 && enemyHangars.length === 0 && enemyFighters.length === 0 && enemyMissiles.length === 0 && explosions.length === 0);
    }
};

// Clase City para representar las ciudades
class City {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destroyed = false;
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = `rgb(0, ${50 + Math.floor(Math.random() * 205)}, 255)`; // Azul con variación
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
