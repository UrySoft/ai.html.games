// modules/EnemyShip.js
export class EnemyShip {
    constructor(x, y, canvasWidth, canvasHeight) {
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
        this.lastShotTime = Date.now() - Math.random() * 3000;
        this.retreatStartTime = null;
    }

    update(deltaTime, enemyMissiles, cities, Utils) {
        this.x += this.speed * this.direction;
        if (this.x < 0 || this.x > Utils.canvasWidth) { // Usar Utils para obtener canvasWidth
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
                    Utils.removeEnemyShip(this);
                }
            }
        }

        // Actualizar salud y estado
        if (this.health <= 0) {
            this.destroyed = true;
            Utils.createExplosion(this.x, this.y, false);
            Utils.incrementScore(15);
            Utils.incrementCoins(10);
            Utils.removeEnemyShip(this);
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
}

class EnemyMissile {
    constructor(x, y, targetX, targetY, Utils) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = Utils.canvasHeight * 0.0004;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.destroyed = false;
    }

    update(deltaTime, baseShip, explosions, Utils) {
        const moveX = Math.cos(this.angle) * this.speed;
        const moveY = Math.sin(this.angle) * this.speed;
        this.x += moveX;
        this.y += moveY;

        // Verificar colisión con la nave de defensa
        if (baseShip && !baseShip.destroyed && Utils.checkCollision(baseShip, this)) {
            Utils.createExplosion(this.x, this.y, false);
            Utils.removeEnemyMissile(this);
            baseShip.shield.takeDamage(20);
            if (baseShip.health <= 0) {
                baseShip.destroyed = true;
            }
        }

        // Verificar si llega al destino
        const distance = Utils.calculateDistance(this.x, this.y, this.targetX, this.targetY);
        if (distance < this.speed) {
            Utils.createExplosion(this.x, this.y, false);
            Utils.removeEnemyMissile(this);
            // Destruir ciudad si corresponde
            Utils.destroyCityAt(this.x, this.y);
        }

        // Generar partículas para la estela
        Utils.createParticle(this.x, this.y, this.angle, 'enemy');

        // Actualizar salud y estado
        // Implementar según sea necesario
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

