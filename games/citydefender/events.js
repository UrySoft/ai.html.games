/* events.js */
// Obtener posición del puntero
function getPointerPosition(event) {
    var rect = canvas.getBoundingClientRect();
    var x, y;
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

    var pointer = getPointerPosition(event);
    if (baseShip && !baseShip.destroyed) {
        var dx = pointer.x - baseShip.x;
        var dy = pointer.y - baseShip.y;
        var angle = Math.atan2(dy, dx);

        playerMissiles.push({
            x: baseShip.x,
            y: baseShip.y,
            targetX: pointer.x,
            targetY: pointer.y,
            speed: canvas.height * 0.00125 * missileSpeedMultiplier,
            exploded: false,
            angle: angle
        });
    }
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

// Iniciar oleada
function startWave() {
    canShoot = true;
    var MAX_ENEMY_SHIPS = 5; // Máximo de naves enemigas por oleada
    enemyShipsPerWave = Math.min(Math.floor(wave / 2) + 1, MAX_ENEMY_SHIPS);
    enemyHangarsPerWave = Math.floor(wave / 3); // Cada 3 oleadas, una naveHangar más
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
            health: 3,
            maxHealth: 3,
            lastShotTime: Date.now() - Math.random() * 3000,
            retreatStartTime: null,
            angle: 0
        };
        enemyShips.push(enemyShip);
    }

    // Generar naves tipo naveHangar
    for (let i = 0; i < enemyHangarsPerWave; i++) {
        let hangar = {
            x: Math.random() * canvas.width,
            y: canvas.height * 0.15,
            width: canvas.width * 0.06,
            height: canvas.height * 0.04,
            speed: canvas.width * 0.0005,
            direction: Math.random() < 0.5 ? -1 : 1,
            health: 8,
            maxHealth: 8,
            lastBurstTime: null,
            isBursting: false,
            burstShotsFired: 0,
            burstShotsTotal: 5,
            burstShotInterval: 100,
            burstDuration: 2000,
            reloadTime: 4000,
            cazasLaunched: 0,
            maxCazas: 4,
            lastCazaLaunchTime: Date.now(),
            cazas: [],
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

// Manejo de pestañas en el menú de mejoras
var tabButtons = document.querySelectorAll('.tab-button');
var tabs = document.querySelectorAll('.tab');

tabButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        var targetTab = this.getAttribute('data-tab');

        tabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        this.classList.add('active');

        tabs.forEach(function(tab) {
            tab.classList.remove('active');
        });
        document.getElementById(targetTab).classList.add('active');
    });
});

// Event Listeners para botones de mejora
document.getElementById('continueButton').addEventListener('click', function() {
    gamePaused = false;
    canShoot = true;
    document.getElementById('upgradeMenu').style.display = 'none';
    startWave();
});

document.getElementById('upgradeButton').addEventListener('click', function() {
    showUpgradeMenu();
});

// Botones de mejoras
document.getElementById('upgradeMissileLimit').addEventListener('click', function() {
    if (coinsToSpend >= costMissileLimit) {
        coinsToSpend -= costMissileLimit;
        missileLimit++;
        costMissileLimit *= 1.2;
        updateUpgradeMenu();
    }
});

// Continúa añadiendo los event listeners para todos los botones de mejora siguiendo el mismo patrón.

// Gestión de cazas amigos y tácticas
document.getElementById('launchFightersButton').addEventListener('click', function() {
    launchFighters();
});

// Función para lanzar cazas
function launchFighters() {
    while (fightersInHangar > 0) {
        fightersInHangar--;
        let fighter = {
            x: baseShip.x,
            y: baseShip.y,
            width: canvas.width * 0.02,
            height: canvas.height * 0.015,
            speed: canvas.height * 0.001 * fighterSpeedMultiplier,
            health: fighterHealth,
            maxHealth: fighterHealth,
            shieldActive: fighterShield,
            shieldCapacity: fighterShield ? fighterShieldCapacity : 0,
            shieldEnergy: fighterShield ? fighterShieldCapacity : 0,
            destroyed: false,
            tactic: 'closest', // Por defecto
            lastShotTime: 0,
            shotInterval: 500
        };
        fighters.push(fighter);
    }
    updateFightersInHangarDisplay();
}

// Actualizar visualización de cazas en hangar
function updateFightersInHangarDisplay() {
    document.getElementById('fightersInHangar').innerText = fightersInHangar;
    document.getElementById('fightersInHangarMenu').innerText = fightersInHangar;
}

// Botón para mostrar el menú de tácticas
document.getElementById('tacticsButton').addEventListener('click', function() {
    showTacticsMenu();
});

// Función para mostrar el menú de tácticas
function showTacticsMenu() {
    gamePaused = true;
    canShoot = false;
    updateTacticsMenu();
    document.getElementById('tacticsMenu').style.display = 'block';
}

// Botón para cerrar el menú de tácticas
document.getElementById('closeTacticsButton').addEventListener('click', function() {
    gamePaused = false;
    canShoot = true;
    document.getElementById('tacticsMenu').style.display = 'none';
});

// Actualizar el menú de tácticas
function updateTacticsMenu() {
    var tacticsList = document.getElementById('tacticsList');
    tacticsList.innerHTML = '';
    fighters.forEach(function(fighter, index) {
        var div = document.createElement('div');
        div.innerHTML = `
            Caza ${index + 1}: 
            <select data-index="${index}">
                <option value="closest" ${fighter.tactic === 'closest' ? 'selected' : ''}>Atacar al más cercano</option>
                <option value="weakest" ${fighter.tactic === 'weakest' ? 'selected' : ''}>Atacar al más débil</option>
                <option value="strongest" ${fighter.tactic === 'strongest' ? 'selected' : ''}>Atacar al más fuerte</option>
            </select>
        `;
        tacticsList.appendChild(div);
    });

    // Añadir event listeners a los select
    var selects = tacticsList.querySelectorAll('select');
    selects.forEach(function(select) {
        select.addEventListener('change', function() {
            var index = parseInt(this.getAttribute('data-index'));
            fighters[index].tactic = this.value;
        });
    });
}

// Función para seleccionar el objetivo de un caza según su táctica
function selectFighterTarget(fighter) {
    let targets = enemyShips.concat(enemyHangars, enemyFighters, enemyMissiles).filter(obj => !obj.destroyed);
    if (targets.length === 0) return null;

    if (fighter.tactic === 'closest') {
        // Atacar al más cercano
        let minDistance = Infinity;
        let closestTarget = null;
        targets.forEach(function(target) {
            let dx = target.x - fighter.x;
            let dy = target.y - fighter.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                closestTarget = target;
            }
        });
        return closestTarget;
    } else if (fighter.tactic === 'weakest') {
        // Atacar al más débil
        let weakestTarget = targets.reduce((min, obj) => obj.health < min.health ? obj : min, targets[0]);
        return weakestTarget;
    } else if (fighter.tactic === 'strongest') {
        // Atacar al más fuerte
        let strongestTarget = targets.reduce((max, obj) => obj.health > max.health ? obj : max, targets[0]);
        return strongestTarget;
    }
    return null;
}

// Función para mostrar el menú de mejoras
function showUpgradeMenu() {
    gamePaused = true;
    canShoot = false;
    document.getElementById('coinsToSpend').innerText = Math.floor(coinsToSpend);
    updateUpgradeMenu();
    document.getElementById('upgradeMenu').style.display = 'block';
}

// Actualizar menú de mejoras
function updateUpgradeMenu() {
    document.getElementById('coinsToSpend').innerText = Math.floor(coinsToSpend);

    // Misiles
    document.getElementById('costMissileLimit').innerText = Math.ceil(costMissileLimit);
    document.getElementById('currentMissileLimit').innerText = missileLimit;
    document.getElementById('costMissileSpeed').innerText = Math.ceil(costMissileSpeed);
    document.getElementById('currentMissileSpeed').innerText = (missileSpeedMultiplier * 100).toFixed(0) + '%';
    document.getElementById('costExplosionSize').innerText = Math.ceil(costExplosionSize);
    document.getElementById('currentExplosionSize').innerText = (explosionSizeMultiplier * 100).toFixed(0) + '%';
    document.getElementById('costMissileDamage').innerText = Math.ceil(costMissileDamage);
    document.getElementById('currentMissileDamage').innerText = missileDamage;

    // Nave
    document.getElementById('currentBaseShipHealth').innerText = baseShipHealth;
    document.getElementById('maxBaseShipHealth').innerText = baseShipMaxHealth;
    document.getElementById('maxBaseShipHealthDisplay').innerText = baseShipMaxHealth;
    document.getElementById('costUpgradeBaseShipHealth').innerText = Math.ceil(costUpgradeBaseShipHealth);

    // Escudo
    document.getElementById('currentShieldCapacity').innerText = shieldCapacity.toFixed(0) + '%';
    document.getElementById('costShieldCapacity').innerText = Math.ceil(costShieldCapacity);
    document.getElementById('currentShieldRegen').innerText = shieldRegenRate.toFixed(0) + '%';
    document.getElementById('costShieldRegen').innerText = Math.ceil(costShieldRegen);

    // Ametralladoras
    document.getElementById('currentTurretCount').innerText = turretCount;
    document.getElementById('costTurret').innerText = Math.ceil(costTurret);
    document.getElementById('currentTurretRange').innerText = turretRange.toFixed(0) + '%';
    document.getElementById('costTurretRange').innerText = Math.ceil(costTurretRange);
    document.getElementById('currentTurretDamage').innerText = turretDamage;
    document.getElementById('costTurretDamage').innerText = Math.ceil(costTurretDamage);

    // Cazas
    document.getElementById('currentFighterCapacity').innerText = fighterCapacity;
    document.getElementById('costFighterCapacity').innerText = Math.ceil(costFighterCapacity);
    document.getElementById('fightersInHangarMenu').innerText = fightersInHangar;
    document.getElementById('currentFighterCapacityMenu').innerText = fighterCapacity;
    document.getElementById('costFighter').innerText = Math.ceil(costFighter);
    document.getElementById('currentFighterSpeed').innerText = (fighterSpeedMultiplier * 100).toFixed(0) + '%';
    document.getElementById('costFighterSpeed').innerText = Math.ceil(costFighterSpeed);
    document.getElementById('currentFighterHealth').innerText = fighterHealth;
    document.getElementById('costFighterHealth').innerText = Math.ceil(costFighterHealth);
    document.getElementById('fighterShieldStatus').innerText = fighterShield ? 'Activado' : 'Desactivado';
    document.getElementById('costFighterShield').innerText = Math.ceil(costFighterShield);

    // Actualizar coins disponibles
    document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
}

// Iniciar el juego al cargar la página
initGame();
