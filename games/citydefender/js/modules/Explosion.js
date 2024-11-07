// js/modules/Explosion.js
import { Particle } from './Particle.js';

export class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.opacity = 1;
        this.fadeRate = 1 / 60; // Duración de 60 frames
        this.destroyed = false;
    }

    update(deltaTime, enemyShips, enemyHangars, enemyFighters, enemyMissiles, playerMissiles, explosions, Utils, particles) {
        this.opacity -= this.fadeRate;
        if (this.opacity <= 0) {
            this.destroyed = true;
        } else {
            // Verificar colisiones con enemigos
            enemyMissiles.forEach(missile => {
                if (!missile.destroyed && Utils.checkCollision({x: this.x, y: this.y, width: this.size*2, height: this.size*2}, missile)) {
                    Utils.createExplosion(missile.x, missile.y, false, explosions);
                    missile.destroyed = true;
                    Utils.incrementScore(5, document.getElementById('score'));
                    Utils.incrementCoins(3, document.getElementById('availableCoins'));
                }
            });

            enemyShips.forEach(ship => {
                if (!ship.destroyed && Utils.checkCollision({x: this.x, y: this.y, width: this.size*2, height: this.size*2}, ship)) {
                    ship.takeDamage(Utils.missileDamage);
                    if (ship.health <= 0) {
                        Utils.createExplosion(ship.x, ship.y, false, explosions);
                        Utils.removeEnemyShip(ship);
                        Utils.incrementScore(15, document.getElementById('score'));
                        Utils.incrementCoins(10, document.getElementById('availableCoins'));
                    }
                }
            });

            enemyHangars.forEach(hangar => {
                if (!hangar.destroyed && Utils.checkCollision({x: this.x, y: this.y, width: this.size*2, height: this.size*2}, hangar)) {
                    hangar.takeDamage(Utils.missileDamage);
                    if (hangar.health <= 0) {
                        Utils.createExplosion(hangar.x, hangar.y, false, explosions);
                        Utils.removeEnemyHangar(hangar);
                        Utils.incrementScore(100, document.getElementById('score'));
                        Utils.incrementCoins(50, document.getElementById('availableCoins'));
                    }
                }
            });

            enemyFighters.forEach(fighter => {
                if (!fighter.destroyed && Utils.checkCollision({x: this.x, y: this.y, width: this.size*2, height: this.size*2}, fighter)) {
                    fighter.takeDamage(Utils.missileDamage);
                    if (fighter.health <= 0) {
                        Utils.createExplosion(fighter.x, fighter.y, false, explosions);
                        Utils.removeEnemyFighter(fighter);
                        Utils.incrementScore(20, document.getElementById('score'));
                        Utils.incrementCoins(15, document.getElementById('availableCoins'));
                    }
                }
            });
        }

        // Generar partículas de explosión
        for (let i = 0; i < 10; i++) {
            Utils.createParticle(this.x, this.y, Math.random() * 2 * Math.PI, 'explosion', particles);
        }
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(255, 255, 0,${this.opacity})`); // Amarillo
        gradient.addColorStop(0.5, `rgba(255, 140, 0,${this.opacity})`); // Naranja
        gradient.addColorStop(1, `rgba(255, 0, 0,${this.opacity})`); // Rojo
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
