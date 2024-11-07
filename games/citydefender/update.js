/* update.js */
// Actualizar estado del juego
function update() {
    var currentTime = Date.now();
    var deltaTime = (currentTime - (lastUpdateTime || currentTime)) / 1000;
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
        baseShip.x += baseShip.speed * baseShip.direction;
        if (Math.random() < 0.01) {
            baseShip.direction *= -1;
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
            let targets = enemyMissiles.concat(enemyShips, enemyHangars, enemyFighters).filter(obj => !obj.destroyed);
            let closestTarget = null;
            let minDistance = (turretRange / 100) * canvas.width * 0.5; // Alcance ajustado
            targets.forEach(function(target) {
                let dx = target.x - (baseShip.x + turret.offsetX);
                let dy = target.y - (baseShip.y + turret.offsetY);
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTarget = target;
                }
            });
            if (closestTarget) {
                turret.lastShotTime = currentTime;
                let dx = closestTarget.x - (baseShip.x + turret.offsetX);
                let dy = closestTarget.y - (baseShip.y + turret.offsetY);
                let angle = Math.atan2(dy, dx);
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

    // Actualizar misiles del jugador
    playerMissiles.forEach(function(missile, index) {
        if (!missile.exploded) {
            var dx = missile.targetX - missile.x;
            var dy = missile.targetY - missile.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var stepX = (dx / distance) * missile.speed;
            var stepY = (dy / distance) * missile.speed;

            missile.x += stepX * deltaTime * 60;
            missile.y += stepY * deltaTime * 60;

            if (distance < missile.speed || missile.y < 0) {
                missile.exploded = true;
                explosions.push({
                    x: missile.x,
                    y: missile.y,
                    radius: canvas.width * 0.05 * explosionSizeMultiplier,
                    startTime: currentTime,
                    duration: 300 * explosionDurationMultiplier // Duración reducida
                });
            }
        } else {
            playerMissiles.splice(index, 1);
        }
    });

    // Actualizar misiles enemigos
    enemyMissiles.forEach(function(missile, index) {
        missile.y += missile.speed * deltaTime * 60;
        if (missile.y > canvas.height) {
            enemyMissiles.splice(index, 1);
        }

        // Colisión con escudo de la nave base
        if (shieldActive) {
            var dx = missile.x - baseShip.x;
            var dy = missile.y - baseShip.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < baseShip.width) {
                enemyMissiles.splice(index, 1);
                shieldEnergy -= 10;
                if (shieldEnergy <= 0) {
                    shieldEnergy = 0;
                    shieldActive = false;
                }
            }
        } else {
            // Colisión con nave base
            if (missile.x > baseShip.x - baseShip.width / 2 && missile.x < baseShip.x + baseShip.width / 2 &&
                missile.y > baseShip.y - baseShip.height / 2 && missile.y < baseShip.y + baseShip.height / 2) {
                enemyMissiles.splice(index, 1);
                baseShipHealth -= 1;
                if (baseShipHealth <= 0) {
                    baseShipHealth = 0;
                    baseShip.destroyed = true;
                    gameOver();
                }
            }
        }
    });

    // Actualizar explosiones
    explosions.forEach(function(explosion, index) {
        if (currentTime - explosion.startTime > explosion.duration) {
            explosions.splice(index, 1);
        }
    });

    // Detectar colisiones entre explosiones y misiles enemigos
    explosions.forEach(function(explosion) {
        enemyMissiles.forEach(function(missile, index) {
            var dx = missile.x - explosion.x;
            var dy = missile.y - explosion.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < explosion.radius) {
                enemyMissiles.splice(index, 1);
                score += 5;
                document.getElementById('score').innerText = score;
                coinsToSpend += 1;
                document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
            }
        });

        // Colisión con naves enemigas
        enemyShips.forEach(function(ship) {
            if (!ship.destroyed) {
                var dx = ship.x - explosion.x;
                var dy = ship.y - explosion.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.radius) {
                    ship.health -= missileDamage;
                    if (ship.health <= 0) {
                        ship.destroyed = true;
                        score += 50;
                        coinsToSpend += 20;
                        document.getElementById('score').innerText = score;
                        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                    }
                }
            }
        });

        // Colisión con hangars enemigos
        enemyHangars.forEach(function(hangar) {
            if (!hangar.destroyed) {
                var dx = hangar.x - explosion.x;
                var dy = hangar.y - explosion.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.radius) {
                    hangar.health -= missileDamage;
                    if (hangar.health <= 0) {
                        hangar.destroyed = true;
                        score += 100;
                        coinsToSpend += 40;
                        document.getElementById('score').innerText = score;
                        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                    }
                }
            }
        });

        // Colisión con cazas enemigos
        enemyFighters.forEach(function(fighter) {
            if (!fighter.destroyed) {
                var dx = fighter.x - explosion.x;
                var dy = fighter.y - explosion.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < explosion.radius) {
                    fighter.health -= missileDamage;
                    if (fighter.health <= 0) {
                        fighter.destroyed = true;
                        score += 25;
                        coinsToSpend += 10;
                        document.getElementById('score').innerText = score;
                        document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                    }
                }
            }
        });
    });

    // Actualizar naves enemigas
    enemyShips.forEach(function(ship) {
        if (!ship.destroyed) {
            ship.x += ship.speed * ship.direction * deltaTime * 60;
            if (ship.x < 0 || ship.x > canvas.width) {
                ship.direction *= -1;
            }

            if (currentTime - ship.lastShotTime > 2000) {
                ship.lastShotTime = currentTime;
                enemyMissiles.push({
                    x: ship.x,
                    y: ship.y,
                    speed: canvas.height * 0.002,
                    target: 'city'
                });
            }
        }
    });

    // Actualizar hangars enemigos
    enemyHangars.forEach(function(hangar) {
        if (!hangar.destroyed) {
            hangar.x += hangar.speed * hangar.direction * deltaTime * 60;
            if (hangar.x < 0 || hangar.x > canvas.width) {
                hangar.direction *= -1;
            }

            // Lanzar cazas enemigos
            if (currentTime - hangar.lastCazaLaunchTime > 5000 && hangar.cazasLaunched < hangar.maxCazas) {
                hangar.lastCazaLaunchTime = currentTime;
                hangar.cazasLaunched++;
                enemyFighters.push({
                    x: hangar.x,
                    y: hangar.y,
                    width: canvas.width * 0.02,
                    height: canvas.height * 0.015,
                    speed: canvas.height * 0.001,
                    health: 2,
                    maxHealth: 2,
                    destroyed: false,
                    attackPhase: 'approach',
                    lastShotTime: 0,
                    shotInterval: 1000
                });
            }
        }
    });

    // Actualizar cazas enemigos
    enemyFighters.forEach(function(fighter) {
        if (!fighter.destroyed) {
            if (fighter.attackPhase === 'approach') {
                // Mover hacia la nave base
                var dx = baseShip.x - fighter.x;
                var dy = baseShip.y - fighter.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                fighter.x += (dx / distance) * fighter.speed * deltaTime * 60;
                fighter.y += (dy / distance) * fighter.speed * deltaTime * 60;

                // Atacar si está cerca
                if (distance < canvas.width * 0.2) {
                    if (currentTime - fighter.lastShotTime >= fighter.shotInterval) {
                        fighter.lastShotTime = currentTime;
                        let angle = Math.atan2(dy, dx);
                        energyBullets.push({
                            x: fighter.x,
                            y: fighter.y,
                            vx: Math.cos(angle) * canvas.width * 0.005,
                            vy: Math.sin(angle) * canvas.height * 0.005,
                            size: 2,
                            damage: 1,
                            owner: 'enemyFighter',
                            lifeTime: 500
                        });
                    }
                    fighter.attackPhase = 'retreat';
                }
            } else if (fighter.attackPhase === 'retreat') {
                // Retirarse fuera del alcance de la nave base
                var dx = fighter.x - baseShip.x;
                var dy = fighter.y - baseShip.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                fighter.x += (dx / distance) * fighter.speed * deltaTime * 60;
                fighter.y += (dy / distance) * fighter.speed * deltaTime * 60;

                if (distance > canvas.width * 0.4) {
                    fighter.attackPhase = 'approach';
                }
            }

            // Atacar misiles del jugador
            playerMissiles.forEach(function(missile, index) {
                var dx = missile.x - fighter.x;
                var dy = missile.y - fighter.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < canvas.width * 0.1) {
                    if (currentTime - fighter.lastShotTime >= fighter.shotInterval) {
                        fighter.lastShotTime = currentTime;
                        let angle = Math.atan2(dy, dx);
                        energyBullets.push({
                            x: fighter.x,
                            y: fighter.y,
                            vx: Math.cos(angle) * canvas.width * 0.005,
                            vy: Math.sin(angle) * canvas.height * 0.005,
                            size: 2,
                            damage: 1,
                            owner: 'enemyFighter',
                            lifeTime: 500
                        });
                    }
                }
            });

            // Colisión con escudo de la nave base
            if (shieldActive) {
                var dx = fighter.x - baseShip.x;
                var dy = fighter.y - baseShip.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < baseShip.width) {
                    shieldEnergy -= 5 * deltaTime;
                    if (shieldEnergy <= 0) {
                        shieldEnergy = 0;
                        shieldActive = false;
                    }
                }
            } else {
                // Colisión con nave base
                if (fighter.x > baseShip.x - baseShip.width / 2 && fighter.x < baseShip.x + baseShip.width / 2 &&
                    fighter.y > baseShip.y - baseShip.height / 2 && fighter.y < baseShip.y + baseShip.height / 2) {
                    baseShipHealth -= 0.1 * deltaTime;
                    if (baseShipHealth <= 0) {
                        baseShipHealth = 0;
                        baseShip.destroyed = true;
                        gameOver();
                    }
                }
            }
        }
    });

    // Actualizar proyectiles de energía
    energyBullets.forEach(function(bullet, index) {
        bullet.x += bullet.vx * deltaTime * 60;
        bullet.y += bullet.vy * deltaTime * 60;
        bullet.lifeTime -= deltaTime * 1000;
        if (bullet.lifeTime <= 0) {
            energyBullets.splice(index, 1);
            return;
        }

        // Colisión con misiles enemigos
        if (bullet.owner === 'playerTurret' || bullet.owner === 'fighter') {
            enemyMissiles.forEach(function(missile, mIndex) {
                var dx = missile.x - bullet.x;
                var dy = missile.y - bullet.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bullet.size + 3) {
                    enemyMissiles.splice(mIndex, 1);
                    energyBullets.splice(index, 1);
                    score += 5;
                    coinsToSpend += 1;
                    document.getElementById('score').innerText = score;
                    document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                }
            });

            // Colisión con naves enemigas
            enemyShips.forEach(function(ship) {
                if (!ship.destroyed) {
                    var dx = ship.x - bullet.x;
                    var dy = ship.y - bullet.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < bullet.size + ship.width / 2) {
                        ship.health -= bullet.damage;
                        energyBullets.splice(index, 1);
                        if (ship.health <= 0) {
                            ship.destroyed = true;
                            score += 50;
                            coinsToSpend += 20;
                            document.getElementById('score').innerText = score;
                            document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        }
                    }
                }
            });

            // Colisión con hangars enemigos
            enemyHangars.forEach(function(hangar) {
                if (!hangar.destroyed) {
                    var dx = hangar.x - bullet.x;
                    var dy = hangar.y - bullet.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < bullet.size + hangar.width / 2) {
                        hangar.health -= bullet.damage;
                        energyBullets.splice(index, 1);
                        if (hangar.health <= 0) {
                            hangar.destroyed = true;
                            score += 100;
                            coinsToSpend += 40;
                            document.getElementById('score').innerText = score;
                            document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        }
                    }
                }
            });

            // Colisión con cazas enemigos
            enemyFighters.forEach(function(fighter) {
                if (!fighter.destroyed) {
                    var dx = fighter.x - bullet.x;
                    var dy = fighter.y - bullet.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < bullet.size + fighter.width / 2) {
                        fighter.health -= bullet.damage;
                        energyBullets.splice(index, 1);
                        if (fighter.health <= 0) {
                            fighter.destroyed = true;
                            score += 25;
                            coinsToSpend += 10;
                            document.getElementById('score').innerText = score;
                            document.getElementById('availableCoins').innerText = Math.floor(coinsToSpend);
                        }
                    }
                }
            });
        } else if (bullet.owner === 'enemyFighter') {
            // Colisión con misiles del jugador
            playerMissiles.forEach(function(missile, mIndex) {
                var dx = missile.x - bullet.x;
                var dy = missile.y - bullet.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bullet.size + 3) {
                    playerMissiles.splice(mIndex, 1);
                    energyBullets.splice(index, 1);
                }
            });

            // Colisión con nave base
            if (shieldActive) {
                var dx = bullet.x - baseShip.x;
                var dy = bullet.y - baseShip.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < baseShip.width) {
                    energyBullets.splice(index, 1);
                    shieldEnergy -= 5;
                    if (shieldEnergy <= 0) {
                        shieldEnergy = 0;
                        shieldActive = false;
                    }
                }
            } else {
                if (bullet.x > baseShip.x - baseShip.width / 2 && bullet.x < baseShip.x + baseShip.width / 2 &&
                    bullet.y > baseShip.y - baseShip.height / 2 && bullet.y < baseShip.y + baseShip.height / 2) {
                    energyBullets.splice(index, 1);
                    baseShipHealth -= 1;
                    if (baseShipHealth <= 0) {
                        baseShipHealth = 0;
                        baseShip.destroyed = true;
                        gameOver();
                    }
                }
            }
        }
    });

    // Actualizar cazas amigos
    fighters.forEach(function(fighter, index) {
        if (fighter.destroyed) {
            fighters.splice(index, 1);
            return;
        }

        // Comportamiento según la táctica seleccionada
        let target = selectFighterTarget(fighter);

        if (target) {
            let dx = target.x - fighter.x;
            let dy = target.y - fighter.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let speed = fighter.speed * fighterSpeedMultiplier;

            fighter.x += (dx / distance) * speed * deltaTime * 60;
            fighter.y += (dy / distance) * speed * deltaTime * 60;

            // Disparar si está en rango
            if (distance < canvas.width * 0.2) {
                if (currentTime - fighter.lastShotTime >= fighter.shotInterval) {
                    fighter.lastShotTime = currentTime;
                    let angle = Math.atan2(dy, dx);
                    energyBullets.push({
                        x: fighter.x,
                        y: fighter.y,
                        vx: Math.cos(angle) * canvas.width * 0.005,
                        vy: Math.sin(angle) * canvas.height * 0.005,
                        size: 2,
                        damage: turretDamage,
                        owner: 'fighter',
                        lifeTime: 500
                    });
                }
            }
        } else {
            // Patrullar alrededor de la nave base
            fighter.x += (Math.random() - 0.5) * fighter.speed * deltaTime * 60;
            fighter.y += (Math.random() - 0.5) * fighter.speed * deltaTime * 60;
        }
    });

    // Verificar condiciones de fin de oleada
    if (enemyMissiles.length === 0 && enemyShips.every(s => s.destroyed) && enemyHangars.every(h => h.destroyed) && enemyFighters.every(f => f.destroyed)) {
        wave++;
        document.getElementById('wave').innerText = wave;
        showUpgradeMenu();
    }
}

// Función para terminar el juego
function gameOver() {
    gamePaused = true;
    canShoot = false;
    alert('¡Has sido derrotado! Puntuación final: ' + score);
    initGame();
}
