// js/modules/Turret.js
import { EnergyBullet } from './EnergyBullet.js';

export class Turret {
    constructor(offsetX, offsetY, baseShip, Utils) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.baseShip = baseShip;
        this.lastShotTime = 0;
        this.range = Utils.turretRange;
        this.damage = Utils.turretDamage;
        this.fireRate = Utils.turretFireRate; // ms
    }

    update(deltaTime, enemyShips, enemyMissiles, enemyHangars, enemyFighters, energyBullets, Utils) {
        const currentTime = Utils.currentTime();
        if (currentTime - this.lastShotTime >= this.fireRate) {
            // Buscar el objetivo más cercano dentro del alcance
            const targets = enemyMissiles.concat(enemyShips, enemyHangars, enemyFighters).filter(obj => !obj.destroyed);
            let closestTarget = null;
            let minDistance = this.range;
            targets.forEach(obj => {
                const distance = Utils.calculateDistance(this.baseShip.x + this.offsetX, this.baseShip.y + this.offsetY, obj.x, obj.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTarget = obj;
                }
            });

            if (closestTarget) {
                this.lastShotTime = currentTime;
                const angle = Utils.calculateAngle(this.baseShip.x + this.offsetX, this.baseShip.y + this.offsetY, closestTarget.x, closestTarget.y);
                energyBullets.push(new EnergyBullet(this.baseShip.x + this.offsetX, this.baseShip.y + this.offsetY, angle, 'playerTurret', Utils));
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(this.baseShip.x + this.offsetX - 5, this.baseShip.y + this.offsetY - 5, 10, 10);
    }

    upgradeRange(multiplier) {
        this.range *= multiplier;
    }

    upgradeDamage(amount) {
        this.damage += amount;
    }

    upgradeFireRate(amount) {
        this.fireRate = Math.max(this.fireRate - amount, 100); // Mínimo tiempo de recarga
    }
}
