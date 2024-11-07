// js/main.js
import { BaseShip } from './modules/BaseShip.js';
import { EnemyShip } from './modules/EnemyShip.js';
import { EnemyHangar } from './modules/EnemyHangar.js';
import { EnemyFighter } from './modules/EnemyFighter.js';
import { Missile } from './modules/Missile.js';
import { Turret } from './modules/Turret.js';
import { Particle } from './modules/Particle.js';
import { Explosion } from './modules/Explosion.js';
import { Utils } from './modules/Utils.js';

// Obtener elementos del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 40; // Restar espacio para el botón de mejoras
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables del juego
let baseShip = null; // Nave base del jugador
let turrets = []; // Array de ametralladoras
let cities = []; // Array de ciudades
let enemyShips = []; // Array de naves enemigas tipo "naveMisiles"
let enemyHangars = []; // Array de naves enemigas tipo "naveHangar"
let enemyFighters = []; // Array de naves enemigas tipo "naveCaza"
let enemyMissiles = []; // Array de misiles enemigos
let playerMissiles = []; // Array de misiles del jugador
let energyBullets = []; // Array de proyectiles de energía
let explosions = []; // Array de explosiones
let particles = []; // Array de partículas

let score = 0;
let wave = 1;
let coinsToSpend = 9999;

let gamePaused = false;

// Inicializar el juego
function initGame() {
    // Limpiar arrays existentes
    turrets = [];
    cities = [];
    enemyShips = [];
    enemyHangars = [];
    enemyFighters = [];
    enemyMissiles = [];
    playerMissiles = [];
    energyBullets = [];
    explosions = [];
    particles = [];

    // Crear nave base
    baseShip = new BaseShip(canvas.width / 2, canvas.height * 0.75, canvas.width, canvas.height);
    Utils.baseShip = baseShip; // Asignar a Utils para acceso global

    // Generar ciudades
    cities = Utils.generateCities(canvas, 20);

    // Reiniciar puntuación y monedas
    score = 0;
    wave = 1;
    coinsToSpend = 9999;

    // Actualizar UI
    updateScore();
    updateWave();
    updateCoins();
    updateMissiles();

    // Iniciar primera oleada
    startWave();
}

// Actualizar UI
function updateScore() {
    document.getElementById('score').innerText = score;
}

function updateWave() {
    document.getElementById('wave').innerText = wave;
}

function updateCoins() {
    document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
}

function updateMissiles() {
    document.getElementById('baseShipMissiles').innerText = baseShip.missiles;
}

// Manejar interacción del jugador
function handleInteraction(event) {
    event.preventDefault();
    if (!baseShip.canShoot || gamePaused) return;
    if (playerMissiles.length >= baseShip.missiles) return;

    const pointer = Utils.getPointerPosition(event, canvas);
    baseShip.shoot(pointer.x, pointer.y, playerMissiles, Utils);

    updateMissiles();
}
canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

// Iniciar oleada
function startWave() {
    gamePaused = false;
    baseShip.canShoot = true;
    // Generar enemigos según la oleada
    EnemyShip.spawnWave(wave, canvas, enemyShips, enemyMissiles, cities, Utils);
    EnemyHangar.spawnWave(wave, canvas, enemyHangars, enemyFighters, Utils);
    // Iniciar bucle del juego
    requestAnimationFrame(gameLoop);
}

// Bucle principal del juego
function gameLoop() {
    if (!gamePaused) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Actualizar estado del juego
function update() {
    const deltaTime = Utils.getDeltaTime();

    // Actualizar componentes
    baseShip.update(deltaTime, canvas);
    turrets.forEach(turret => turret.update(deltaTime, enemyShips, enemyMissiles, enemyHangars, enemyFighters, energyBullets, Utils));
    enemyShips.forEach(ship => ship.update(deltaTime, enemyMissiles, cities, Utils));
    enemyHangars.forEach(hangar => hangar.update(deltaTime, enemyFighters, energyBullets, Utils));
    enemyFighters.forEach(fighter => fighter.update(deltaTime, playerMissiles, energyBullets, baseShip, Utils));
    playerMissiles.forEach(missile => missile.update(deltaTime, enemyShips, enemyHangars, cities, explosions, Utils));
    enemyMissiles.forEach(missile => missile.update(deltaTime, baseShip, explosions, Utils));
    energyBullets.forEach(bullet => bullet.update(deltaTime, baseShip, playerMissiles, enemyShips, enemyHangars, enemyFighters, explosions, Utils));
    explosions.forEach(explosion => explosion.update(deltaTime, enemyShips, enemyHangars, enemyFighters, enemyMissiles, playerMissiles, Utils));
    particles.forEach(particle => particle.update(deltaTime));

    // Limpiar arrays de objetos destruidos o fuera de pantalla
    Utils.cleanUpEntities(enemyShips, enemyMissiles, enemyHangars, enemyFighters, playerMissiles, energyBullets, explosions, particles);

    // Verificar condiciones de fin del juego
    if (Utils.isGameOver(cities, baseShip)) {
        Utils.endGame(score);
        initGame();
        return;
    }

    // Verificar si la oleada ha terminado
    if (Utils.isWaveCompleted(enemyShips, enemyHangars, enemyFighters, enemyMissiles, explosions)) {
        score += wave * 10;
        coinsToSpend += wave * 20;
        updateScore();
        updateCoins();
        wave++;
        updateWave();
        showUpgradeMenu();
    }
}

// Dibujar elementos en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar ciudades
    cities.forEach(city => city.draw(ctx));

    // Dibujar nave base
    baseShip.draw(ctx);

    // Dibujar ametralladoras
    turrets.forEach(turret => turret.draw(ctx));

    // Dibujar naves enemigas tipo "naveMisiles"
    enemyShips.forEach(ship => ship.draw(ctx));

    // Dibujar naves enemigas tipo "naveHangar"
    enemyHangars.forEach(hangar => hangar.draw(ctx));

    // Dibujar naves cazas
    enemyFighters.forEach(fighter => fighter.draw(ctx));

    // Dibujar misiles enemigos
    enemyMissiles.forEach(missile => missile.draw(ctx));

    // Dibujar misiles del jugador
    playerMissiles.forEach(missile => missile.draw(ctx));

    // Dibujar proyectiles de energía
    energyBullets.forEach(bullet => bullet.draw(ctx));

    // Dibujar explosiones
    explosions.forEach(explosion => explosion.draw(ctx));

    // Dibujar partículas
    particles.forEach(particle => particle.draw(ctx));
}

// Mostrar menú de mejoras
function showUpgradeMenu() {
    gamePaused = true;
    baseShip.canShoot = false;
    document.getElementById('coinsToSpend').innerText = Math.floor(coinsToSpend);
    Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    document.getElementById('upgradeMenu').style.display = 'block';
}

// Ocultar menú de mejoras y continuar el juego
function continueGame() {
    gamePaused = false;
    baseShip.canShoot = true;
    document.getElementById('upgradeMenu').style.display = 'none';
    startWave();
}

// Event listeners para botones de mejora
document.getElementById('continueButton').addEventListener('click', continueGame);
document.getElementById('upgradeButton').addEventListener('click', showUpgradeMenu);

// Event listeners para botones de mejoras específicas
document.getElementById('upgradeMissileLimit').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costMissileLimit) {
        coinsToSpend -= Utils.costMissileLimit;
        Utils.upgradeMissileLimit();
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeMissileSpeed').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costMissileSpeed) {
        coinsToSpend -= Utils.costMissileSpeed;
        Utils.upgradeMissileSpeed();
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeExplosionSize').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costExplosionSize) {
        coinsToSpend -= Utils.costExplosionSize;
        Utils.upgradeExplosionSize();
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeMissileDamage').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costMissileDamage) {
        coinsToSpend -= Utils.costMissileDamage;
        Utils.upgradeMissileDamage();
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('repairBaseShip').addEventListener('click', function() {
    if (baseShip.health < baseShip.maxHealth && coinsToSpend >= 5) {
        coinsToSpend -= 5;
        baseShip.repair();
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeBaseShipHealth').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costUpgradeBaseShipHealth) {
        coinsToSpend -= Utils.costUpgradeBaseShipHealth;
        Utils.upgradeBaseShipHealth(baseShip);
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('buyMissiles').addEventListener('click', function() {
    if (coinsToSpend >= 5 && baseShip.missiles + 5 <= baseShip.maxMissiles) {
        coinsToSpend -= 5;
        baseShip.buyMissiles(5);
        updateMissiles();
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('buyTurret').addEventListener('click', function() {
    if (turrets.length < Utils.maxTurrets && coinsToSpend >= Utils.costTurret) {
        coinsToSpend -= Utils.costTurret;
        const newTurret = new Turret(turrets.length * 20 - (Utils.maxTurrets * 10), -baseShip.height / 2, baseShip, Utils);
        turrets.push(newTurret);
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeTurretRange').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costTurretRange) {
        coinsToSpend -= Utils.costTurretRange;
        Utils.upgradeTurretRange(turrets);
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeTurretDamage').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costTurretDamage) {
        coinsToSpend -= Utils.costTurretDamage;
        Utils.upgradeTurretDamage(turrets);
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeShieldCapacity').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costShieldCapacity) {
        coinsToSpend -= Utils.costShieldCapacity;
        Utils.upgradeShieldCapacity(baseShip);
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

document.getElementById('upgradeShieldRegen').addEventListener('click', function() {
    if (coinsToSpend >= Utils.costShieldRegen) {
        coinsToSpend -= Utils.costShieldRegen;
        Utils.upgradeShieldRegen(baseShip);
        updateCoins();
        Utils.updateUpgradeMenu(turrets, baseShip, coinsToSpend, score);
    }
});

// Iniciar el juego al cargar la página
initGame();

