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

// Variables y constantes
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let baseShip = null; // Nave base flotante
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
    Utils.baseShip = baseShip; // Asignar baseShip a Utils para acceso global
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

    updateScoreDisplay();
    updateWaveDisplay();
    updateCoinsDisplay();
    updateMissilesDisplay();

    setupTurrets();

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
    if (playerMissiles.length >= baseShip.missiles) return;

    const pointer = Utils.getPointerPosition(event, canvas);
    baseShip.shoot(pointer.x, pointer.y, playerMissiles, Utils);
    updateMissilesDisplay();
}

canvas.addEvent
