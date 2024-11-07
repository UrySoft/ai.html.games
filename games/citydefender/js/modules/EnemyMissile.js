// js/modules/EnemyMissile.js
import { Explosion } from './Explosion.js';

export class EnemyMissile {
    constructor(x, y, targetX, targetY, Utils) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = Utils.canvasHeight * 0.0004;
        this.angle = Utils.calculateAngle(x, y, targetX, targetY);
        this.destroyed = false;
    }

    update(deltaTime, baseShip, explosions, Utils) {
        const moveX = Math.cos(this.angle) * this.speed;
        const moveY = Math.sin(this.angle) * this.speed;
        this.x += moveX;
        this.y += moveY;

        // Verificar colisión con la nave de defensa
        if (baseShip && !baseShip.destroyed && Utils.checkCollision(baseShip, this)) {
            Utils.createExplosion(this.x, this.y, false, explosions);
            this.destroyed = true;
            baseShip.takeDamage(20);
        }

        // Verificar si llega al destino
        const distance = Utils.calculateDistance(this.x, this.y, this.targetX, this.targetY);
        if (distance < this.speed) {
            Utils.createExplosion(this.x, this.y, false, explosions);
            this.destroyed = true;
            // Destruir ciudad si corresponde
            Utils.destroyCityAt(this.x, this.y, Utils.cities);
        }

        // Generar partículas para la estela
        Utils.createParticle(this.x, this.y, this.angle, 'enemy', Utils.particles);
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = 'red';
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

