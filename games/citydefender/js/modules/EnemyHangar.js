// js/modules/EnemyHangar.js
import { EnemyFighter } from './EnemyFighter.js';
import { EnergyBullet } from './EnergyBullet.js';
import { Explosion } from './Explosion.js';

export class EnemyHangar {
    constructor(x, y, canvasWidth, canvasHeight, Utils) {
        this.x = x;
        this.y = y;
        this.width = canvasWidth * 0.06;
        this.height = canvasHeight * 0.04;
        this.speed = canvasWidth * 0.0005;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.health = 8;
        this.maxHealth = 8;
        this.lastBurstTime = null;
        this.isBursting = false;
        this.burstShotsFired = 0;
        this.burstShotsTotal = 5;
        this.burstShotInterval = 100; // ms
        this.reloadTime = 4000; // ms
        this.cazasLaunched = 0;
        this.maxCazas = 4;
        this.lastCazaLaunchTime = Utils.currentTime();
        this.cazas = [];
        this.destroyed = false;
        this.hasEscaped = false;
    }

    update(deltaTime, enemyFighters, energyBullets, explosions, Utils) {
        this.x += this.speed * this.direction;
        if (this.x < 0 || this.x > Utils.canvasWidth) {
            this.direction *= -1;
        }

        // Disparar ráfagas de ametralladora de energía
        if (!this.isBursting && (!this.lastBurstTime || Utils.currentTime() - this.lastBurstTime >= this.reloadTime)) {
            // Verificar si hay objetivos cercanos
            const targets = [...Utils.playerMissiles];
            if (Utils.baseShip && !Utils.baseShip.destroyed) {
                targets.push(Utils.baseShip);
            }
            const inRange = targets.some(obj => Utils.calculateDistance(obj.x, obj.y, this.x, this.y) < Utils.canvasHeight * 0.3);
            if (inRange) {
                this.isBursting = true;
                this.lastBurstTime = Utils.currentTime();
                this.burstShotsFired = 0;
                this.burstShotsTotal = 3;
            }
        }

        if (this.isBursting) {
            if (this.burstShotsFired < this.burstShotsTotal && Utils.currentTime() - this.lastBurstTime >= this.burstShotInterval) {
                this.lastBurstTime = Utils.currentTime();
                this.burstShotsFired++;
                // Crear proyectiles hacia el objetivo más cercano
                const targets = [...Utils.playerMissiles];
                if (Utils.baseShip && !Utils.baseShip.destroyed) {
                    targets.push(Utils.baseShip);
                }
                let closestTarget = null;
                let minDistance = Utils.canvasWidth * 0.3;
                targets.forEach(obj => {
                    const distance = Utils.calculateDistance(this.x, this.y, obj.x, obj.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestTarget = obj;
                    }
                });
                if (closestTarget) {
                    const angle = Utils.calculateAngle(this.x, this.y, closestTarget.x, closestTarget.y);
                    energyBullets.push(new EnergyBullet(this.x, this.y, angle, 'hangar', Utils));
                }
            } else if (this.burstShotsFired >= this.burstShotsTotal) {
                this.isBursting = false;
                this.lastBurstTime = Utils.currentTime();
            }
        }

        // Lanzar naves cazas
        if (this.cazasLaunched < this.maxCazas && Utils.currentTime() - this.lastCazaLaunchTime >= 5000) {
            this.lastCazaLaunchTime = Utils.currentTime();
            this.cazasLaunched++;
            const caza = new EnemyFighter(this.x, this.y, Utils.canvasWidth, Utils.canvasHeight, this, Utils);
            enemyFighters.push(caza);
            this.cazas.push(caza);
        }

        // Verificar si todas las cazas han sido destruidas
        if (this.cazasLaunched >= this.maxCazas && this.cazas.every(caza => caza.destroyed || caza.escaping)) {
            // Iniciar secuencia de huida
            this.destroyed = true;
            this.hasEscaped = true;
            this.y -= Utils.canvasHeight * 0.005;
            if (this.y + this.height < 0) {
                Utils.removeEnemyHangar(this);
            }
        }

        // Actualizar salud y estado
        if (this.health <= 0) {
            this.destroyed = true;
            Utils.createExplosion(this.x, this.y, false, explosions);
            Utils.incrementScore(100, document.getElementById('score'));
            Utils.incrementCoins(50, document.getElementById('availableCoins'));
        }
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = 'purple';
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

    static spawnWave(wave, canvas, enemyHangars, enemyFighters, Utils) {
        const MAX_ENEMY_HANGARS = 3; // Máximo de hangars por oleada
        const enemyHangarsPerWave = Math.min(Math.floor(wave / 3) + 1, MAX_ENEMY_HANGARS);
        for (let i = 0; i < enemyHangarsPerWave; i++) {
            const hangar = new EnemyHangar(Math.random() * canvas.width, canvas.height * 0.1, canvas.width, canvas.height, Utils);
            enemyHangars.push(hangar);
        }
    }
}
