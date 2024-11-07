// main.js

// Variables y constantes
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let baseShip = null; // Nave base flotante
let baseShipHealth = 6; // Vida de la nave base
let baseShipMaxHealth = 6;
let baseShipMissiles = 10; // Misiles de la nave base
const maxMissiles = 50; // Máximo de misiles que puede almacenar

let shieldCapacity = 100; // Capacidad máxima del escudo
let shieldEnergy = shieldCapacity; // Energía actual del escudo
let shieldRegenRate = 1; // Regeneración por segundo
let shieldActive = true;

let turretCount = 0; // Número de ametralladoras
const maxTurrets = 5;
let turrets = []; // Array de ametralladoras
let turretRange = 100; // Alcance de las ametralladoras
let turretDamage = 1; // Daño de las ametralladoras
let turretFireRate = 1000; // Milisegundos entre disparos

let cities = [];
let enemyMissiles = [];
let playerMissiles = [];
let explosions = [];
let enemyShips = []; // Naves enemigas tipo naveMisiles
let enemyHangars = []; // Naves enemigas tipo naveHangar
let enemyFighters = []; // Naves enemigas tipo naveCaza

let energyBullets = []; // Proyectiles de energía

let score = 0;
let wave = 1;
let enemyShipsPerWave = 1;
let enemyHangarsPerWave = 0;

let missileLimit = 2;

let missileSpeedMultiplier = 1.00;
let explosionSizeMultiplier = 1.00;
let explosionDurationMultiplier = 1.00;

let missileDamage = 1; // Daño inicial de los misiles del jugador

let canShoot = true;
let coinsToSpend = 9999; // Jugador inicia con 9999 coins

let gamePaused = false; // Variable para controlar el estado del juego

// Ajuste de costos iniciales
let costMissileLimit = 10;      // Costo inicial de Misiles simultáneos
let costExplosionSize = 20;     // Costo inicial de Tamaño explosión
let costMissileSpeed = 10;      // Costo inicial de Velocidad misiles
let costMissileDamage = 25;     // Costo inicial de Daño de misiles

let costUpgradeBaseShipHealth = 20; // Costo de aumentar la vida máxima de la nave base

let costTurret = 100;           // Costo inicial de la ametralladora
let costTurretRange = 50;       // Costo de mejorar alcance
let costTurretDamage = 75;      // Costo de mejorar potencia

let costShieldCapacity = 100;   // Costo de mejorar capacidad del escudo
let costShieldRegen = 80;       // Costo de mejorar regeneración del escudo

let particles = []; // Array para las partículas (misiles y explosiones)

let lastUpdateTime = Date.now(); // Inicializar lastUpdateTime

// Ajuste del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 40; // Restar espacio para el botón de mejoras
    initGame();
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

// Inicializar el juego
function initGame() {
    // Reiniciar todas las variables y arrays
    enemyMissiles = [];
    playerMissiles = [];
    explosions = [];
    enemyShips = [];
    enemyHangars = [];
    enemyFighters = [];
    energyBullets = [];
    particles = [];
    canShoot = true;
    gamePaused = false;
    score = 0;
    wave = 1;
    coinsToSpend = 9999; // Jugador inicia con 9999 coins

    // Reiniciar mejoras y costos
    missileLimit = 2;
    missileSpeedMultiplier = 1.00;
    explosionSizeMultiplier = 1.00;
    explosionDurationMultiplier = 1.00;
    missileDamage = 1;
    costMissileLimit = 10;
    costExplosionSize = 20;
    costMissileSpeed = 10;
    costMissileDamage = 25;
    costUpgradeBaseShipHealth = 20;
    baseShipMaxHealth = 6;
    baseShipHealth = baseShipMaxHealth;
    baseShipMissiles = 10;

    // Reiniciar escudo
    shieldCapacity = 100;
    shieldEnergy = shieldCapacity;
    shieldRegenRate = 1;
    shieldActive = true;

    // Reiniciar ametralladoras
    turretCount = 0;
    turrets = [];
    turretRange = 100;
    turretDamage = 1;
    turretFireRate = 1000;
    costTurret = 100;
    costTurretRange = 50;
    costTurretDamage = 75;
    costShieldCapacity = 100;
    costShieldRegen = 80;

    document.getElementById('score').innerText = score;
    document.getElementById('wave').innerText = wave;
    document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    document.getElementById('baseShipMissiles').innerText = baseShipMissiles;

    updateUpgradeMenu();

    // Inicializar nave base
    baseShip = {
        x: canvas.width / 2,
        y: canvas.height * 0.75, // Vuela más abajo
        width: canvas.width * 0.08,
        height: canvas.height * 0.04,
        destroyed: false,
        speed: canvas.width * 0.0015,
        direction: 1,
        verticalSpeed: canvas.height * 0.0002, // Velocidad vertical reducida
        verticalDirection: 1,
        lastShieldRegenTime: Date.now()
    };

    // Inicializar ciudades
    cities = [];
    const numberOfBuildings = 20;
    for (let i = 0; i < numberOfBuildings; i++) {
        const cityWidth = (canvas.width * 0.02) + Math.random() * (canvas.width * 0.05);
        const cityHeight = (canvas.height * 0.05) + Math.random() * (canvas.height * 0.15);
        const xPosition = Math.random() * (canvas.width - cityWidth);
        const yPosition = canvas.height - cityHeight; // Mover la ciudad más abajo
        cities.push({
            x: xPosition,
            y: yPosition,
            width: cityWidth,
            height: cityHeight,
            destroyed: false,
            color: `rgb(0, ${50 + Math.floor(Math.random() * 205)}, 255)`
        });
    }

    lastUpdateTime = Date.now(); // Reiniciar lastUpdateTime

    startWave();
}

// Obtener posición del puntero
function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches && event.touches.length > 0) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    return { x: x, y: y };
}

// Manejar interacción del jugador
function handleInteraction(event) {
    event.preventDefault();
    if (!canShoot || gamePaused) return;
    if (playerMissiles.length >= missileLimit) return;
    if (baseShipMissiles <= 0) return;

    const pointer = getPointerPosition(event);
    if (baseShip && !baseShip.destroyed) {
        const dx = pointer.x - baseShip.x;
        const dy = pointer.y - baseShip.y;
        const angle = Math.atan2(dy, dx);

        playerMissiles.push({
            x: baseShip.x,
            y: baseShip.y,
            targetX: pointer.x,
            targetY: pointer.y,
            speed: canvas.height * 0.00125 * missileSpeedMultiplier,
            exploded: false,
            angle: angle
        });
        baseShipMissiles--;
        document.getElementById('baseShipMissiles').innerText = baseShipMissiles;
        updateUpgradeMenu();
    }
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

// Iniciar oleada
function startWave() {
    canShoot = true;
    const MAX_ENEMY_SHIPS = 5; // Máximo de naves enemigas por oleada
    enemyShipsPerWave = Math.min(Math.floor(wave / 2) + 1, MAX_ENEMY_SHIPS);
    enemyHangarsPerWave = Math.floor(wave / 5); // Cada 5 oleadas, una naveHangar más
    generateEnemyShips();
    gamePaused = false; // Asegurarse de que el juego no esté en pausa
    requestAnimationFrame(gameLoop);
}

// Generar naves enemigas
function generateEnemyShips() {
    // Generar naves tipo naveMisiles
    for (let i = 0; i < enemyShipsPerWave; i++) {
        let enemyShip = {
            x: Math.random() * canvas.width,
            y: canvas.height * 0.1,
            width: canvas.width * 0.03,
            height: canvas.height * 0.02,
            speed: canvas.width * 0.0015,
            direction: Math.random() < 0.5 ? -1 : 1,
            missilesLeft: 2,
            destroyed: false,
            health: 3,          // Vida actual de la nave enemiga (incrementada a 3)
            maxHealth: 3,       // Vida máxima de la nave enemiga
            lastShotTime: Date.now() - Math.random() * 3000, // Variación en el tiempo del primer disparo
            retreatStartTime: null,
            angle: 0 // Se añadirá para dibujar el misil
        };
        enemyShips.push(enemyShip);
    }

    // Generar naves tipo naveHangar
    for (let i = 0; i < enemyHangarsPerWave; i++) {
        let hangar = {
            x: Math.random() * canvas.width,
            y: canvas.height * 0.15, // Vuela más abajo
            width: canvas.width * 0.06, // Doble de tamaño que naveMisiles
            height: canvas.height * 0.04,
            speed: canvas.width * 0.0005, // Movimiento lento
            direction: Math.random() < 0.5 ? -1 : 1,
            health: 8,          // Vida actual de la nave hangar (incrementada a 8)
            maxHealth: 8,       // Vida máxima de la nave hangar
            lastBurstTime: null,
            isBursting: false,
            burstShotsFired: 0,
            burstShotsTotal: 5,
            burstShotInterval: 100, // Dispara cada 100 ms en ráfaga
            burstDuration: 2000, // 2 segundos
            reloadTime: 4000,    // 4 segundos
            cazasLaunched: 0,
            maxCazas: 4,
            lastCazaLaunchTime: Date.now(),
            cazas: [],           // Lista de naves cazas lanzadas
            destroyed: false,
            hasEscaped: false,
            lastShotTime: 0
        };
        enemyHangars.push(hangar);
    }
}

// Bucle del juego
function gameLoop() {
    if (!gamePaused) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Actualizar estado del juego
function update() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - (lastUpdateTime || currentTime)) / 1000;
    lastUpdateTime = currentTime;

    // Regeneración del escudo
    if (shieldEnergy < shieldCapacity) {
        shieldEnergy += shieldRegenRate * deltaTime;
        if (shieldEnergy > shieldCapacity) {
            shieldEnergy = shieldCapacity;
        }
        if (shieldEnergy > 0 && !shieldActive) {
            shieldActive = true;
        }
    }

    // Movimiento automático de la nave base
    if (baseShip && !baseShip.destroyed) {
        // Movimiento para interceptar el misil enemigo más cercano
        let closestMissile = null;
        let minDistance = Infinity;
        enemyMissiles.forEach(function(missile) {
            const dx = missile.x - baseShip.x;
            const dy = missile.y - baseShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                closestMissile = missile;
            }
        });
        if (closestMissile) {
            const direction = closestMissile.x > baseShip.x ? 1 : -1;
            baseShip.x += baseShip.speed * direction;
        } else {
            // Movimiento horizontal normal
            baseShip.x += baseShip.speed * baseShip.direction;
            if (Math.random() < 0.01) {
                baseShip.direction *= -1;
            }
        }
        // Limitar movimiento dentro del canvas
        if (baseShip.x < baseShip.width / 2) {
            baseShip.x = baseShip.width / 2;
            baseShip.direction *= -1;
        }
        if (baseShip.x > canvas.width - baseShip.width / 2) {
            baseShip.x = canvas.width - baseShip.width / 2;
            baseShip.direction *= -1;
        }
    }

    // Actualizar ametralladoras de la nave de defensa
    turrets.forEach(function(turret) {
        if (currentTime - turret.lastShotTime >= turretFireRate) {
            const targets = enemyMissiles.concat(enemyShips, enemyHangars, enemyFighters).filter(obj => !obj.destroyed);
            let closestTarget = null;
            let minDistance = turretRange;
            targets.forEach(function(target) {
                const dx = target.x - (baseShip.x + turret.offsetX);
                const dy = target.y - (baseShip.y + turret.offsetY);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTarget = target;
                }
            });
            if (closestTarget) {
                turret.lastShotTime = currentTime;
                const dx = closestTarget.x - (baseShip.x + turret.offsetX);
                const dy = closestTarget.y - (baseShip.y + turret.offsetY);
                const angle = Math.atan2(dy, dx);
                energyBullets.push({
                    x: baseShip.x + turret.offsetX,
                    y: baseShip.y + turret.offsetY,
                    vx: Math.cos(angle) * canvas.width * 0.005,
                    vy: Math.sin(angle) * canvas.height * 0.005,
                    size: 2,
                    damage: turretDamage,
                    owner: 'playerTurret',
                    lifeTime: 500 // Vida útil de la bala en ms
                });
            }
        }
    });

    // Actualizar naves enemigas tipo naveMisiles
    enemyShips.forEach(function(ship, index) {
        ship.x += ship.speed * ship.direction;
        if (ship.x < 0 || ship.x > canvas.width) {
            ship.direction *= -1;
            ship.y += canvas.height * 0.02;
        }
        // Lanzar misiles
        if (ship.missilesLeft > 0 && currentTime - ship.lastShotTime >= 5000) {
            ship.lastShotTime = currentTime;
            let targetOptions = cities.filter(city => !city.destroyed);
            if (targetOptions.length === 0 && baseShip && !baseShip.destroyed) {
                targetOptions = [baseShip];
            } else if (targetOptions.length === 0) {
                targetOptions = [{ x: canvas.width / 2, y: canvas.height }];
            }
            const target = targetOptions[Math.floor(Math.random() * targetOptions.length)];

            const dx = target.x - ship.x;
            const dy = target.y - (ship.y + ship.height / 2);
            const angle = Math.atan2(dy, dx);

            enemyMissiles.push({
                x: ship.x,
                y: ship.y + ship.height / 2,
                targetX: target.x,
                targetY: target.y,
                speed: canvas.height * 0.0004, // Velocidad constante
                exploded: false,
                angle: angle
            });
            ship.missilesLeft--;
            // Aproximarse a la ciudad
            ship.y += canvas.height * 0.02;
        }
        // Esperar antes de huir si ya no tiene misiles
        if (ship.missilesLeft <= 0) {
            if (!ship.retreatStartTime) {
                ship.retreatStartTime = currentTime;
            } else if (currentTime - ship.retreatStartTime >= 15000) {
                // Huir hacia arriba
                ship.y -= canvas.height * 0.005;
                if (ship.y + ship.height < 0) {
                    enemyShips.splice(index, 1);
                }
            }
        }
    });

    // Actualizar naves enemigas tipo naveHangar
    enemyHangars.forEach(function(hangar, index) {
        hangar.x += hangar.speed * hangar.direction;
        if (hangar.x < 0 || hangar.x > canvas.width) {
            hangar.direction *= -1;
        }

        // Disparar ráfagas de ametralladora de energía
        if (!hangar.isBursting && (!hangar.lastBurstTime || currentTime - hangar.lastBurstTime >= hangar.reloadTime)) {
            // Verificar si hay objetivos cercanos
            const targets = playerMissiles.concat([baseShip]).filter(obj => obj && !obj.destroyed);
            const inRange = targets.some(obj => {
                const dx = obj.x - hangar.x;
                const dy = obj.y - hangar.y;
                return Math.sqrt(dx * dx + dy * dy) < canvas.height * 0.3; // Alcance limitado
            });
            if (inRange) {
                hangar.isBursting = true;
                hangar.lastBurstTime = currentTime;
                hangar.burstShotsFired = 0;
            }
        }

        if (hangar.isBursting) {
            if (hangar.burstShotsFired < hangar.burstShotsTotal && currentTime - hangar.lastShotTime >= hangar.burstShotInterval) {
                hangar.lastShotTime = currentTime;
                hangar.burstShotsFired++;
                // Crear proyectiles hacia el objetivo más cercano
                const targets = playerMissiles.concat([baseShip]).filter(obj => obj && !obj.destroyed);
                let closestTarget = null;
                let minDistance = Infinity;
                targets.forEach(obj => {
                    const dx = obj.x - hangar.x;
                    const dy = obj.y - hangar.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestTarget = obj;
                    }
                });
                if (closestTarget) {
                    const dx = closestTarget.x - hangar.x;
                    const dy = closestTarget.y - hangar.y;
                    const angle = Math.atan2(dy, dx);
                    energyBullets.push({
                        x: hangar.x,
                        y: hangar.y,
                        vx: Math.cos(angle) * canvas.width * 0.005,
                        vy: Math.sin(angle) * canvas.height * 0.005,
                        size: 3,
                        damage: 1,
                        owner: 'hangar',
                        lifeTime: 500 // Vida útil de la bala en ms
                    });
                }
            } else if (hangar.burstShotsFired >= hangar.burstShotsTotal) {
                hangar.isBursting = false;
                hangar.lastBurstTime = currentTime;
            }
        }

        // Lanzar naves cazas
        if (hangar.cazasLaunched < hangar.maxCazas && currentTime - hangar.lastCazaLaunchTime >= 5000) {
            hangar.lastCazaLaunchTime = currentTime;
            hangar.cazasLaunched++;
            const caza = {
                x: hangar.x,
                y: hangar.y, // Salen desde el interior del hangar
                width: canvas.width * 0.02,
                height: canvas.height * 0.015,
                speed: canvas.height * 0.001,
                health: 2,          // Vida actual de la nave caza (incrementada a 2)
                maxHealth: 2,       // Vida máxima de la nave caza
                lastShotTime: currentTime,
                shotInterval: 500, // Dispara cada 0.5 segundos
                hangar: hangar,
                destroyed: false,
                escaping: false,
                state: 'approaching',
                targetReached: false,
                isBursting: false,
                burstShotsFired: 0,
                burstShotsTotal: 3
            };
            enemyFighters.push(caza);
            hangar.cazas.push(caza); // Añadir caza a la lista de cazas del hangar
        }

        // Verificar si todas las cazas han sido destruidas
        if (hangar.cazasLaunched >= hangar.maxCazas && hangar.cazas.every(caza => caza.destroyed || caza.escaping)) {
            // Iniciar secuencia de huida
            hangar.destroyed = true; // Marcar hangar como destruido para que las cazas huyan
            hangar.hasEscaped = true;
            // Iniciar huida hacia arriba
            hangar.y -= canvas.height * 0.005;
            if (hangar.y + hangar.height < 0) {
                enemyHangars.splice(index, 1);
            }
        }
    });

    // Actualizar naves cazas
    enemyFighters.forEach(function(caza, index) {
        if (caza.escaping) {
            // Huye hacia arriba
            caza.y -= caza.speed;
            if (caza.y + caza.height < 0) {
                enemyFighters.splice(index, 1);
            }
            return;
        }

        // Verificar si el hangar está destruido o ha huido
        if (caza.hangar.destroyed || caza.hangar.hasEscaped) {
            caza.escaping = true;
            return;
        }

        if (caza.state === 'approaching') {
            // Moverse hacia la nave defensora
            if (baseShip && !baseShip.destroyed) {
                const dx = baseShip.x - caza.x;
                const dy = baseShip.y - caza.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > canvas.width * 0.1) {
                    caza.x += (dx / distance) * caza.speed;
                    caza.y += (dy / distance) * caza.speed;
                } else {
                    caza.state = 'attacking';
                }
            } else {
                // Si no hay nave defensora, moverse hacia abajo
                caza.y += caza.speed;
            }
        }

        if (caza.state === 'attacking') {
            // Mantenerse cerca de la nave defensora
            if (baseShip && !baseShip.destroyed) {
                caza.x += (Math.random() - 0.5) * caza.speed;
                caza.y += (Math.random() - 0.5) * caza.speed;
            }

            // Disparar proyectiles de energía en ráfagas
            if (!caza.isBursting && currentTime - caza.lastShotTime >= caza.shotInterval) {
                caza.isBursting = true;
                caza.lastShotTime = currentTime;
                caza.burstShotsFired = 0;
                caza.burstShotsTotal = 3;
            }

            if (caza.isBursting) {
                if (caza.burstShotsFired < caza.burstShotsTotal && currentTime - caza.lastShotTime >= 100) {
                    caza.lastShotTime = currentTime;
                    caza.burstShotsFired++;
                    const dx = baseShip.x - caza.x;
                    const dy = baseShip.y - caza.y;
                    const angle = Math.atan2(dy, dx);
                    energyBullets.push({
                        x: caza.x,
                        y: caza.y,
                        vx: Math.cos(angle) * canvas.width * 0.005,
                        vy: Math.sin(angle) * canvas.height * 0.005,
                        size: 2,
                        damage: 1,
                        owner: 'caza',
                        lifeTime: 500 // Vida útil de la bala en ms
                    });
                } else if (caza.burstShotsFired >= caza.burstShotsTotal) {
                    caza.isBursting = false;
                }
            }
        }

        // Evasión de misiles
        playerMissiles.forEach(function(missile) {
            const dx = missile.x - caza.x;
            const dy = missile.y - caza.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < canvas.width * 0.1) {
                // Cambiar dirección para evadir
                caza.x += (Math.random() - 0.5) * caza.speed * 2;
                caza.y += (Math.random() - 0.5) * caza.speed * 2;
            }
        });

        // Eliminar si sale de la pantalla
        if (caza.y > canvas.height) {
            enemyFighters.splice(index, 1);
        }
    });

    // Actualizar misiles enemigos
    enemyMissiles.forEach(function(missile, index) {
        const dx = missile.targetX - missile.x;
        const dy = missile.targetY - missile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / distance) * missile.speed;
        const moveY = (dy / distance) * missile.speed;

        missile.x += moveX;
        missile.y += moveY;

        // Verificar colisión con la nave de defensa
        if (baseShip && !baseShip.destroyed && checkCollision(baseShip, missile)) {
            // Destruir el misil y reducir vida de la nave o escudo
            createExplosion(missile.x, missile.y, false);
            enemyMissiles.splice(index, 1);
            if (shieldEnergy > 0) {
                shieldEnergy -= 20;
                if (shieldEnergy <= 0) {
                    shieldEnergy = 0;
                    shieldActive = false;
                }
            } else {
                baseShipHealth--;
                if (baseShipHealth <= 0) {
                    baseShip.destroyed = true;
                }
            }
        }

        if (distance < missile.speed) {
            // Explosión al llegar al destino
            createExplosion(missile.x, missile.y, false);
            enemyMissiles.splice(index, 1);

            // Destruir ciudad
            cities.forEach(function(city) {
                if (!city.destroyed && checkCollision(city, missile)) {
                    city.destroyed = true;
                }
            });
        }

        // Generar partículas para la estela
        for (let i = 0; i < 3; i++) { // Aumentar el número para alargar la estela
            createParticle(missile.x, missile.y, missile.angle, 'enemy');
        }
    });

    // Actualizar misiles del jugador
    playerMissiles.forEach(function(missile, index) {
        const dx = missile.targetX - missile.x;
        const dy = missile.targetY - missile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / distance) * missile.speed;
        const moveY = (dy / distance) * missile.speed;

        missile.x += moveX;
        missile.y += moveY;

        if (distance < missile.speed) {
            // Explosión al llegar al destino
            createExplosion(missile.x, missile.y, true);
            playerMissiles.splice(index, 1);
        }

        // Generar partículas para la estela
        for (let i = 0; i < 3; i++) { // Aumentar el número para alargar la estela
            createParticle(missile.x, missile.y, missile.angle, 'player');
        }
    });

    // Actualizar partículas
    particles = particles.filter(function(particle) {
        particle.life -= 1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity = particle.life / particle.maxLife;
        return particle.life > 0;
    });

    // Actualizar proyectiles de energía
    energyBullets.forEach(function(bullet, index) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.lifeTime -= 16; // Aproximadamente 60 FPS

        if (bullet.owner === 'hangar' || bullet.owner === 'caza') {
            // Verificar colisión con la nave defensora
            if (baseShip && !baseShip.destroyed && checkCollision(baseShip, bullet)) {
                if (shieldEnergy > 0) {
                    shieldEnergy -= bullet.damage * 10;
                    if (shieldEnergy <= 0) {
                        shieldEnergy = 0;
                        shieldActive = false;
                    }
                } else {
                    baseShipHealth -= bullet.damage;
                    if (baseShipHealth <= 0) {
                        baseShip.destroyed = true;
                    }
                }
                energyBullets.splice(index, 1);
            }
            // Verificar colisión con misiles del jugador
            playerMissiles.forEach(function(missile, mIndex) {
                if (checkCollision(missile, bullet)) {
                    createExplosion(missile.x, missile.y, false);
                    playerMissiles.splice(mIndex, 1);
                    energyBullets.splice(index, 1);
                }
            });
        } else if (bullet.owner === 'playerTurret') {
            // Verificar colisión con enemigos
            const targets = enemyMissiles.concat(enemyShips, enemyHangars, enemyFighters);
            targets.forEach(function(target, tIndex) {
                if (!target.destroyed && checkCollision(target, bullet)) {
                    target.health -= bullet.damage;
                    if (target.health <= 0) {
                        target.destroyed = true;
                        createExplosion(target.x, target.y, false);
                        if (enemyMissiles.includes(target)) {
                            enemyMissiles.splice(enemyMissiles.indexOf(target), 1);
                            score += 5;
                            coinsToSpend += 3;
                        } else if (enemyShips.includes(target)) {
                            enemyShips.splice(enemyShips.indexOf(target), 1);
                            score += 15;
                            coinsToSpend += 10;
                        } else if (enemyHangars.includes(target)) {
                            enemyHangars.splice(enemyHangars.indexOf(target), 1);
                            score += 100;
                            coinsToSpend += 50;
                        } else if (enemyFighters.includes(target)) {
                            enemyFighters.splice(enemyFighters.indexOf(target), 1);
                            score += 20;
                            coinsToSpend += 15;
                        }
                        document.getElementById('score').innerText = score;
                        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                    }
                    energyBullets.splice(index, 1);
                }
            });
        }

        // Eliminar si sale de la pantalla o si su vida útil termina
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height || bullet.lifeTime <= 0) {
            energyBullets.splice(index, 1);
        }
    });

    // Actualizar explosiones
    explosions.forEach(function(explosion, index) {
        // Crear partículas para la explosión
        for (let i = 0; i < 10; i++) {
            createExplosionParticle(explosion.x, explosion.y, explosion.size);
        }

        explosion.opacity -= explosion.fadeRate;
        if (explosion.opacity <= 0) {
            explosions.splice(index, 1);
        } else {
            // Verificar colisiones con misiles enemigos
            enemyMissiles.forEach(function(missile, mIndex) {
                const dx = missile.x - explosion.x;
                const dy = missile.y - explosion.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.size) {
                    if (!explosion.affectedMissiles) {
                        explosion.affectedMissiles = [];
                    }
                    if (!explosion.affectedMissiles.includes(missile)) {
                        createExplosion(missile.x, missile.y, false);
                        enemyMissiles.splice(mIndex, 1);
                        score += 5;
                        coinsToSpend += 3; // Recompensa incrementada
                        document.getElementById('score').innerText = score;
                        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        explosion.affectedMissiles.push(missile);
                    }
                }
            });
            // Verificar colisiones con naves enemigas tipo naveMisiles
            enemyShips.forEach(function(ship, sIndex) {
                const dx = ship.x - explosion.x;
                const dy = ship.y - explosion.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.size) {
                    if (!explosion.affectedShips) {
                        explosion.affectedShips = [];
                    }
                    if (!explosion.affectedShips.includes(ship)) {
                        ship.health -= missileDamage; // Daño basado en mejora
                        explosion.affectedShips.push(ship); // Marcar nave como afectada
                        if (ship.health <= 0) {
                            createExplosion(ship.x, ship.y, false);
                            enemyShips.splice(sIndex, 1);
                            score += 15; // Recompensa ajustada
                            coinsToSpend += 10; // Recompensa ajustada
                            document.getElementById('score').innerText = score;
                            document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        }
                    }
                }
            });
            // Verificar colisiones con naves enemigas tipo naveHangar
            enemyHangars.forEach(function(hangar, hIndex) {
                const dx = hangar.x - explosion.x;
                const dy = hangar.y - explosion.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.size) {
                    if (!explosion.affectedHangars) {
                        explosion.affectedHangars = [];
                    }
                    if (!explosion.affectedHangars.includes(hangar)) {
                        hangar.health -= missileDamage;
                        explosion.affectedHangars.push(hangar);
                        if (hangar.health <= 0) {
                            createExplosion(hangar.x, hangar.y, false);
                            hangar.destroyed = true;
                            enemyHangars.splice(hIndex, 1);
                            score += 100; // Mayor recompensa
                            coinsToSpend += 50; // Mayor recompensa
                            document.getElementById('score').innerText = score;
                            document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        }
                    }
                }
            });
            // Verificar colisiones con naves cazas
            enemyFighters.forEach(function(caza, cIndex) {
                const dx = caza.x - explosion.x;
                const dy = caza.y - explosion.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.size) {
                    if (!explosion.affectedCazas) {
                        explosion.affectedCazas = [];
                    }
                    if (!explosion.affectedCazas.includes(caza)) {
                        caza.health -= missileDamage;
                        explosion.affectedCazas.push(caza);
                        if (caza.health <= 0) {
                            createExplosion(caza.x, caza.y, false);
                            caza.destroyed = true;
                            enemyFighters.splice(cIndex, 1);
                            score += 20; // Recompensa ajustada
                            coinsToSpend += 15; // Recompensa ajustada
                            document.getElementById('score').innerText = score;
                            document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        }
                    }
                }
            });
        }
    });

    // Verificar si el juego ha terminado
    if ((cities.every(city => city.destroyed)) || (baseShip.destroyed || !baseShip)) {
        // Fin del juego
        alert('¡Fin del juego! Puntos: ' + score);
        initGame(); // Reiniciar el juego completamente
        return;
    }

    // Verificar si la oleada ha terminado
    if (enemyShips.length === 0 && enemyHangars.length === 0 && enemyFighters.length === 0 && enemyMissiles.length === 0 && explosions.length === 0) {
        // Oleada completada
        coinsToSpend += 20; // Recompensa incrementada
        wave++;
        document.getElementById('wave').innerText = wave;
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
        showUpgradeMenu();
    }
}

// Funciones para crear partículas y explosiones

// Función para crear partículas de estela
function createParticle(x, y, angle, type) {
    const speed = Math.random() * 1 + 0.5;
    const particleAngle = angle + (Math.random() * 0.4 - 0.2); // Variación aleatoria
    const lifeSpan = 50; // Aumentar la vida para alargar la estela
    particles.push({
        x: x,
        y: y,
        vx: -Math.cos(particleAngle) * speed,
        vy: -Math.sin(particleAngle) * speed,
        size: Math.random() * 2 + 1,
        life: lifeSpan,
        maxLife: lifeSpan,
        opacity: 1,
        type: type
    });
}

// Función para crear partículas de explosión
function createExplosionParticle(x, y, explosionSize) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 2 + 1;
    const lifeSpan = Math.random() * 20 + 20;
    particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * (explosionSize / 10) + 1,
        life: lifeSpan,
        maxLife: lifeSpan,
        opacity: 1,
        type: 'explosion'
    });
}

// Crear explosión
function createExplosion(x, y, isPlayerExplosion) {
    const sizeMultiplier = isPlayerExplosion ? explosionSizeMultiplier : 1;
    const durationMultiplier = isPlayerExplosion ? explosionDurationMultiplier : 1;
    const maxRadius = canvas.height * 0.005 * sizeMultiplier * 10;
    const duration = 60 * durationMultiplier;
    explosions.push({
        x: x,
        y: y,
        size: maxRadius,
        opacity: 1,
        fadeRate: 1 / duration,
        affectedShips: [],
        affectedHangars: [],
        affectedCazas: [],
        affectedMissiles: []
    });
}

// Dibujar elementos en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar partículas
    particles.forEach(function(particle) {
        ctx.globalAlpha = particle.opacity;
        if (particle.type === 'player') {
            ctx.fillStyle = `rgba(173,216,230,${particle.opacity})`; // Color azul claro
        } else if (particle.type === 'enemy') {
            ctx.fillStyle = `rgba(255,140,0,${particle.opacity})`; // Color naranja
        } else if (particle.type === 'explosion') {
            // De amarillo brillante a rojo y luego transparente
            const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
            gradient.addColorStop(0, `rgba(255, 255, 0,${particle.opacity})`); // Amarillo
            gradient.addColorStop(0.5, `rgba(255, 140, 0,${particle.opacity})`); // Naranja
            gradient.addColorStop(1, `rgba(255, 0, 0,${particle.opacity})`); // Rojo
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Dibujar misiles enemigos
    enemyMissiles.forEach(function(missile) {
        // Dibujar misil enemigo
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(missile.angle);
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });

    // Dibujar misiles del jugador
    playerMissiles.forEach(function(missile) {
        // Dibujar misil del jugador
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(missile.angle);
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });

    // Dibujar proyectiles de energía
    energyBullets.forEach(function(bullet) {
        if (bullet.owner === 'playerTurret') {
            ctx.fillStyle = 'lightgreen';
        } else {
            ctx.fillStyle = 'yellow';
        }
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
        // Dibujar barra de vida debajo de la nave
        const healthBarWidth = baseShip.width;
        const healthBarX = baseShip.x - healthBarWidth / 2;
        const healthBarY = baseShip.y + baseShip.height / 2 + 5;
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (baseShipHealth / baseShipMaxHealth), 5);

        // Dibujar escudo
        if (shieldEnergy > 0) {
            const shieldOpacity = shieldEnergy / shieldCapacity;
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

    // Dibujar naves enemigas tipo naveMisiles
    enemyShips.forEach(function(ship) {
        ctx.fillStyle = 'red';
        ctx.fillRect(ship.x - ship.width / 2, ship.y - ship.height / 2, ship.width, ship.height);
        // Dibujar barra de vida debajo de la nave enemiga
        const healthBarWidth = ship.width;
        const healthBarX = ship.x - healthBarWidth / 2;
        const healthBarY = ship.y + ship.height / 2 + 5;
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (ship.health / ship.maxHealth), 5);
    });

    // Dibujar naves enemigas tipo naveHangar
    enemyHangars.forEach(function(hangar) {
        ctx.fillStyle = 'purple';
        ctx.fillRect(hangar.x - hangar.width / 2, hangar.y - hangar.height / 2, hangar.width, hangar.height);
        // Dibujar barra de vida debajo de la nave hangar
        const healthBarWidth = hangar.width;
        const healthBarX = hangar.x - healthBarWidth / 2;
        const healthBarY = hangar.y + hangar.height / 2 + 5;
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (hangar.health / hangar.maxHealth), 5);
    });

    // Dibujar naves cazas
    enemyFighters.forEach(function(caza) {
        ctx.fillStyle = 'orange';
        ctx.fillRect(caza.x - caza.width / 2, caza.y - caza.height / 2, caza.width, caza.height);
        // Dibujar barra de vida debajo de la nave caza
        const healthBarWidth = caza.width;
        const healthBarX = caza.x - healthBarWidth / 2;
        const healthBarY = caza.y + caza.height / 2 + 5;
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (caza.health / caza.maxHealth), 5);

        // Dibujar estela doble
        const leftEngineX = caza.x - caza.width / 4;
        const rightEngineX = caza.x + caza.width / 4;
        const engineY = caza.y + caza.height / 2;
        createParticle(leftEngineX, engineY, Math.PI / 2, 'enemy');
        createParticle(rightEngineX, engineY, Math.PI / 2, 'enemy');
    });
}

// Mostrar menú de mejoras
function showUpgradeMenu() {
    gamePaused = true;
    canShoot = false;
    document.getElementById('coinsToSpend').innerText = Math.floor(coinsToSpend);
    updateUpgradeMenu();
    document.getElementById('upgradeMenu').style.display = 'block';
}

// Event listeners para botones de mejora
document.getElementById('continueButton').addEventListener('click', function() {
    gamePaused = false;
    canShoot = true;
    document.getElementById('upgradeMenu').style.display = 'none';
    startWave(); // Reiniciar la siguiente oleada
});

document.getElementById('upgradeButton').addEventListener('click', function() {
    showUpgradeMenu();
});

document.getElementById('upgradeMissileLimit').addEventListener('click', function() {
    if (coinsToSpend >= costMissileLimit) {
        coinsToSpend -= costMissileLimit;
        missileLimit++;
        costMissileLimit *= 1.2; // Ajuste del factor de costo
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

document.getElementById('upgradeMissileSpeed').addEventListener('click', function() {
    if (coinsToSpend >= costMissileSpeed) {
        coinsToSpend -= costMissileSpeed;
        missileSpeedMultiplier += 0.1;
        costMissileSpeed *= 1.2; // Ajuste del factor de costo
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

document.getElementById('upgradeExplosionSize').addEventListener('click', function() {
    if (coinsToSpend >= costExplosionSize) {
        coinsToSpend -= costExplosionSize;
        explosionSizeMultiplier += 0.1;
        costExplosionSize *= 1.2; // Ajuste del factor de costo
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para reparar la nave base
document.getElementById('repairBaseShip').addEventListener('click', function() {
    if (baseShipHealth < baseShipMaxHealth && coinsToSpend >= 5) {
        coinsToSpend -= 5;
        baseShipHealth++;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para aumentar la vida máxima de la nave base
document.getElementById('upgradeBaseShipHealth').addEventListener('click', function() {
    if (coinsToSpend >= costUpgradeBaseShipHealth) {
        coinsToSpend -= costUpgradeBaseShipHealth;
        baseShipMaxHealth++;
        baseShipHealth = baseShipMaxHealth;
        costUpgradeBaseShipHealth *= 1.5;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para comprar misiles
document.getElementById('buyMissiles').addEventListener('click', function() {
    if (coinsToSpend >= 5 && baseShipMissiles + 5 <= maxMissiles) {
        coinsToSpend -= 5;
        baseShipMissiles += 5;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
        document.getElementById('baseShipMissiles').innerText = baseShipMissiles;
    }
});

// Evento para mejora de daño de misiles
document.getElementById('upgradeMissileDamage').addEventListener('click', function() {
    if (coinsToSpend >= costMissileDamage) {
        coinsToSpend -= costMissileDamage;
        missileDamage++;
        costMissileDamage *= 1.3;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para comprar ametralladora
document.getElementById('buyTurret').addEventListener('click', function() {
    if (turretCount < maxTurrets && coinsToSpend >= costTurret) {
        coinsToSpend -= costTurret;
        turretCount++;
        costTurret *= 1.5;
        // Añadir una nueva ametralladora
        turrets.push({
            offsetX: (turretCount - 3) * 20, // Distribuirlas en la nave
            offsetY: -baseShip.height / 2,
            lastShotTime: 0
        });
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para mejorar alcance de ametralladoras
document.getElementById('upgradeTurretRange').addEventListener('click', function() {
    if (coinsToSpend >= costTurretRange) {
        coinsToSpend -= costTurretRange;
        turretRange *= 1.1;
        costTurretRange *= 1.2;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para mejorar daño de ametralladoras
document.getElementById('upgradeTurretDamage').addEventListener('click', function() {
    if (coinsToSpend >= costTurretDamage) {
        coinsToSpend -= costTurretDamage;
        turretDamage += 1;
        costTurretDamage *= 1.3;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para mejorar capacidad del escudo
document.getElementById('upgradeShieldCapacity').addEventListener('click', function() {
    if (coinsToSpend >= costShieldCapacity) {
        coinsToSpend -= costShieldCapacity;
        shieldCapacity *= 1.2;
        shieldEnergy = shieldCapacity;
        costShieldCapacity *= 1.5;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Botón para mejorar regeneración del escudo
document.getElementById('upgradeShieldRegen').addEventListener('click', function() {
    if (coinsToSpend >= costShieldRegen) {
        coinsToSpend -= costShieldRegen;
        shieldRegenRate *= 1.1;
        costShieldRegen *= 1.4;
        updateUpgradeMenu();
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    }
});

// Actualizar menú de mejoras
function updateUpgradeMenu() {
    document.getElementById('coinsToSpend').innerText = Math.floor(coinsToSpend);

    document.getElementById('costMissileLimit').innerText = Math.ceil(costMissileLimit);
    document.getElementById('costMissileSpeed').innerText = Math.ceil(costMissileSpeed);
    document.getElementById('costExplosionSize').innerText = Math.ceil(costExplosionSize);
    document.getElementById('costMissileDamage').innerText = Math.ceil(costMissileDamage);

    // Mostrar valores actuales
    document.getElementById('currentMissileLimit').innerText = missileLimit;
    document.getElementById('currentMissileSpeed').innerText = missileSpeedMultiplier.toFixed(2);
    document.getElementById('currentExplosionSize').innerText = explosionSizeMultiplier.toFixed(2);
    document.getElementById('currentMissileDamage').innerText = missileDamage;

    // Actualizar información de la nave base
    document.getElementById('currentBaseShipHealth').innerText = baseShipHealth;
    document.getElementById('maxBaseShipHealth').innerText = baseShipMaxHealth;
    document.getElementById('maxBaseShipHealthDisplay').innerText = baseShipMaxHealth;

    // Actualizar misiles
    document.getElementById('currentMissiles').innerText = baseShipMissiles;
    document.getElementById('maxMissiles').innerText = maxMissiles;

    document.getElementById('costUpgradeBaseShipHealth').innerText = Math.ceil(costUpgradeBaseShipHealth);

    // Actualizar ametralladoras
    document.getElementById('currentTurretCount').innerText = turretCount;
    document.getElementById('costTurret').innerText = Math.ceil(costTurret);
    document.getElementById('costTurretRange').innerText = Math.ceil(costTurretRange);
    document.getElementById('currentTurretRange').innerText = Math.floor(turretRange);
    document.getElementById('costTurretDamage').innerText = Math.ceil(costTurretDamage);
    document.getElementById('currentTurretDamage').innerText = turretDamage;

    // Actualizar escudo
    document.getElementById('costShieldCapacity').innerText = Math.ceil(costShieldCapacity);
    document.getElementById('currentShieldCapacity').innerText = Math.floor(shieldCapacity);
    document.getElementById('costShieldRegen').innerText = Math.ceil(costShieldRegen);
    document.getElementById('currentShieldRegen').innerText = shieldRegenRate.toFixed(2);

    // Actualizar misiles en el marcador principal
    document.getElementById('baseShipMissiles').innerText = baseShipMissiles;
}

// Función para verificar colisiones
function checkCollision(obj, missile) {
    return (
        missile.x > obj.x - obj.width / 2 &&
        missile.x < obj.x + obj.width / 2 &&
        missile.y > obj.y - obj.height / 2 &&
        missile.y < obj.y + obj.height / 2
    );
}

// Iniciar el juego al cargar la página
initGame();

