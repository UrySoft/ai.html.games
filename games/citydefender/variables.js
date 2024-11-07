/* variables.js */
// Variables y constantes
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var baseShip = null; // Nave base flotante
var baseShipHealth = 6; // Vida de la nave base
var baseShipMaxHealth = 6;

var shieldCapacity = 100; // Capacidad máxima del escudo (porcentaje)
var shieldEnergy = shieldCapacity; // Energía actual del escudo
var shieldRegenRate = 1; // Regeneración por segundo (porcentaje)
var shieldActive = true;

var turretCount = 0; // Número de ametralladoras
var maxTurrets = 5;
var turrets = []; // Array de ametralladoras
var turretRange = 200; // Alcance de las ametralladoras (duplicado)
var turretDamage = 1; // Daño de las ametralladoras
var turretFireRate = 1000; // Milisegundos entre disparos

var fighterCapacity = 0; // Capacidad actual de cazas
var maxFighterCapacity = 10; // Capacidad máxima de cazas
var fightersInHangar = 0; // Número de cazas en el hangar
var fighters = []; // Lista de cazas desplegados
var fighterSpeedMultiplier = 1.0; // Multiplicador de velocidad de los cazas (porcentaje)
var fighterHealth = 2; // Vida de los cazas
var fighterShield = false; // Escudo en cazas
var fighterShieldCapacity = 50; // Capacidad de escudo de cazas

var cities = [];
var enemyMissiles = [];
var playerMissiles = [];
var explosions = [];
var enemyShips = []; // Naves enemigas tipo naveMisiles
var enemyHangars = []; // Naves enemigas tipo naveHangar
var enemyFighters = []; // Naves enemigas tipo naveCaza

var energyBullets = []; // Proyectiles de energía

var score = 0;
var wave = 1;
var enemyShipsPerWave = 1;
var enemyHangarsPerWave = 0;

var missileLimit = 2;

var missileSpeedMultiplier = 1.00; // Porcentaje
var explosionSizeMultiplier = 1.00; // Porcentaje
var explosionDurationMultiplier = 1.00;

var missileDamage = 1; // Daño inicial de los misiles del jugador

var canShoot = true;
var coinsToSpend = 9999; // Jugador inicia con 9999 coins

var gamePaused = false; // Variable para controlar el estado del juego

// Ajuste de costos iniciales
var costMissileLimit = 10;      // Costo inicial de Misiles simultáneos
var costExplosionSize = 20;     // Costo inicial de Tamaño explosión
var costMissileSpeed = 10;      // Costo inicial de Velocidad misiles
var costMissileDamage = 25;     // Costo inicial de Daño de misiles

var costUpgradeBaseShipHealth = 20; // Costo de aumentar la vida máxima de la nave base

var costTurret = 100;           // Costo inicial de la ametralladora
var costTurretRange = 50;       // Costo de mejorar alcance
var costTurretDamage = 75;      // Costo de mejorar potencia

var costShieldCapacity = 100;   // Costo de mejorar capacidad del escudo
var costShieldRegen = 80;       // Costo de mejorar regeneración del escudo

var costFighterCapacity = 50;   // Costo de aumentar capacidad de cazas
var costFighter = 30;           // Costo de fabricar un caza
var costFighterSpeed = 40;      // Costo de mejorar velocidad de cazas
var costFighterHealth = 35;     // Costo de mejorar vida de cazas
var costFighterShield = 50;     // Costo de añadir escudo a cazas

var particles = []; // Array para las partículas (misiles y explosiones)

var lastUpdateTime = Date.now(); // Inicializar lastUpdateTime
