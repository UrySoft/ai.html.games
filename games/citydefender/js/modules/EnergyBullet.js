// js/modules/EnergyBullet.js
import { Explosion } from './Explosion.js';

export class EnergyBullet {
    constructor(x, y, angle, owner, Utils) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * Utils.canvasWidth * 0.005;
        this.vy = Math.sin(angle) * Utils.canvasHeight * 0.005;
        this.size = owner === 'hangar' ? 3 : 2;
        this.damage = owner === 'playerTurret' ? Utils.turretDamage : 1;
        this.owner = owner;
        this.lifeTime = 500; // ms
        this.destroyed = false;
    }

    update(deltaTime, baseShip, playerMissiles, enemyShips, enemyHangars, enemyFighters, explosions, Utils) {
        this.x += this.vx;
        this.y += this.vy;
        this.lifeTime -= deltaTime * 1000;

        // Verificar colisiones según el propietario
        if (this.owner === 'hangar' || this.owner === 'caza') {
            // Colisión con la nave defensora
            if (baseShip && !baseShip.destroyed && Utils.checkCollision(baseShip, this)) {
                baseShip.takeDamage(this.damage * 10);
                Utils.createExplosion(this.x, this.y, false, explosions);
                this.destroyed = true;
            }
            // Colisión con misiles del jugador
            playerMissiles.forEach(missile => {
                if (Utils.checkCollision(missile, this)) {
                    Utils.createExplosion(missile.x, missile.y, false, explosions);
                    missile.destroyed = true;
                    this.destroyed = true;
                }
            });
        } else if (this.owner === 'playerTurret') {
            // Colisión con enemigos
            const targets = enemyMissiles.concat(enemyShips, enemyHangars, enemyFighters);
            targets.forEach(target => {
                if (!target.destroyed && Utils.checkCollision(target, this)) {
                    target.takeDamage(this.damage);
                    Utils.createExplosion(target.x, target.y, false, explosions);
                    this.destroyed = true;
                    Utils.incrementScore(this.getScore(target), document.getElementById('score'));
                    Utils.incrementCoins(this.getCoins(target), document.getElementById('availableCoins'));
                    Utils.removeTarget(target, enemyShips, enemyHangars, enemyFighters, enemyMissiles);
                }
            });
        }

        // Eliminar si sale de la pantalla o si su vida útil termina
        if (this.x < 0 || this.x > Utils.canvasWidth || this.y < 0 || this.y > Utils.canvasHeight || this.lifeTime <= 0) {
            this.destroyed = true;
        }

        // Generar partículas para la estela
        if (!this.destroyed) {
            Utils.createParticle(this.x, this.y, this.angle, this.owner === 'playerTurret' ? 'player' : 'enemy', particles);
        }
    }

    draw(ctx) {
        if (!this.destroyed) {
            if (this.owner === 'playerTurret') {
                ctx.fillStyle = 'lightgreen';
            } else {
                ctx.fillStyle = 'yellow';
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
        }
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
