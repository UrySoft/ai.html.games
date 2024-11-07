// modules/Utils.js
export const Utils = {
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight - 40, // Restar espacio para el botón de mejoras
    baseShip: null,
    missileSpeedMultiplier: 1.00,
    turretRange: 100,
    turretDamage: 1,
    turretFireRate: 1000, // ms
    missileDamage: 1,

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

    calculateDistance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    calculateAngle: (x1, y1, x2, y2) => {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    checkCollision: (obj, bullet) => {
        return (
            bullet.x > obj.x - obj.width / 2 &&
            bullet.x < obj.x + obj.width / 2 &&
            bullet.y > obj.y - obj.height / 2 &&
            bullet.y < obj.y + obj.height / 2
        );
    },

    createParticle: (x, y, angle, type) => {
        const speed = Math.random() * 1 + 0.5;
        const particleAngle = angle + (Math.random() * 0.4 - 0.2); // Variación aleatoria
        const lifeSpan = 50; // Aumentar la vida para alargar la estela
        particles.push(new Particle(x, y, -Math.cos(particleAngle) * speed, -Math.sin(particleAngle) * speed, Math.random() * 2 + 1, lifeSpan, 1, type));
    },

    createExplosion: (x, y, isPlayerExplosion) => {
        const sizeMultiplier = isPlayerExplosion ? 1 : 1; // Ajustar si es necesario
        const explosion = new Explosion(x, y, 20 * sizeMultiplier, Utils);
        explosions.push(explosion);
    },

    removeEnemyShip: (ship) => {
        const index = enemyShips.indexOf(ship);
        if (index > -1) enemyShips.splice(index, 1);
    },

    removeEnemyMissile: (missile) => {
        const index = enemyMissiles.indexOf(missile);
        if (index > -1) enemyMissiles.splice(index, 1);
    },

    removeEnemyHangar: (hangar) => {
        const index = enemyHangars.indexOf(hangar);
        if (index > -1) enemyHangars.splice(index, 1);
    },

    removeEnemyFighter: (fighter) => {
        const index = enemyFighters.indexOf(fighter);
        if (index > -1) enemyFighters.splice(index, 1);
    },

    removePlayerMissile: (missile) => {
        const index = playerMissiles.indexOf(missile);
        if (index > -1) playerMissiles.splice(index, 1);
    },

    removeEnergyBullet: (bullet) => {
        const index = energyBullets.indexOf(bullet);
        if (index > -1) energyBullets.splice(index, 1);
    },

    removeExplosion: (explosion) => {
        const index = explosions.indexOf(explosion);
        if (index > -1) explosions.splice(index, 1);
    },

    removeTarget: (target) => {
        if (target instanceof EnemyShip) {
            this.removeEnemyShip(target);
        } else if (target instanceof EnemyHangar) {
            this.removeEnemyHangar(target);
        } else if (target instanceof EnemyFighter) {
            this.removeEnemyFighter(target);
        } else if (target instanceof EnemyMissile) {
            this.removeEnemyMissile(target);
        }
    },

    destroyCityAt: (x, y) => {
        cities.forEach(city => {
            if (!city.destroyed && Utils.checkCollision(city, { x: x, y: y, width: 1, height: 1 })) {
                city.destroyed = true;
            }
        });
    },

    incrementScore: (amount) => {
        score += amount;
        document.getElementById('score').innerText = score;
    },

    incrementCoins: (amount) => {
        coinsToSpend += amount;
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    },

    currentTime: () => {
        return Date.now();
    },

    isGameOver: (cities, baseShip) => {
        return (cities.every(city => city.destroyed)) || (baseShip.destroyed || !baseShip);
    },

    endGame: (score) => {
        alert(`¡Fin del juego! Puntos: ${score}`);
    },

    isWaveCompleted: (enemyShips, enemyHangars, enemyFighters, enemyMissiles, explosions) => {
        return (enemyShips.length === 0 && enemyHangars.length === 0 && enemyFighters.length === 0 && enemyMissiles.length === 0 && explosions.length === 0);
    },

    updateUpgradeMenu: () => {
        // Implementar lógica para actualizar el menú de mejoras
    }
};
