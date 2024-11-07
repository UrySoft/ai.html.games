// modules/BaseShip.js
export class BaseShip {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.width = canvasWidth * 0.08;
        this.height = canvasHeight * 0.04;
        this.destroyed = false;
        this.speed = canvasWidth * 0.0015;
        this.direction = 1;
        this.shield = new Shield(this.x, this.y, this.width);
        this.canShoot = true;
        this.missiles = 10;
        this.maxMissiles = 50;
        this.health = 6;
        this.maxHealth = 6;
    }

    update(deltaTime, canvas) {
        // Lógica de movimiento automático
        // Interceptar misiles enemigos o movimiento aleatorio
        // Implementar según la lógica original
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            // Dibujar barra de vida
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(this.x - this.width / 2, this.y + this.height / 2 + 5, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 5, this.width * (this.health / this.maxHealth), 5);
            // Dibujar escudo
            this.shield.draw(ctx);
            // Dibujar ametralladoras
            // Implementar si es necesario
        }
    }

    shoot(targetX, targetY, playerMissiles, Utils) {
        if (this.missiles > 0) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const angle = Math.atan2(dy, dx);
            playerMissiles.push(new Missile(this.x, this.y, targetX, targetY, this, Utils));
            this.missiles--;
            document.getElementById('baseShipMissiles').innerText = this.missiles;
            // Actualizar menú de mejoras si es necesario
        }
    }
}

class Shield {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.capacity = 100;
        this.energy = this.capacity;
        this.regenRate = 1; // Por segundo
        this.active = true;
    }

    update(deltaTime) {
        if (this.energy < this.capacity) {
            this.energy += this.regenRate * deltaTime;
            if (this.energy > this.capacity) this.energy = this.capacity;
            if (this.energy > 0 && !this.active) this.active = true;
        }
    }

    draw(ctx) {
        if (this.energy > 0) {
            const shieldOpacity = this.energy / this.capacity;
            ctx.globalAlpha = shieldOpacity;
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    takeDamage(amount) {
        if (this.energy > 0) {
            this.energy -= amount;
            if (this.energy <= 0) {
                this.energy = 0;
                this.active = false;
            }
        } else {
            // Reducir la salud de la nave base
            // Implementar en BaseShip
        }
    }
}

