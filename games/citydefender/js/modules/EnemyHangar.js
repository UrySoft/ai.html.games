// modules/EnemyHangar.js
import { EnemyFighter } from './EnemyFighter.js';
import { EnemyMissile } from './EnemyMissile.js';
import { Explosion } from './Explosion.js';

export class EnemyHangar {
    constructor(x, y, canvasWidth, canvasHeight) {
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
        this.lastCazaLaunchTime = Date.now();
        this.cazas = [];
        this.destroyed = false;
        this.hasEscaped = false;
    }

    update(deltaTime, enemyFighters, energyBullets, Utils) {
        this.x += this.speed * this.direction;
        if (this.x < 0 || this.x > Utils.canvasWidth) {
            this.direction *= -1;
        }

        // Disparar ráfagas de ametralladora de energía
        if (!this.isBursting && (!this.lastBurstTime || Utils.currentTime() - this.lastBurstTime >= this.reloadTime)) {
            // Verificar si hay objetivos cercanos
            const targets = Utils.playerMissiles.concat([Utils.baseShip]).filter(obj => obj && !obj.destroyed);
            const inRange = targets.some(obj => Utils.calculateDistance(obj.x, obj.y, this.x, this.y) < Utils.canvasHeight * 0.3);
            if (inRange) {
                this.isBursting = true;
                this.lastBurstTime = Utils.currentTime();
                this.burstShotsFired = 0;
            }
        }

        if (this.isBursting) {
            if (this.burstShotsFired < this.burstShotsTotal && Utils.currentTime() - this.lastShotTime >= this.burstShotInterval) {
                this.lastShotTime = Utils.currentTime();
                this.burstShotsFired++;
                // Crear proyectiles hacia el objetivo más cercano
                const targets = Utils.playerMissiles.concat([Utils.baseShip]).filter(obj => obj && !obj.destroyed);
                let closestTarget = null;
                let minDistance = Infinity;
                targets.forEach(obj => {
                    const distance = Utils.calculateDistance(obj.x, obj.y, this.x, this.y);
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
            Utils.createExplosion(this.x, this.y, false);
            Utils.incrementScore(100);
            Utils.incrementCoins(50);
            Utils.removeEnemyHangar(this);
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
}

class EnergyBullet {
    constructor(x, y, angle, owner, Utils) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * Utils.canvasWidth * 0.005;
        this.vy = Math.sin(angle) * Utils.canvasHeight * 0.005;
        this.size = owner === 'hangar' ? 3 : 2;
        this.damage = 1;
        this.owner = owner;
        this.lifeTime = 500; // ms
    }

    update(deltaTime, baseShip, playerMissiles, enemyShips, enemyHangars, enemyFighters, explosions, Utils) {
        this.x += this.vx;
        this.y += this.vy;
        this.lifeTime -= deltaTime * 1000;

        // Verificar colisiones según el propietario
        if (this.owner === 'hangar' || this.owner === 'caza') {
            // Colisión con la nave defensora
            if (baseShip && !baseShip.destroyed && Utils.checkCollision(baseShip, this)) {
                baseShip.shield.takeDamage(this.damage * 10);
                Utils.removeEnergyBullet(this);
            }
            // Colisión con misiles del jugador
            playerMissiles.forEach(missile => {
                if (Utils.checkCollision(missile, this)) {
                    Utils.createExplosion(missile.x, missile.y, false);
                    missile.destroy();
                    Utils.removeEnergyBullet(this);
                }
            });
        } else if (this.owner === 'playerTurret') {
            // Colisión con enemigos
            const targets = enemyMissiles.concat(enemyShips, enemyHangars, enemyFighters);
            targets.forEach(target => {
                if (!target.destroyed && Utils.checkCollision(target, this)) {
                    target.takeDamage(this.damage);
                    if (target.health <= 0) {
                        target.destroyed = true;
                        Utils.createExplosion(target.x, target.y, false);
                        Utils.incrementScore(this.getScore(target));
                        Utils.incrementCoins(this.getCoins(target));
                        Utils.removeTarget(target);
                    }
                    Utils.removeEnergyBullet(this);
                }
            });
        }

        // Eliminar si sale de la pantalla o si su vida útil termina
        if (this.x < 0 || this.x > Utils.canvasWidth || this.y < 0 || this.y > Utils.canvasHeight || this.lifeTime <= 0) {
            Utils.removeEnergyBullet(this);
        }
    }

    draw(ctx) {
        if (this.owner === 'playerTurret') {
            ctx.fillStyle = 'lightgreen';
        } else {
            ctx.fillStyle = 'yellow';
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    getScore(target) {
        if (target instanceof EnemyShip) return 15;
        if (target instanceof EnemyHangar) return 100;
        if (target instanceof EnemyFighter) return 20;
        if (target instanceof EnemyMissile) return 5;
        return 0;
    }

    getCoins(target) {
        if (target instanceof EnemyShip) return 10;
        if (target instanceof EnemyHangar) return 50;
        if (target instanceof EnemyFighter) return 15;
        if (target instanceof EnemyMissile) return 3;
        return 0;
    }
}

