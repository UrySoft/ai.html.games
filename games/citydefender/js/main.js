// main.js
import { BaseShip } from './modules/BaseShip.js';
import { EnemyShip } from './modules/EnemyShip.js';
import { EnemyHangar } from './modules/EnemyHangar.js';
import { EnemyFighter } from './modules/EnemyFighter.js';
import { Missile } from './modules/Missile.js';
import { Turret } from './modules/Turret.js';
import { Particle } from './modules/Particle.js';
import { Explosion } from './modules/Explosion.js';
import { Utils } from './modules/Utils.js';

// Variables y constantes
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let baseShip = null; // Nave base flotante
let shield = null; // Escudo de energía
let turrets = []; // Array de ametralladoras
let cities = [];
let enemyMissiles = [];
let playerMissiles = [];
let explosions = [];
let enemyShips = [];
let enemyHangars = [];
let enemyFighters = [];
let energyBullets = [];
let particles = [];

let score = 0;
let wave = 1;
let coinsToSpend = 9999;

let gamePaused = false;

// Inicializar el juego
function initGame() {
    // Ajustar el tamaño del canvas
    resizeCanvas();

    // Inicializar componentes
    baseShip = new BaseShip(canvas.width / 2, canvas.height * 0.75, canvas.width, canvas.height);
    shield = baseShip.shield;
    cities = Utils.generateCities(canvas, 20);
    turrets = [];
    enemyMissiles = [];
    playerMissiles = [];
    explosions = [];
    enemyShips = [];
    enemyHangars = [];
    enemyFighters = [];
    energyBullets = [];
    particles = [];

    score = 0;
    wave = 1;
    coinsToSpend = 9999;

    document.getElementById('score').innerText = score;
    document.getElementById('wave').innerText = wave;
    document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    document.getElementById('baseShipMissiles').innerText = baseShip.missiles;

    updateUpgradeMenu();

    startWave();
}

// Ajustar el tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 40; // Restar espacio para el botón de mejoras
    initGame();
}

window.addEventListener('resize', resizeCanvas);

// Manejar interacción del jugador
function handleInteraction(event) {
    event.preventDefault();
    if (!baseShip.canShoot || gamePaused) return;

    const pointer = Utils.getPointerPosition(event, canvas);
    baseShip.shoot(pointer.x, pointer.y, playerMissiles, Utils);
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

// Iniciar oleada
function startWave() {
    gamePaused = false;
    baseShip.canShoot = true;
    EnemyShip.spawnWave(wave, canvas, enemyShips, enemyMissiles, cities, Utils);
    EnemyHangar.spawnWave(wave, canvas, enemyHangars, enemyFighters, Utils);
    requestAnimationFrame(gameLoop);
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
    const deltaTime = Utils.getDeltaTime();
    // Actualizar componentes
    baseShip.update(deltaTime, canvas);
    turrets.forEach(turret => turret.update(deltaTime, enemyShips, enemyMissiles, enemyHangars, enemyFighters, energyBullets, Utils));
    enemyShips.forEach(ship => ship.update(deltaTime, enemyMissiles, cities, Utils));
    enemyHangars.forEach(hangar => hangar.update(deltaTime, enemyFighters, energyBullets, Utils));
    enemyFighters.forEach(fighter => fighter.update(deltaTime, playerMissiles, energyBullets, baseShip, Utils));
    playerMissiles.forEach(missile => missile.update(deltaTime, enemyShips, enemyHangars, cities, explosions, Utils));
    enemyMissiles.forEach(missile => missile.update(deltaTime, baseShip, explosions, Utils));
    energyBullets.forEach(bullet => bullet.update(deltaTime, baseShip, playerMissiles, enemyShips, enemyHangars, enemyFighters, explosions, coinsToSpend, score, Utils));
    explosions.forEach(explosion => explosion.update(deltaTime, enemyShips, enemyHangars, enemyFighters, enemyMissiles, playerMissiles, Utils));
    particles.forEach(particle => particle.update(deltaTime));

    // Limpiar arrays de objetos destruidos
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
        document.getElementById('score').innerText = score;
        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
        wave++;
        showUpgradeMenu();
    }
}

// Dibujar elementos en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cities.forEach(city => city.draw(ctx));
    baseShip.draw(ctx);
    turrets.forEach(turret => turret.draw(ctx));
    enemyShips.forEach(ship => ship.draw(ctx));
    enemyHangars.forEach(hangar => hangar.draw(ctx));
    enemyFighters.forEach(fighter => fighter.draw(ctx));
    playerMissiles.forEach(missile => missile.draw(ctx));
    enemyMissiles.forEach(missile => missile.draw(ctx));
    energyBullets.forEach(bullet => bullet.draw(ctx));
    explosions.forEach(explosion => explosion.draw(ctx));
    particles.forEach(particle => particle.draw(ctx));
}

// Mostrar menú de mejoras
function showUpgradeMenu() {
    gamePaused = true;
    baseShip.canShoot = false;
    document.getElementById('coinsToSpend').innerText = Math.floor(coinsToSpend);
    updateUpgradeMenu();
    document.getElementById('upgradeMenu').style.display = 'block';
}

// Event listeners para botones de mejora
// (Mantén aquí todos los event listeners para los botones, similar a cómo lo hiciste antes)

initGame();
