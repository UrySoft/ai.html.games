// js/modules/Missile.js

export class Missile {
    constructor(x, y, targetX, targetY, baseShip, Utils) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = Utils.canvasHeight * 0.00125 * Utils.missileSpeedMultiplier;
        this.angle = Utils.calculateAngle(x, y, targetX, targetY);
        this.destroyed = false;
    }

    update(deltaTime, enemyShips, enemyHangars, cities, explosions, particles, Utils) {
        const moveX = Math.cos(this.angle) * this.speed;
        const moveY = Math.sin(this.angle) * this.speed;
        this.x += moveX;
        this.y += moveY;

        // Verificar colisión con enemigos
        enemyShips.forEach(ship => {
            if (!ship.destroyed && Utils.checkCollision(ship, this)) {
                ship.takeDamage(Utils.missileDamage);
                Utils.createExplosion(this.x, this.y, true, explosions);
                this.destroyed = true;
                Utils.incrementScore(15, document.getElementById('score'));
                Utils.incrementCoins(10, document.getElementById('availableCoins'));
            }
        });

        enemyHangars.forEach(hangar => {
            if (!hangar.destroyed && Utils.checkCollision(hangar, this)) {
                hangar.takeDamage(Utils.missileDamage);
                Utils.createExplosion(this.x, this.y, true, explosions);
                this.destroyed = true;
                Utils.incrementScore(100, document.getElementById('score'));
                Utils.incrementCoins(50, document.getElementById('availableCoins'));
            }
        });

        cities.forEach(city => {
            if (!city.destroyed && Utils.checkCollision(city, this)) {
                city.destroyed = true;
                Utils.createExplosion(this.x, this.y, true, explosions);
                this.destroyed = true;
                Utils.incrementScore(10, document.getElementById('score'));
                Utils.incrementCoins(5, document.getElementById('availableCoins'));
            }
        });

        // Verificar si llega al destino
        const distance = Utils.calculateDistance(this.x, this.y, this.targetX, this.targetY);
        if (distance < this.speed) {
            Utils.createExplosion(this.x, this.y, true, explosions);
            this.destroyed = true;
            Utils.incrementScore(5, document.getElementById('score'));
            Utils.incrementCoins(3, document.getElementById('availableCoins'));
        }

        // Generar partículas para la estela
        Utils.createParticle(this.x, this.y, this.angle, 'player', particles);
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = '#00BFFF';
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.lineTo(6, 0);
            ctx.lineTo(0, 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
}
