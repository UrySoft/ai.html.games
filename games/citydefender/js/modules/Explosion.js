// modules/Explosion.js
import { Particle } from './Particle.js';

export class Explosion {
    constructor(x, y, size, Utils) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.opacity = 1;
        this.fadeRate = 1 / 60; // Duración de 60 frames
        this.affectedShips = [];
        this.affectedHangars = [];
        this.affectedFighters = [];
        this.affectedMissiles = [];
    }

    update(deltaTime, enemyShips, enemyHangars, enemyFighters, enemyMissiles, playerMissiles, Utils) {
        this.opacity -= this.fadeRate;
        if (this.opacity <= 0) {
            Utils.removeExplosion(this);
        } else {
            // Verificar colisiones con enemigos
            enemyMissiles.forEach(missile => {
                if (!this.affectedMissiles.includes(missile) && Utils.checkCollision(this, missile)) {
                    Utils.createExplosion(missile.x, missile.y, false);
                    Utils.removeEnemyMissile(missile);
                    Utils.incrementScore(5);
                    Utils.incrementCoins(3);
                    this.affectedMissiles.push(missile);
                }
            });

            enemyShips.forEach(ship => {
                if (!this.affectedShips.includes(ship) && Utils.checkCollision(ship, this)) {
                    ship.takeDamage(Utils.missileDamage);
                    this.affectedShips.push(ship);
                    if (ship.health <= 0) {
                        Utils.createExplosion(ship.x, ship.y, false);
                        Utils.removeEnemyShip(ship);
                        Utils.incrementScore(15);
                        Utils.incrementCoins(10);
                    }
                }
            });

            enemyHangars.forEach(hangar => {
                if (!this.affectedHangars.includes(hangar) && Utils.checkCollision(hangar, this)) {
                    hangar.takeDamage(Utils.missileDamage);
                    this.affectedHangars.push(hangar);
                    if (hangar.health <= 0) {
                        Utils.createExplosion(hangar.x, hangar.y, false);
                        Utils.removeEnemyHangar(hangar);
                        Utils.incrementScore(100);
                        Utils.incrementCoins(50);
                    }
                }
            });

            enemyFighters.forEach(fighter => {
                if (!this.affectedFighters.includes(fighter) && Utils.checkCollision(fighter, this)) {
                    fighter.takeDamage(Utils.missileDamage);
                    this.affectedFighters.push(fighter);
                    if (fighter.health <= 0) {
                        Utils.createExplosion(fighter.x, fighter.y, false);
                        Utils.removeEnemyFighter(fighter);
                        Utils.incrementScore(20);
                        Utils.incrementCoins(15);
                    }
                }
            });
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

