// js/modules/EnemyFighter.js
import { EnergyBullet } from './EnergyBullet.js';
import { Explosion } from './Explosion.js';

export class EnemyFighter {
    constructor(x, y, canvasWidth, canvasHeight, hangar, Utils) {
        this.x = x;
        this.y = y;
        this.width = canvasWidth * 0.02;
        this.height = canvasHeight * 0.015;
        this.speed = canvasHeight * 0.001;
        this.health = 2;
        this.maxHealth = 2;
        this.lastShotTime = Utils.currentTime();
        this.shotInterval = 500; // ms
        this.hangar = hangar;
        this.destroyed = false;
        this.escaping = false;
        this.state = 'approaching'; // 'approaching', 'attacking', 'escaping'
        this.burstShotsFired = 0;
        this.burstShotsTotal = 3;
        this.isBursting = false;
    }

    update(deltaTime, playerMissiles, energyBullets, baseShip, explosions, particles, Utils) {
        if (this.escaping) {
            // Huye hacia arriba
            this.y -= this.speed;
            if (this.y + this.height < 0) {
                this.destroyed = true;
            }
            return;
        }

        // Verificar si el hangar está destruido o ha huido
        if (this.hangar.destroyed || this.hangar.hasEscaped) {
            this.escaping = true;
            return;
        }

        if (this.state === 'approaching') {
            // Moverse hacia la nave defensora
            if (baseShip && !baseShip.destroyed) {
                const dx = baseShip.x - this.x;
                const dy = baseShip.y - this.y;
                const distance = Utils.calculateDistance(this.x, this.y, baseShip.x, baseShip.y);
                if (distance > Utils.canvasWidth * 0.1) {
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;
                } else {
                    this.state = 'attacking';
                }
            } else {
                // Si no hay nave defensora, moverse hacia abajo
                this.y += this.speed;
            }
        }

        if (this.state === 'attacking') {
            // Mantenerse cerca de la nave defensora
            if (baseShip && !baseShip.destroyed) {
                this.x += (Math.random() - 0.5) * this.speed;
                this.y += (Math.random() - 0.5) * this.speed;
            }

            // Disparar proyectiles de energía en ráfagas
            if (!this.isBursting && Utils.currentTime() - this.lastShotTime >= this.shotInterval) {
                this.isBursting = true;
                this.lastShotTime = Utils.currentTime();
                this.burstShotsFired = 0;
                this.burstShotsTotal = 3;
            }

            if (this.isBursting) {
                if (this.burstShotsFired < this.burstShotsTotal && Utils.currentTime() - this.lastShotTime >= 100) {
                    this.lastShotTime = Utils.currentTime();
                    this.burstShotsFired++;
                    const angle = Utils.calculateAngle(this.x, this.y, baseShip.x, baseShip.y);
                    energyBullets.push(new EnergyBullet(this.x, this.y, angle, 'caza', Utils));
                } else if (this.burstShotsFired >= this.burstShotsTotal) {
                    this.isBursting = false;
                }
            }
        }

        // Evasión de misiles
        playerMissiles.forEach(missile => {
            const distance = Utils.calculateDistance(this.x, this.y, missile.x, missile.y);
            if (distance < Utils.canvasWidth * 0.1) {
                // Cambiar dirección para evadir
                this.x += (Math.random() - 0.5) * this.speed * 2;
                this.y += (Math.random() - 0.5) * this.speed * 2;
            }
        });

        // Actualizar salud y estado
        if (this.health <= 0) {
            this.destroyed = true;
            Utils.createExplosion(this.x, this.y, false, explosions);
            Utils.incrementScore(20, document.getElementById('score'));
            Utils.incrementCoins(15, document.getElementById('availableCoins'));
        }
    }

    draw(ctx, particles, Utils) {
        if (!this.destroyed) {
            ctx.fillStyle = 'orange';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            // Dibujar barra de vida
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(this.x - this.width / 2, this.y + this.height / 2 + 5, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 5, this.width * (this.health / this.maxHealth), 5);

            // Dibujar estela doble
            const leftEngineX = this.x - this.width / 4;
            const rightEngineX = this.x + this.width / 4;
            const engineY = this.y + this.height / 2;
            Utils.createParticle(leftEngineX, engineY, Math.PI / 2, 'enemy', particles);
            Utils.createParticle(rightEngineX, engineY, Math.PI / 2, 'enemy', particles);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
    }
}
