// js/modules/EnemyShip.js
import { EnemyMissile } from './EnemyMissile.js';
import { Explosion } from './Explosion.js';

export class EnemyShip {
    constructor(x, y, canvasWidth, canvasHeight, Utils) {
        this.x = x;
        this.y = y;
        this.width = canvasWidth * 0.03;
        this.height = canvasHeight * 0.02;
        this.speed = canvasWidth * 0.0015;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.missilesLeft = 2;
        this.destroyed = false;
        this.health = 3;
        this.maxHealth = 3;
        this.lastShotTime = Utils.currentTime() - Math.random() * 3000;
        this.retreatStartTime = null;
    }

    update(deltaTime, enemyMissiles, cities, explosions, Utils) {
        this.x += this.speed * this.direction;
        if (this.x < 0 || this.x > Utils.canvasWidth) {
            this.direction *= -1;
            this.y += Utils.canvasHeight * 0.02;
        }

        // Lanzar misiles
        if (this.missilesLeft > 0 && Utils.currentTime() - this.lastShotTime >= 5000) {
            this.lastShotTime = Utils.currentTime();
            let targetOptions = cities.filter(city => !city.destroyed);
            if (targetOptions.length === 0 && Utils.baseShip && !Utils.baseShip.destroyed) {
                targetOptions = [Utils.baseShip];
            } else if (targetOptions.length === 0) {
                targetOptions = [{ x: Utils.canvasWidth / 2, y: Utils.canvasHeight }];
            }
            const target = targetOptions[Math.floor(Math.random() * targetOptions.length)];

            enemyMissiles.push(new EnemyMissile(this.x, this.y + this.height / 2, target.x, target.y, Utils));
            this.missilesLeft--;
            this.y += Utils.canvasHeight * 0.02;
        }

        // Retreat logic
        if (this.missilesLeft <= 0) {
            if (!this.retreatStartTime) {
                this.retreatStartTime = Utils.currentTime();
            } else if (Utils.currentTime() - this.retreatStartTime >= 15000) {
                this.y -= Utils.canvasHeight * 0.005;
                if (this.y + this.height < 0) {
                    this.destroyed = true;
                }
            }
        }

        // Actualizar salud y estado
        if (this.health <= 0) {
            this.destroyed = true;
            Utils.createExplosion(this.x, this.y, false, explosions);
            Utils.incrementScore(15, document.getElementById('score'));
            Utils.incrementCoins(10, document.getElementById('availableCoins'));
        }
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            // Dibujar barra de vida
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(this.x - this.width / 2, this.y + this.height / 2 + 5, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 5, this.width * (this.health / this.maxHealth), 5);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    static spawnWave(wave, canvas, enemyShips, enemyMissiles, cities, Utils) {
        const MAX_ENEMY_SHIPS = 5; // Máximo de naves enemigas por oleada
        const enemyShipsPerWave = Math.min(Math.floor(wave / 2) + 1, MAX_ENEMY_SHIPS);
        for (let i = 0; i < enemyShipsPerWave; i++) {
            const ship = new EnemyShip(Math.random() * canvas.width, canvas.height * 0.1, canvas.width, canvas.height, Utils);
            enemyShips.push(ship);
        }
    }
}
