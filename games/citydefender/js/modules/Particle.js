// modules/Particle.js
export class Particle {
    constructor(x, y, vx, vy, size, life, opacity, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.opacity = opacity;
        this.type = type;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= deltaTime * 60; // Suponiendo 60 FPS
        this.opacity = this.life / this.maxLife;
    }

    draw(ctx) {
        if (this.life > 0) {
            ctx.globalAlpha = this.opacity;
            if (this.type === 'player') {
                ctx.fillStyle = `rgba(173,216,230,${this.opacity})`; // Azul claro
            } else if (this.type === 'enemy') {
                ctx.fillStyle = `rgba(255,140,0,${this.opacity})`; // Naranja
            } else if (this.type === 'explosion') {
                // De amarillo a rojo
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, `rgba(255, 255, 0,${this.opacity})`);
                gradient.addColorStop(0.5, `rgba(255, 140, 0,${this.opacity})`);
                gradient.addColorStop(1, `rgba(255, 0, 0,${this.opacity})`);
                ctx.fillStyle = gradient;
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

