/* init.js */
// Ajuste del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80; // Restar espacio para los botones
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
    fighters = [];
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

    // Reiniciar escudo
    shieldCapacity = 100;
    shieldEnergy = shieldCapacity;
    shieldRegenRate = 1;
    shieldActive = true;

    // Reiniciar ametralladoras
    turretCount = 0;
    turrets = [];
    turretRange = 400; // Alcance duplicado
    turretDamage = 1;
    turretFireRate = 1000;
    costTurret = 100;
    costTurretRange = 50;
    costTurretDamage = 75;
    costShieldCapacity = 100;
    costShieldRegen = 80;

    // Reiniciar cazas
    fighterCapacity = 0;
    fightersInHangar = 0;
    fighterSpeedMultiplier = 1.0;
    fighterHealth = 2;
    fighterShield = false;
    costFighterCapacity = 50;
    costFighter = 30;
    costFighterSpeed = 40;
    costFighterHealth = 35;
    costFighterShield = 50;

    document.getElementById('score').innerText = score;
    document.getElementById('wave').innerText = wave;
    document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
    document.getElementById('fightersInHangar').innerText = fightersInHangar;

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
    var numberOfBuildings = 20;
    for (var i = 0; i < numberOfBuildings; i++) {
        var cityWidth = (canvas.width * 0.02) + Math.random() * (canvas.width * 0.05);
        var cityHeight = (canvas.height * 0.05) + Math.random() * (canvas.height * 0.15);
        var xPosition = Math.random() * (canvas.width - cityWidth);
        var yPosition = canvas.height - cityHeight; // Mover la ciudad más abajo
        cities.push({
            x: xPosition,
            y: yPosition,
            width: cityWidth,
            height: cityHeight,
            destroyed: false,
            color: 'rgb(0,' + (50 + Math.floor(Math.random() * 205)) + ',255)'
        });
    }

    lastUpdateTime = Date.now(); // Reiniciar lastUpdateTime

    startWave();
}
