/* draw.js */
// Dibujar elementos en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar explosiones
    explosions.forEach(function(explosion) {
        var progress = (Date.now() - explosion.startTime) / explosion.duration;
        var alpha = 1 - progress;
        ctx.fillStyle = 'rgba(255, 165, 0,' + alpha + ')';
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * progress, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Dibujar misiles enemigos
    enemyMissiles.forEach(function(missile) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Dibujar misiles del jugador
    playerMissiles.forEach(function(missile) {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Dibujar proyectiles de energía
    energyBullets.forEach(function(bullet) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Dibujar ciudades
    cities.forEach(function(city) {
        if (!city.destroyed) {
            ctx.fillStyle = city.color;
            ctx.fillRect(city.x, city.y, city.width, city.height);
        }
    });

    // Dibujar nave base flotante
    if (baseShip && !baseShip.destroyed) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(baseShip.x - baseShip.width / 2, baseShip.y - baseShip.height / 2, baseShip.width, baseShip.height);
        // Dibujar barra de vida
        ctx.fillStyle = 'red';
        ctx.fillRect(baseShip.x - baseShip.width / 2, baseShip.y - baseShip.height / 2 - 10, baseShip.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(baseShip.x - baseShip.width / 2, baseShip.y - baseShip.height / 2 - 10, (baseShipHealth / baseShipMaxHealth) * baseShip.width, 5);

        // Dibujar escudo
        if (shieldEnergy > 0) {
            var shieldOpacity = shieldEnergy / shieldCapacity;
            ctx.globalAlpha = shieldOpacity;
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(baseShip.x, baseShip.y, baseShip.width, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Dibujar ametralladoras
        turrets.forEach(function(turret) {
            ctx.fillStyle = 'darkgray';
            ctx.fillRect(baseShip.x + turret.offsetX - 5, baseShip.y + turret.offsetY - 5, 10, 10);
        });
    }

    // Dibujar cazas amigos
    fighters.forEach(function(fighter) {
        ctx.fillStyle = getFighterColor(fighter);
        ctx.fillRect(fighter.x - fighter.width / 2, fighter.y - fighter.height / 2, fighter.width, fighter.height);
        // Dibujar escudo si tiene
        if (fighter.shieldActive) {
            ctx.strokeStyle = 'cyan';
            ctx.beginPath();
            ctx.arc(fighter.x, fighter.y, fighter.width, 0, 2 * Math.PI);
            ctx.stroke();
        }
    });

    // Dibujar enemigos
    enemyShips.forEach(function(ship) {
        if (!ship.destroyed) {
            ctx.fillStyle = 'purple';
            ctx.fillRect(ship.x - ship.width / 2, ship.y - ship.height / 2, ship.width, ship.height);
        }
    });

    enemyHangars.forEach(function(hangar) {
        if (!hangar.destroyed) {
            ctx.fillStyle = 'brown';
            ctx.fillRect(hangar.x - hangar.width / 2, hangar.y - hangar.height / 2, hangar.width, hangar.height);
        }
    });

    enemyFighters.forEach(function(fighter) {
        if (!fighter.destroyed) {
            ctx.fillStyle = 'orange';
            ctx.fillRect(fighter.x - fighter.width / 2, fighter.y - fighter.height / 2, fighter.width, fighter.height);
        }
    });
}

// Función para obtener el color del caza según su táctica
function getFighterColor(fighter) {
    if (fighter.tactic === 'closest') {
        return 'green';
    } else if (fighter.tactic === 'weakest') {
        return 'blue';
    } else if (fighter.tactic === 'strongest') {
        return 'red';
    }
    return 'white';
}
