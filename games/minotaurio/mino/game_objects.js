// game_objects.js: Contiene la lógica para la construcción de objetos del laberinto (paredes, trampas, Minotauro)
// y sus comportamientos específicos de actualización/interacción.

/**
 * Busca la primera ocurrencia de un tipo de celda específico en el laberinto.
 * @param {number} type - Tipo de celda a buscar.
 * @param {Array<Array<number>>} targetMaze - El array del laberinto.
 * @param {number} mazeW - Ancho del laberinto.
 * @param {number} mazeH - Alto del laberinto.
 * @returns {object|null} Un objeto {x, z} si se encuentra la celda, null en caso contrario.
 */
function findCell(type, targetMaze, mazeW, mazeH) { 
    for (let z = 0; z < mazeH; z++) { 
        for (let x = 0; x < mazeW; x++) { 
            if (targetMaze[z] && targetMaze[z][x] === type) return { x, z }; 
        } 
    } 
    return null; 
}

/**
 * Busca todos los puntos de callejón sin salida en el laberinto.
 * (Función no utilizada actualmente en la lógica principal del juego, pero útil para depuración o futuras expansiones).
 * @param {Array<Array<number>>} targetMaze - El array del laberinto.
 * @param {number} mazeW - Ancho del laberinto.
 * @param {number} mazeH - Alto del laberinto.
 * @returns {Array<object>} Un array de objetos {x, y} representando los callejones sin salida.
 */
function findDeadEnds(targetMaze, mazeW, mazeH) { 
    let deadEnds = []; 
    for (let y = 1; y < mazeH - 1; y++) { 
        for (let x = 1; x < mazeW - 1; x++) { 
            if (targetMaze[y][x] !== 0) { 
                let pathNeighbors = 0; 
                if (targetMaze[y+1] && targetMaze[y+1][x] !== 0) pathNeighbors++; 
                if (targetMaze[y-1] && targetMaze[y-1][x] !== 0) pathNeighbors++; 
                if (targetMaze[y][x+1] !== 0) pathNeighbors++; 
                if (targetMaze[y][x-1] !== 0) pathNeighbors++; 
                if (pathNeighbors === 1) { 
                    deadEnds.push({ x, y }); 
                } 
            } 
        } 
    } 
    return deadEnds; 
}

/**
 * Construye la geometría 3D del laberinto y coloca todos los objetos interactivos.
 * Se llama al inicializar o reiniciar un laberinto.
 * @param {number} mazeW - Ancho del laberinto en celdas.
 * @param {number} mazeH - Alto del laberinto en celdas.
 * @param {Array<Array<number>>} layout - El array del laberinto (tipos de celda).
 */
function buildMazeGeometry(mazeW, mazeH, layout) {
    // Resetear listas de objetos para una nueva construcción
    window.collidableObjects = [];
    window.interactiveObjects = [];
    window.staticTorches = [];
    window.lavaCells = []; 
    window.pitTrapObjects = [];
    window.fallingBlockTrapObjects = [];
    window.spikeTrapObjects = [];
    window.doorObjects = []; 
    window.movingPlatforms = []; 
    window.minotaurEnemy = null;
    window.minotaurCollisionCylinder = null; 
    window.minotaurInitialGridPos = null;
    window.endZones = []; 
    window.minotaurTorches = []; 

    // Materiales base (clonados para cada objeto para evitar compartir texturas.
    // Las texturas base (wallTexture, floorTexture, etc.) son globales desde game_engine.js)
    const wallMaterialBase = new THREE.MeshStandardMaterial({
        map: wallTexture ? wallTexture.clone() : null,
        roughness: 0.9, metalness: 0.1,
        color: wallTexture ? 0xffffff : 0x605548
    });
    if (wallMaterialBase.map) wallMaterialBase.map.needsUpdate = true;


    const floorCellMaterialBase = new THREE.MeshStandardMaterial({ 
        map: floorTexture ? floorTexture.clone() : null,
        roughness: 0.95, metalness: 0.1, side: THREE.DoubleSide,
        color: floorTexture ? 0xffffff : 0x444038
    });
    if (floorCellMaterialBase.map) {
        floorCellMaterialBase.map.needsUpdate = true;
        floorCellMaterialBase.map.wrapS = floorCellMaterialBase.map.wrapT = THREE.RepeatWrapping;
        floorCellMaterialBase.map.repeat.set(1, 1); 
    }

    const doorMaterialBase = new THREE.MeshStandardMaterial({
        map: doorTexture ? doorTexture.clone() : null,
        roughness: 0.8, metalness: 0.2,
        color: doorTexture ? 0xffffff : 0x8B4513
    });
    if (doorMaterialBase.map) doorMaterialBase.map.needsUpdate = true;


    const pitTrapCoverMaterialBase = new THREE.MeshStandardMaterial({
        map: floorTexture ? floorTexture.clone() : null,
        roughness: 0.95, metalness: 0.1,
        color: floorTexture ? 0xffffff : 0x444038
    });
    if (pitTrapCoverMaterialBase.map) {
         pitTrapCoverMaterialBase.map.needsUpdate = true;
         pitTrapCoverMaterialBase.map.repeat.set(1,1);
    }

    const lavaMaterialBase = new THREE.MeshStandardMaterial({
        map: lavaTexture ? lavaTexture.clone() : null,
        emissive: LAVA_LIGHT_COLOR, 
        emissiveIntensity: 0.6,
        roughness: 0.6,
        metalness: 0.1,
        color: lavaTexture ? 0xffffff : LAVA_LIGHT_COLOR, 
    });
    if (lavaMaterialBase.map) {
        lavaMaterialBase.map.needsUpdate = true;
        lavaMaterialBase.map.wrapS = lavaMaterialBase.map.wrapT = THREE.RepeatWrapping;
        lavaMaterialBase.map.repeat.set(1, 1); 
    }

    const endMaterial = new THREE.MeshStandardMaterial({ color: MINIMAP_END_COLOR, emissive: MINIMAP_END_COLOR, transparent: true, opacity: 0.6 });
    const endLinkMaterial = new THREE.MeshStandardMaterial({ color: MINIMAP_END_LINK_COLOR, emissive: MINIMAP_END_LINK_COLOR, transparent: true, opacity: 0.7 });

    const torchHolderMaterial = new THREE.MeshStandardMaterial({ color: 0x504030, roughness: 0.8 });
    const flameMaterialBase = new THREE.MeshBasicMaterial({ color: 0xffd080, transparent: true, opacity: FLAME_BASE_OPACITY, blending: THREE.AdditiveBlending, depthWrite: false });

    // Geometrías reusables
    const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
    const floorCellGeometry = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE); 
    const lavaGeometry = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE); 
    const endGeometry = new THREE.CylinderGeometry(CELL_SIZE * 0.3, CELL_SIZE * 0.3, 0.2, 16);
    const torchHolderGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const flameGeometry = new THREE.SphereGeometry(0.25, 10, 8); 
    const pitCoverGeometry = new THREE.BoxGeometry(CELL_SIZE, PIT_COVER_THICKNESS, CELL_SIZE);
    const pitHoleGeometry = new THREE.BoxGeometry(CELL_SIZE * 0.95, WALL_HEIGHT * 2, CELL_SIZE * 0.95);
    const spikeGeometry = new THREE.ConeGeometry(PLAYER_RADIUS * 0.3, SPIKE_HEIGHT, 4);
    const doorHalfGeometry = new THREE.BoxGeometry(CELL_SIZE * 0.5, WALL_HEIGHT, 0.2); 

    let torchLocations = []; // Para evitar antorchas estáticas demasiado cerca

    // Recorrer el layout del laberinto para construir la geometría
    for (let z_grid = 0; z_grid < mazeH; z_grid++) { 
        for (let x_grid = 0; x_grid < mazeW; x_grid++) { 
            // Asegurar que la celda existe en el layout
            if (!layout[z_grid] || layout[z_grid][x_grid] === undefined) { layout[z_grid][x_grid] = 0; }
            const cellTypeInLayout = layout[z_grid][x_grid];

            // Calcular posición en el mundo para el centro de la celda
            const posX = (x_grid - mazeW / 2 + 0.5) * CELL_SIZE;
            const posYBase = WALL_HEIGHT / 2; // Centro en Y para paredes
            const posZ = (z_grid - mazeH / 2 + 0.5) * CELL_SIZE;

            // Construir objetos según el tipo de celda
            if (cellTypeInLayout === 0) { // Pared
                const wallMatInstance = wallMaterialBase.clone();
                if (wallMatInstance.map) {
                    wallMatInstance.map = wallMaterialBase.map.clone();
                    wallMatInstance.map.needsUpdate = true;
                    wallMatInstance.map.repeat.set(1, WALL_HEIGHT / CELL_SIZE); // Ajustar repetición de textura
                }
                const wall = new THREE.Mesh(wallGeometry, wallMatInstance);
                wall.position.set(posX, posYBase, posZ);
                wall.castShadow = true; wall.receiveShadow = true;
                wall.userData = { isWall: true, originalOpacity: 1.0, isTransparentCapable: true };
                scene.add(wall);
                collidableObjects.push(wall);
            } else if (cellTypeInLayout === LAVA_CELL_TYPE) { // Lava
                const lavaMatInstance = lavaMaterialBase.clone();
                if (lavaMatInstance.map) {
                    lavaMatInstance.map = lavaMaterialBase.map.clone(); 
                    lavaMatInstance.map.needsUpdate = true;
                }
                const lavaSurface = new THREE.Mesh(lavaGeometry, lavaMatInstance);
                lavaSurface.rotation.x = -Math.PI / 2; // Orientar plano horizontalmente
                lavaSurface.position.set(posX, LAVA_SURFACE_OFFSET_Y, posZ);
                lavaSurface.receiveShadow = true; 
                lavaSurface.userData = { isLava: true, gridX: x_grid, gridZ: z_grid };
                scene.add(lavaSurface);
                
                // Añadir luz que emana de la lava
                const lavaLight = new THREE.PointLight(LAVA_LIGHT_COLOR, LAVA_LIGHT_INTENSITY, LAVA_LIGHT_DISTANCE, 1.8);
                lavaLight.position.set(posX, LAVA_SURFACE_OFFSET_Y + 0.5, posZ);
                lavaLight.userData.baseIntensity = LAVA_LIGHT_INTENSITY;
                scene.add(lavaLight);
                lavaCells.push({ mesh: lavaSurface, light: lavaLight });

            } else if (cellTypeInLayout === BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT) { // Foso roto (ya es un agujero)
                const pitHole = new THREE.Mesh(pitHoleGeometry, PIT_HOLE_MATERIAL);
                pitHole.position.set(posX, -WALL_HEIGHT, posZ);
                pitHole.visible = true; // Siempre visible
                scene.add(pitHole);
                pitTrapObjects.push({ mesh: null, holeMesh: pitHole, state: 'broken', gridX: x_grid, gridZ: z_grid, worldX: posX, worldZ: posZ, hasBeenRevealedByActivation: true });
            } else if (cellTypeInLayout === PIT_TRAP_CELL_TYPE) { // Trampa de foso (cubierta)
                const pitCoverMatInstance = pitTrapCoverMaterialBase.clone();
                if (pitCoverMatInstance.map) {
                    pitCoverMatInstance.map = pitTrapCoverMaterialBase.map.clone();
                    pitCoverMatInstance.map.needsUpdate = true;
                    pitCoverMatInstance.map.repeat.set(1,1);
                }
                const pitCover = new THREE.Mesh(pitCoverGeometry, pitCoverMatInstance);
                pitCover.position.set(posX, -PIT_COVER_THICKNESS / 2, posZ); // Justo por debajo del suelo
                pitCover.castShadow = true; pitCover.receiveShadow = true;
                pitCover.userData = { isPitTrapCover: true, gridX: x_grid, gridZ: z_grid, isCollidable: true };
                scene.add(pitCover);
                collidableObjects.push(pitCover);

                const pitHole = new THREE.Mesh(pitHoleGeometry, PIT_HOLE_MATERIAL);
                pitHole.position.set(posX, -WALL_HEIGHT, posZ);
                pitHole.visible = false; // Inicialmente oculto
                scene.add(pitHole);
                pitTrapObjects.push({ mesh: pitCover, holeMesh: pitHole, state: 'intact', gridX: x_grid, gridZ: z_grid, worldX: posX, worldZ: posZ, hasBeenRevealedByActivation: false });
            
            } else if (cellTypeInLayout === DOOR_H_CELL_TYPE || cellTypeInLayout === DOOR_V_CELL_TYPE) { // Puertas
                // Añadir el suelo debajo de la puerta
                const floorCellMatInstance = floorCellMaterialBase.clone();
                if (floorCellMatInstance.map) {
                    floorCellMatInstance.map = floorCellMaterialBase.map.clone();
                    floorCellMatInstance.map.needsUpdate = true;
                }
                const floorCell = new THREE.Mesh(floorCellGeometry, floorCellMatInstance);
                floorCell.rotation.x = -Math.PI / 2;
                floorCell.position.set(posX, 0, posZ); 
                floorCell.receiveShadow = true;
                floorCell.userData = { isFloorTile: true }; 
                scene.add(floorCell);

                const doorGroup = new THREE.Group();
                const doorMaterialInstance = doorMaterialBase.clone();
                if (doorMaterialInstance.map) {
                     doorMaterialInstance.map = doorMaterialBase.map.clone();
                     doorMaterialInstance.map.needsUpdate = true;
                     doorMaterialInstance.map.repeat.set(CELL_SIZE / CELL_SIZE, WALL_HEIGHT / CELL_SIZE);
                }

                // Las puertas se componen de dos mitades para animar la apertura
                const doorHalf1 = new THREE.Mesh(doorHalfGeometry, doorMaterialInstance);
                doorHalf1.position.set(-CELL_SIZE * 0.25, 0, 0); // Offset para que la rotación sea desde el centro de la celda
                doorGroup.add(doorHalf1);

                const doorHalf2 = new THREE.Mesh(doorHalfGeometry, doorMaterialInstance.clone()); 
                doorHalf2.position.set(CELL_SIZE * 0.25, 0, 0);
                doorGroup.add(doorHalf2);

                doorGroup.position.set(posX, posYBase, posZ);
                doorGroup.userData = { 
                    isDoor: true, 
                    gridX: x_grid, 
                    gridZ: z_grid, 
                    type: cellTypeInLayout,
                    state: 'closed', // Estados: 'closed', 'opening', 'open', 'closing'
                    openTween: null,
                    closeTimeout: null,
                    half1: doorHalf1,
                    half2: doorHalf2
                };

                if (cellTypeInLayout === DOOR_V_CELL_TYPE) { // Puerta vertical (abre a lo largo del eje X)
                    doorGroup.rotation.y = Math.PI / 2; // Rotar 90 grados para orientación vertical
                }

                scene.add(doorGroup);
                collidableObjects.push(doorGroup); // Puerta cerrada es colisionable
                doorObjects.push(doorGroup); // Almacenar para gestión de interacción

            } else if (cellTypeInLayout === MOVING_PLATFORM_CELL_TYPE) { // NUEVO: Plataforma móvil
                // Crear el agujero de foso debajo
                const pitHoleForPlatform = new THREE.Mesh(pitHoleGeometry, PIT_HOLE_MATERIAL);
                pitHoleForPlatform.position.set(posX, -WALL_HEIGHT, posZ);
                scene.add(pitHoleForPlatform);

                // Crear la plataforma en sí
                const platformWidth = CELL_SIZE * MOVING_PLATFORM_WIDTH_FACTOR;
                const platformDepth = CELL_SIZE * MOVING_PLATFORM_WIDTH_FACTOR;
                const platformHeight = MOVING_PLATFORM_HEIGHT;
                const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth);
                const platformMaterial = floorCellMaterialBase.clone(); 
                if (platformMaterial.map) { 
                    platformMaterial.map = floorCellMaterialBase.map.clone();
                    platformMaterial.map.needsUpdate = true;
                }

                const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
                platformMesh.position.set(posX, platformHeight / 2, posZ); // Centrado en la celda, sobre el suelo
                platformMesh.castShadow = true;
                platformMesh.receiveShadow = true;
                platformMesh.userData = { isMovingPlatform: true, gridX: x_grid, gridZ: z_grid };
                scene.add(platformMesh);
                collidableObjects.push(platformMesh);

                // Dirección inicial aleatoria para la plataforma
                let initialDirection = new THREE.Vector3(
                    (Math.random() > 0.5 ? 1 : -1), 0, (Math.random() > 0.5 ? 1 : -1)
                ).normalize();

                movingPlatforms.push({
                    mesh: platformMesh,
                    holeMesh: pitHoleForPlatform, 
                    gridX: x_grid,
                    gridZ: z_grid,
                    direction: initialDirection,
                    speed: MOVING_PLATFORM_SPEED,
                    minXBound: posX - CELL_SIZE / 2 + platformWidth / 2, // Límites de movimiento de la plataforma dentro de la celda
                    maxXBound: posX + CELL_SIZE / 2 - platformWidth / 2,
                    minZBound: posZ - CELL_SIZE / 2 + platformDepth / 2,
                    maxZBound: posZ + CELL_SIZE / 2 - platformDepth / 2,
                    platformWidth: platformWidth, 
                    platformDepth: platformDepth
                });

            } else { 
                // Añadir una baldosa de suelo para cualquier celda de camino que no sea pared, lava, o foso roto
                if (cellTypeInLayout !== 0 && cellTypeInLayout !== BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT) { 
                     const floorCellMatInstance = floorCellMaterialBase.clone();
                     if (floorCellMatInstance.map) {
                         floorCellMatInstance.map = floorCellMatInstance.map.clone();
                         floorCellMatInstance.map.needsUpdate = true;
                     }
                     const floorCell = new THREE.Mesh(floorCellGeometry, floorCellMatInstance);
                     floorCell.rotation.x = -Math.PI / 2; // Orientar plano horizontalmente
                     floorCell.position.set(posX, 0, posZ); 
                     floorCell.receiveShadow = true;
                     floorCell.userData = { isFloorTile: true }; 
                     scene.add(floorCell);
                }
                
                // Tipos de trampas que no son de foso
                if (cellTypeInLayout === FALLING_BLOCK_TRAP_CELL_TYPE) { // Trampa de bloque que cae
                     const rockGroup = new THREE.Group();
                    const numRocks = Math.floor(Math.random() * 3) + 3; // Número de rocas
                    const rockMaterialToUse = FALLING_BLOCK_MATERIAL.clone();
                    if(wallTexture && Math.random() < 0.5) { // Opcional: usar textura de pared para las rocas
                        rockMaterialToUse.map = wallTexture.clone();
                        rockMaterialToUse.map.needsUpdate = true;
                        rockMaterialToUse.color.set(0xffffff);
                    }

                    for (let i = 0; i < numRocks; i++) {
                        const rockRadius = (Math.random() * 0.2 + 0.25) * CELL_SIZE * 0.8; 
                        const rockGeometry = new THREE.DodecahedronGeometry(rockRadius, 0); // Forma de roca aleatoria
                        const rock = new THREE.Mesh(rockGeometry, rockMaterialToUse);
                        rock.position.set(
                            (Math.random() - 0.5) * CELL_SIZE * 0.5, // Posición aleatoria dentro de la celda
                            (Math.random() - 0.5) * CELL_SIZE * 0.3, 
                            (Math.random() - 0.5) * CELL_SIZE * 0.5
                        );
                        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                        rock.castShadow = true;
                        rockGroup.add(rock);
                    }
                    rockGroup.position.set(posX, WALL_HEIGHT + WALL_HEIGHT * 0.45, posZ); // Posición inicial elevada
                    rockGroup.visible = false; // Inicialmente oculto
                    rockGroup.castShadow = true; 
                    scene.add(rockGroup);
                    fallingBlockTrapObjects.push({
                        triggerCellX: x_grid, triggerCellZ: z_grid, worldX: posX, worldZ: posZ,
                        blockMesh: rockGroup, 
                        state: 'armed', hasBeenRevealedByActivation: false,
                        userData: { isFallingBlock: true } 
                    });
                } else if (cellTypeInLayout === SPIKE_TRAP_CELL_TYPE) { // Trampa de pinchos
                    const spikeGroup = new THREE.Group();
                    const numSpikes = 5; // Número de pinchos
                    for (let i = 0; i < numSpikes; i++) {
                        const spike = new THREE.Mesh(spikeGeometry, SPIKE_MATERIAL.clone());
                        // Posiciones dispersas dentro de la celda
                        if (i < 4) {
                            spike.position.x = (i % 2 === 0 ? -1 : 1) * CELL_SIZE * 0.25;
                            spike.position.z = (i < 2 ? -1 : 1) * CELL_SIZE * 0.25;
                        } else {
                            spike.position.x = 0; spike.position.z = 0;
                        }
                        spike.position.y = -SPIKE_HEIGHT / 2; // Inicialmente debajo del suelo
                        spikeGroup.add(spike);
                    }
                    spikeGroup.position.set(posX, 0, posZ);
                    spikeGroup.visible = false; // Inicialmente oculto
                    scene.add(spikeGroup);
                    spikeTrapObjects.push({
                        triggerCellX: x_grid, triggerCellZ: z_grid, worldX: posX, worldZ: posZ,
                        spikeGroup: spikeGroup, state: 'hidden', hasBeenRevealedByActivation: false,
                        damageReadyTime: 0 // Tiempo en el que los pinchos pueden dañar
                    });
                } else if (cellTypeInLayout === MINOTAUR_CELL_TYPE) { // Punto de inicio del Minotauro
                     if (!minotaurEnemy) { // Asegurar que solo haya un Minotauro
                        minotaurTorches = []; // Array para las antorchas del Minotauro

                        if (minotaurModelGLB) { // Si el modelo GLB del Minotauro está cargado
                            minotaurEnemy = minotaurModelGLB.clone(); 

                            // Escalar el modelo del Minotauro a la altura deseada
                            const tempModelForBBox = minotaurModelGLB.clone();
                            const originalBBox = new THREE.Box3().setFromObject(tempModelForBBox);
                            const modelSize = new THREE.Vector3();
                            originalBBox.getSize(modelSize);
                            const originalMinY = originalBBox.min.y;

                            let scaleFactor = 1.0;
                            if (modelSize.y > 0.01) {
                                scaleFactor = MINOTAUR_TARGET_HEIGHT / modelSize.y;
                            } else {
                                console.warn("BUILD: Minotaur model original height is very small or zero. Using scale factor 1.");
                            }
                            minotaurEnemy.scale.set(scaleFactor, scaleFactor, scaleFactor);
                            
                            const worldPosYForMinotaurOrigin = -(originalMinY * scaleFactor);
                            minotaurEnemy.position.set(posX, worldPosYForMinotaurOrigin, posZ);
                            minotaurEnemy.rotation.y = Math.PI; // Rotar 180 grados para que mire hacia adelante
                        } else { // Fallback a cilindro si el modelo no carga
                            console.warn("Modelo del Minotauro no cargado, usando cilindro.");
                            const minoGeom = new THREE.CylinderGeometry(MINOTAUR_COLLISION_RADIUS, MINOTAUR_COLLISION_RADIUS * 0.8, MINOTAUR_COLLISION_HEIGHT, 16); 
                            const minoMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.5, metalness: 0.2 });
                            minotaurEnemy = new THREE.Mesh(minoGeom, minoMat);
                            minotaurEnemy.position.set(posX, MINOTAUR_COLLISION_HEIGHT / 2, posZ); 
                            minotaurEnemy.rotation.y = Math.PI;
                        }
                        
                        minotaurEnemy.castShadow = true;
                        minotaurEnemy.traverse(child => { 
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true; 
                            }
                        });
                        minotaurEnemy.rotation.order = 'YXZ';
                        minotaurInitialGridPos = { x: x_grid, z: z_grid };
                        minotaurEnemy.userData.gridX = x_grid;
                        minotaurEnemy.userData.gridZ = z_grid;
                        minotaurEnemy.userData.stuckCounter = 0; // Contador para la IA del Minotauro
                        scene.add(minotaurEnemy);

                        // Cilindro de colisión para el Minotauro (visible o no para depuración)
                        const collisionCylinderGeom = new THREE.CylinderGeometry(MINOTAUR_COLLISION_RADIUS, MINOTAUR_COLLISION_RADIUS, MINOTAUR_COLLISION_HEIGHT, 8);
                        minotaurCollisionCylinder = new THREE.Mesh(collisionCylinderGeom, new THREE.MeshBasicMaterial({visible: false, transparent: true, opacity: 0.3, color:0x00ff00})); 
                        minotaurCollisionCylinder.position.set(posX, MINOTAUR_COLLISION_HEIGHT / 2, posZ);
                        scene.add(minotaurCollisionCylinder); 
                        collidableObjects.push(minotaurCollisionCylinder);


                        // Antorchas del Minotauro (en los cuernos o en la mano)
                        const minotaurHornBoneNames = ["Horn.L", "Horn.R", "LeftHorn", "RightHorn", "horn_left", "horn_right", "HORN_L", "HORN_R"];
                        let hornsFound = [];
                        
                        if (minotaurModelGLB) {
                            minotaurEnemy.traverse((node) => {
                                if ((node.isBone || node.isObject3D) && minotaurHornBoneNames.includes(node.name)) {
                                    hornsFound.push(node);
                                }
                            });
                        }

                        if (hornsFound.length >= 2) { // Si se encuentran al menos 2 cuernos
                            const hornTorchOffset = new THREE.Vector3(0, 0.05, 0.2);
                            const hornTorchRotation = new THREE.Euler(Math.PI / 8, 0, 0);
                            
                            hornsFound.forEach((hornNode) => {
                                const mTorchGroup = new THREE.Group();
                                const mTorchLight = new THREE.PointLight(MINOTAUR_TORCH_COLOR, MINOTAUR_TORCH_LIGHT_INTENSITY, MINOTAUR_TORCH_LIGHT_DISTANCE, MINOTAUR_TORCH_LIGHT_DECAY);
                                mTorchLight.castShadow = true;
                                mTorchLight.shadow.mapSize.width = 128;
                                mTorchLight.shadow.mapSize.height = 128;
                                mTorchLight.userData.baseIntensity = MINOTAUR_TORCH_LIGHT_INTENSITY;
                                mTorchGroup.add(mTorchLight);

                                const mFlameMat = flameMaterialBase.clone();
                                mFlameMat.color.set(MINOTAUR_TORCH_COLOR);
                                const mFlameGeom = new THREE.ConeGeometry(MINOTAUR_TORCH_FLAME_SIZE * 0.5, MINOTAUR_TORCH_FLAME_SIZE * 1.5, 8);
                                mFlameGeom.translate(0, MINOTAUR_TORCH_FLAME_SIZE * 0.75, 0);
                                const mFlameMesh = new THREE.Mesh(mFlameGeom, mFlameMat);
                                mTorchGroup.add(mFlameMesh);

                                hornNode.add(mTorchGroup);
                                mTorchGroup.position.copy(hornTorchOffset);
                                mTorchGroup.rotation.copy(hornTorchRotation);

                                minotaurTorches.push({ light: mTorchLight, flameMesh: mFlameMesh, group: mTorchGroup });
                            });
                        } else { // Fallback si no se encuentran los cuernos
                            console.warn("BUILD: Not enough specific horn nodes found for Minotaur. Attaching one torch to a general hand node or fallback position.");
                            const mTorchGroup = new THREE.Group();
                            const mTorchLight = new THREE.PointLight(MINOTAUR_TORCH_COLOR, MINOTAUR_TORCH_LIGHT_INTENSITY, MINOTAUR_TORCH_LIGHT_DISTANCE, MINOTAUR_TORCH_LIGHT_DECAY);
                            mTorchLight.castShadow = true;
                            mTorchLight.shadow.mapSize.width = 128;
                            mTorchLight.shadow.mapSize.height = 128;
                            mTorchLight.userData.baseIntensity = MINOTAUR_TORCH_LIGHT_INTENSITY;
                            mTorchGroup.add(mTorchLight);

                            const mFlameMat = flameMaterialBase.clone();
                            mFlameMat.color.set(MINOTAUR_TORCH_COLOR);
                            const mFlameGeom = new THREE.ConeGeometry(MINOTAUR_TORCH_FLAME_SIZE * 0.5, MINOTAUR_TORCH_FLAME_SIZE * 1.5, 8);
                            mFlameGeom.translate(0, MINOTAUR_TORCH_FLAME_SIZE * 0.75, 0);
                            const mFlameMesh = new THREE.Mesh(mFlameGeom, mFlameMat);
                            mTorchGroup.add(mFlameMesh);

                            let handBone = null; 
                            const minotaurHandBoneNames = ["Hand.R", "mixamorig_RightHand", "mixamorig:RightHand", "mixamorig:righthand", "Bip01_R_Hand", "mano_d", "hand_r", "Hand_R", "RightHand", "joint_HandRT", "Weapon", "Bip01_R_Hand", "monster_hand_r", "RightHandBone", "r_hand_weapon", "weapon_joint", "Object_Weapon", "weapon_bone_r"];
                            minotaurEnemy.traverse((node) => {
                                if ((node.isBone || node.isObject3D) && minotaurHandBoneNames.some(name => node.name.toLowerCase().includes(name.toLowerCase()))) {
                                    handBone = node;
                                }
                            });

                            if (handBone) {
                                handBone.add(mTorchGroup);
                                mTorchGroup.position.set(0.05, 0.15, 0.05); // Offset para la mano
                                mTorchGroup.rotation.x = Math.PI / 6;
                            } else {
                                minotaurEnemy.add(mTorchGroup);
                                mTorchGroup.position.copy(MINOTAUR_TORCH_OFFSET); 
                            }
                            minotaurTorches.push({ light: mTorchLight, flameMesh: mFlameMesh, group: mTorchGroup });
                        }
                        
                        // Una vez que el Minotauro se genera, su celda de inicio se convierte en un camino normal (1)
                        currentMazeLayout[z_grid][x_grid] = 1; 
                    } else {
                        console.warn("Multiple Minotaur start points defined, only one used.");
                        currentMazeLayout[z_grid][x_grid] = 1; // Las celdas adicionales del Minotauro también se convierten en camino
                    }
                }
                
                // Generación aleatoria de antorchas estáticas en paredes adyacentes a caminos
                if (Math.random() < STATIC_TORCH_FREQUENCY) {
                    let possibleTorchWalls = [];
                    // Comprobar paredes adyacentes
                    if (z_grid > 0 && layout[z_grid-1][x_grid] === 0) possibleTorchWalls.push({ side: 'N' });
                    if (z_grid < mazeH - 1 && layout[z_grid+1][x_grid] === 0) possibleTorchWalls.push({ side: 'S' });
                    if (x_grid > 0 && layout[z_grid][x_grid-1] === 0) possibleTorchWalls.push({ side: 'W' });
                    if (x_grid < mazeW - 1 && layout[z_grid][x_grid+1] === 0) possibleTorchWalls.push({ side: 'E' });
                    
                    if (possibleTorchWalls.length > 0) {
                        const chosenWallData = possibleTorchWalls[Math.floor(Math.random() * possibleTorchWalls.length)];
                        // Evitar que las antorchas estén demasiado juntas
                        let tooClose = torchLocations.some(loc => Math.abs(loc.x - posX) < CELL_SIZE * 1.5 && Math.abs(loc.z - posZ) < CELL_SIZE * 1.5 );
                        if (!tooClose) { 
                            addStaticTorch(posX, posZ, chosenWallData.side, torchHolderGeometry, flameGeometry, torchHolderMaterial, flameMaterialBase, mazeW, mazeH); 
                            torchLocations.push({x: posX, z: posZ}); 
                        }
                    }
                }
                // Si es una celda final
                if (cellTypeInLayout === END_CELL_TERMINATE || cellTypeInLayout === END_CELL_SPECIFIC_NEXT) {
                    const currentEndMaterial = (cellTypeInLayout === END_CELL_SPECIFIC_NEXT) ? endLinkMaterial.clone() : endMaterial.clone();
                    const endZoneMesh = new THREE.Mesh(endGeometry, currentEndMaterial); 
                    endZoneMesh.position.set(posX, 0.1, posZ);
                    endZoneMesh.userData = { type: 'end', behaviorType: cellTypeInLayout, gridX: x_grid, gridZ: z_grid };
                    scene.add(endZoneMesh);
                    endZones.push(endZoneMesh); 
                    interactiveObjects.push(endZoneMesh);
                }
            }
        }
    }
}

/**
 * Añade una antorcha estática a la escena.
 * @param {number} pathCellX - Coordenada X del centro de la celda del camino.
 * @param {number} pathCellZ - Coordenada Z del centro de la celda del camino.
 * @param {string} attachSide - Lado de la pared al que se adjunta ('N', 'S', 'W', 'E').
 * @param {THREE.BufferGeometry} holderGeom - Geometría para el soporte de la antorcha.
 * @param {THREE.BufferGeometry} flameGeom - Geometría para la llama de la antorcha.
 * @param {THREE.Material} holderMat - Material para el soporte.
 * @param {THREE.Material} flameMatBase - Material base para la llama.
 */
function addStaticTorch(pathCellX, pathCellZ, attachSide, holderGeom, flameGeom, holderMat, flameMatBase) {
    const torchY = WALL_HEIGHT * 0.6; // Altura de la antorcha en la pared
    const holder = new THREE.Mesh(holderGeom, holderMat.clone());
    const flameMaterial = flameMatBase.clone();
    const flame = new THREE.Mesh(flameGeom, flameMaterial);
    const light = new THREE.PointLight( TORCH_COLOR, TORCH_STATIC_INTENSITY, TORCH_STATIC_DISTANCE, TORCH_STATIC_DECAY );
    light.castShadow = false; // Las antorchas estáticas no proyectan sombras para optimizar
    light.userData.baseIntensity = TORCH_STATIC_INTENSITY;
    staticTorches.push({ light: light, flameMesh: flame });

    const torchOffsetFromWall = TORCH_WALL_OFFSET;
    const halfCell = CELL_SIZE / 2;
    let torchPosX = pathCellX;
    let torchPosZ = pathCellZ;
    let holderRotationY = 0; // Rotación del soporte para que mire hacia la pared

    // Ajustar posición y rotación según el lado de la pared
    if (attachSide === 'N') { 
        torchPosZ = pathCellZ - halfCell + torchOffsetFromWall; 
        holderRotationY = Math.PI; // Mirando al Sur
    } else if (attachSide === 'S') { 
        torchPosZ = pathCellZ + halfCell - torchOffsetFromWall; 
        holderRotationY = 0; // Mirando al Norte
    } else if (attachSide === 'W') { 
        torchPosX = pathCellX - halfCell + torchOffsetFromWall; 
        holderRotationY = Math.PI / 2; // Mirando al Este
    } else if (attachSide === 'E') { 
        torchPosX = pathCellX + halfCell - torchOffsetFromWall; 
        holderRotationY = -Math.PI / 2; // Mirando al Oeste
    }

    holder.position.set(torchPosX, torchY, torchPosZ);
    holder.rotation.y = holderRotationY;

    // La llama y la luz se posicionan ligeramente por encima del soporte
    flame.position.set(torchPosX, torchY + 0.5, torchPosZ);
    light.position.set(torchPosX, torchY + 0.4, torchPosZ);

    scene.add(holder);
    scene.add(flame);
    scene.add(light);
}

/**
 * Gestiona la interacción con una puerta (abrirla y programar su cierre).
 * @param {THREE.Group} door - El objeto de grupo que representa la puerta.
 */
function handleDoorInteraction(door) {
    if (door.userData.state === 'closed' || door.userData.state === 'closing') {
        // Detener cualquier animación de cierre o temporizador existente
        if (door.userData.closeTimeout) {
            clearTimeout(door.userData.closeTimeout);
            door.userData.closeTimeout = null;
        }
        if (door.userData.openTween) {
            door.userData.openTween.stop();
        }

        door.userData.state = 'opening';
        
        // Remover de collidableObjects durante la animación de apertura
        const index = collidableObjects.indexOf(door);
        if (index > -1) {
            collidableObjects.splice(index, 1);
        }
        
        const openAngle = Math.PI / 2; // Abrir 90 grados
        const initialHalf1Pos = new THREE.Vector3().copy(door.userData.half1.position);
        const initialHalf2Pos = new THREE.Vector3().copy(door.userData.half2.position);

        // Animación de rotación de las mitades de la puerta
        const openTween = new TWEEN.Tween(door.userData.half1.rotation)
            .to({ y: -openAngle }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        new TWEEN.Tween(door.userData.half2.rotation)
            .to({ y: openAngle }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                door.userData.state = 'open';
                // Programar el cierre automático después de un retardo
                door.userData.closeTimeout = setTimeout(() => {
                    closeDoor(door);
                }, DOOR_CLOSE_DELAY);
            })
            .start();
        
        // Animación de movimiento de las mitades para despejar el paso
        new TWEEN.Tween(door.userData.half1.position)
            .to({ x: initialHalf1Pos.x - CELL_SIZE * 0.25 }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        new TWEEN.Tween(door.userData.half2.position)
            .to({ x: initialHalf2Pos.x + CELL_SIZE * 0.25 }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        door.userData.openTween = openTween; // Almacenar el tween para posible detención
    }
}

/**
 * Cierra una puerta animadamente.
 * @param {THREE.Group} door - El objeto de grupo que representa la puerta.
 */
function closeDoor(door) {
    if (door.userData.state === 'open' || door.userData.state === 'opening') {
        // Detener cualquier animación de apertura o temporizador existente
        if (door.userData.openTween) {
            door.userData.openTween.stop();
        }
        if (door.userData.closeTimeout) {
            clearTimeout(door.userData.closeTimeout);
            door.userData.closeTimeout = null;
        }

        door.userData.state = 'closing';

        // Animación de rotación de las mitades de la puerta de vuelta a 0
        const closeTween = new TWEEN.Tween(door.userData.half1.rotation)
            .to({ y: 0 }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.In)
            .start();
        new TWEEN.Tween(door.userData.half2.rotation)
            .to({ y: 0 }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.In)
            .onComplete(() => {
                door.userData.state = 'closed';
                // Añadir la puerta de nuevo a collidableObjects al finalizar la animación
                if (!collidableObjects.includes(door)) {
                    collidableObjects.push(door);
                }
            })
            .start();

        // Animación de movimiento de las mitades de vuelta al centro
        new TWEEN.Tween(door.userData.half1.position)
            .to({ x: -CELL_SIZE * 0.25 }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.In)
            .start();
        new TWEEN.Tween(door.userData.half2.position)
            .to({ x: CELL_SIZE * 0.25 }, DOOR_OPEN_DURATION)
            .easing(TWEEN.Easing.Quadratic.In)
            .start();

        door.userData.closeTween = closeTween;
    }
}

/**
 * Activa la trampa de foso, animando la cubierta y revelando el agujero.
 * Puede causar la muerte del jugador si está encima.
 * @param {object} trap - Objeto de trampa de foso.
 */
function triggerPitTrap(trap) {
    if (trap.state !== 'intact' || !gameActive) return;

    if (!trap.hasBeenRevealedByActivation) {
        trap.hasBeenRevealedByActivation = true;
    }

    trap.state = 'breaking';
    if (trap.mesh && trap.mesh.userData) trap.mesh.userData.isCollidable = false; // Deja de ser colisionable
    window.currentMazeLayout[trap.gridZ][trap.gridX] = BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT; // Cambiar tipo de celda

    // Cambiar textura de la cubierta a "agrietada"
    if(crackedTexture && trap.mesh && trap.mesh.material.map !== crackedTexture) {
        const newMaterial = trap.mesh.material.clone();
        newMaterial.map = crackedTexture.clone();
        newMaterial.map.needsUpdate = true;
        newMaterial.map.repeat.set(1,1);
        trap.mesh.material = newMaterial;
    }
    if (trap.holeMesh) trap.holeMesh.visible = true; // Mostrar el agujero

    // Animación de la cubierta de la trampa
    if (trap.mesh) {
        new TWEEN.Tween(trap.mesh.rotation)
            .to({ x: trap.mesh.rotation.x - Math.PI / 2.1 }, PIT_TRAP_BREAK_ANIMATION_TIME * 0.8) // Rotar ligeramente
            .easing(TWEEN.Easing.Quadratic.In)
            .onComplete(() => {
                 new TWEEN.Tween(trap.mesh.position)
                    .to({ y: PIT_FALL_DEPTH * 0.5 }, PIT_TRAP_BREAK_ANIMATION_TIME * 0.7) // Caer por el agujero
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(() => {
                        trap.state = 'broken';
                        if(trap.mesh) {
                             trap.mesh.visible = false; // Ocultar la cubierta una vez caída
                        }
                    })
                    .start();
            })
            .start();
    }

    // Comprobar si el jugador está sobre la trampa y hacer que caiga
    const playerGridX = Math.round(player.position.x / CELL_SIZE + currentMazeWidth / 2 - 0.5);
    const playerGridZ = Math.round(player.position.z / CELL_SIZE + currentMazeHeight / 2 - 0.5);

    if (playerGridX === trap.gridX && playerGridZ === trap.gridZ && playerOnGround) {
        playerFallingIntoPit = { x: trap.gridX, z: trap.gridZ };
        playerOnGround = false;
        playerVelocity.y = -1.0; // Iniciar caída
        window.showMessage("¡El suelo se rompe!", 2000);
    }
}

/**
 * Activa la trampa de bloque que cae, haciendo que las rocas se hagan visibles y caigan.
 * @param {object} trap - Objeto de trampa de bloque que cae.
 */
function triggerFallingBlockTrap(trap) {
    if (trap.state !== 'armed' || !gameActive) return;
    trap.state = 'falling';
    trap.blockMesh.visible = true; // Mostrar las rocas
    if (!trap.hasBeenRevealedByActivation) trap.hasBeenRevealedByActivation = true;
}

/**
 * Activa la trampa de pinchos, haciendo que los pinchos se eleven.
 * @param {object} trap - Objeto de trampa de pinchos.
 */
function triggerSpikeTrap(trap) {
    if (trap.state !== 'hidden' || !gameActive) return;
    trap.state = 'rising';
    trap.spikeGroup.visible = true; // Mostrar los pinchos
    window.currentMazeLayout[trap.triggerCellZ][trap.triggerCellX] = BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT; // Marcar celda como "rota" en minimapa

    if (!trap.hasBeenRevealedByActivation) trap.hasBeenRevealedByActivation = true;

    // Animación de ascenso de los pinchos (escalonada)
    trap.spikeGroup.children.forEach((spike, index) => {
        new TWEEN.Tween(spike.position)
            .to({ y: SPIKE_HEIGHT / 2 - 0.1 }, SPIKE_RISE_TIME)
            .easing(TWEEN.Easing.Quadratic.Out)
            .delay(index * 30) // Pequeño retardo entre pinchos para un efecto "ondeante"
            .onComplete(() => {
                if (index === trap.spikeGroup.children.length - 1) { // Cuando el último pincho termina de subir
                    trap.state = 'risen';
                    // Activar el tiempo durante el cual los pinchos pueden dañar
                    trap.damageReadyTime = clock.elapsedTime * 1000 + SPIKE_TRAP_DEACTIVATION_TIME; 
                    window.showMessage("¡Pinchos activados!", 1500);
                }
            })
            .start();
    });
}

/**
 * Determina si una celda es transitable para el Minotauro.
 * El Minotauro no puede pasar por paredes, lava, trampas originales (independientemente de su estado),
 * fosos rotos ni plataformas móviles.
 * @param {number} gridX - Coordenada X de la celda en la cuadrícula.
 * @param {number} gridZ - Coordenada Z de la celda en la cuadrícula.
 * @param {Array<Array<number>>} targetMazeLayout - El array del laberinto en su estado actual (para puertas, fosos rotos).
 * @param {Array<Array<number>>} originalMazeRef - El array del lababirnto en su estado original (para tipos de trampas).
 * @returns {boolean} True si la celda es transitable, false en caso contrario.
 */
function isCellWalkableForMinotaur(gridX, gridZ, targetMazeLayout, originalMazeRef) {
    if (gridX < 0 || gridX >= currentMazeWidth || gridZ < 0 || gridZ >= currentMazeHeight) {
        return false; // Fuera de los límites
    }
    if (!targetMazeLayout[gridZ] || !originalMazeRef[gridZ]) return false;

    const cellTypeInLayout = targetMazeLayout[gridZ][gridX];
    const originalCellType = originalMazeRef[gridZ][gridX];

    if (cellTypeInLayout === 0) return false; // Pared en el layout actual
    if (cellTypeInLayout === LAVA_CELL_TYPE) return false; // Lava
    if (cellTypeInLayout === DOOR_H_CELL_TYPE || cellTypeInLayout === DOOR_V_CELL_TYPE) { // Puertas cerradas son obstáculos
        const door = doorObjects.find(d => d.userData.gridX === gridX && d.userData.gridZ === gridZ);
        if (door && (door.userData.state === 'closed' || door.userData.state === 'closing')) {
            return false;
        }
    }

    // El Minotauro evita pisar cualquier tipo de trampa original, independientemente de su estado actual
    // EXCEPTO para los fosos que ya están rotos, que ahora son agujeros y por lo tanto son parte de su terreno (o un "no-terreno")
    if (originalCellType === PIT_TRAP_CELL_TYPE ||
        originalCellType === FALLING_BLOCK_TRAP_CELL_TYPE ||
        originalCellType === SPIKE_TRAP_CELL_TYPE ||
        originalCellType === MOVING_PLATFORM_CELL_TYPE // El Minotauro evita las plataformas móviles
        ) {
        return false; 
    }
    
    // También evita pisar fosos actualmente rotos (agujeros)
    if (cellTypeInLayout === BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT) return false; 

    return true; // Transitable
}


/**
 * Actualiza la lógica del Minotauro (patrulla, persecución, colisión).
 * @param {number} deltaTime - Tiempo transcurrido desde el último frame en segundos.
 */
function updateMinotaur(deltaTime) {
    if (!minotaurEnemy || !gameActive || playerFallingIntoPit) return;

    const currentTime = clock.elapsedTime * 1000; 

    // Actualizar posición de cuadrícula del Minotauro
    minotaurEnemy.userData.gridX = Math.round(minotaurEnemy.position.x / CELL_SIZE + currentMazeWidth / 2 - 0.5);
    minotaurEnemy.userData.gridZ = Math.round(minotaurEnemy.position.z / CELL_SIZE + currentMazeHeight / 2 - 0.5);

    // Actualizar posición del cilindro de colisión (si existe)
    if (minotaurCollisionCylinder) {
        minotaurCollisionCylinder.position.set(
            minotaurEnemy.position.x,
            minotaurEnemy.position.y + MINOTAUR_COLLISION_HEIGHT / 2, 
            minotaurEnemy.position.z
        );
        minotaurCollisionCylinder.rotation.copy(minotaurEnemy.rotation);
    }

    // Determinar si el Minotauro puede ver al jugador
    const canSee = canMinotaurSeePlayer();

    // Lógica de estados del Minotauro (patrulla vs. persecución)
    if (minotaurState === 'chasing') {
        if (canSee) {
            minotaurLastSawPlayerTime = currentTime;
            minotaurTargetCell = { 
                x: Math.round(player.position.x / CELL_SIZE + currentMazeWidth / 2 - 0.5),
                z: Math.round(player.position.z / CELL_SIZE + currentMazeHeight / 2 - 0.5)
            };
        } else {
            if (currentTime - minotaurLastSawPlayerTime > MINOTAUR_LOSE_SIGHT_TIME) {
                minotaurState = 'patrolling';
                minotaurTargetCell = null; 
                minotaurPatrolNextTargetTime = currentTime; 
            }
        }
    } else if (minotaurState === 'patrolling') {
        if (canSee) {
            minotaurState = 'chasing';
            minotaurLastSawPlayerTime = currentTime;
            minotaurTargetCell = { 
                x: Math.round(player.position.x / CELL_SIZE + currentMazeWidth / 2 - 0.5),
                z: Math.round(player.position.z / CELL_SIZE + currentMazeHeight / 2 - 0.5)
            };
        } else {
            // Si no tiene un objetivo o ha pasado suficiente tiempo, buscar nuevo objetivo de patrulla
            if (!minotaurTargetCell || (minotaurEnemy.userData.gridX === minotaurTargetCell.x && minotaurEnemy.userData.gridZ === minotaurTargetCell.z) || currentTime > minotaurPatrolNextTargetTime) {
                minotaurTargetCell = findRandomPatrolTarget(minotaurEnemy.userData.gridX, minotaurEnemy.userData.gridZ);
                minotaurPatrolNextTargetTime = currentTime + MINOTAUR_PATROL_NEW_TARGET_INTERVAL * (0.5 + Math.random()); 
                if (!minotaurTargetCell) { // Si no encuentra un objetivo de patrulla, vuelve a su posición inicial
                    minotaurTargetCell = minotaurInitialGridPos; 
                }
            }
        }
    }
    
    // Determinar la posición objetivo final
    let finalTargetPos; 
    if (minotaurState === 'chasing' && canSee && player) { 
        finalTargetPos = player.position.clone();
        finalTargetPos.y = minotaurEnemy.position.y; 
    } else if (minotaurTargetCell) { 
        const targetWorldX = (minotaurTargetCell.x - currentMazeWidth / 2 + 0.5) * CELL_SIZE;
        const targetWorldZ = (minotaurTargetCell.z - currentMazeHeight / 2 + 0.5) * CELL_SIZE;
        finalTargetPos = new THREE.Vector3(targetWorldX, minotaurEnemy.position.y, targetWorldZ);
    }

    // Mover y rotar al Minotauro hacia el objetivo
    if (finalTargetPos) {
        const direction = finalTargetPos.clone().sub(minotaurEnemy.position);
        direction.y = 0; 
        const distanceToFinalTarget = direction.length();

        if (distanceToFinalTarget > 0.1) { // Solo moverse si no está ya en el objetivo
            direction.normalize();
            const currentSpeed = (minotaurState === 'chasing') ? MINOTAUR_CHASE_SPEED : MINOTAUR_PATROL_SPEED;
            
            const moveStep = direction.clone().multiplyScalar(currentSpeed * deltaTime);
            const nextPotentialPos = minotaurEnemy.position.clone().add(moveStep);
            const nextGridX = Math.round(nextPotentialPos.x / CELL_SIZE + currentMazeWidth / 2 - 0.5);
            const nextGridZ = Math.round(nextPotentialPos.z / CELL_SIZE + currentMazeHeight / 2 - 0.5);

            let allowMove = true;
            // Comprobar si la *siguiente celda de la cuadrícula* es transitable (no solo la posición inmediata)
            if (minotaurEnemy.userData.gridX !== nextGridX || minotaurEnemy.userData.gridZ !== nextGridZ) { 
                if (!isCellWalkableForMinotaur(nextGridX, nextGridZ, currentMazeLayout, maze)) {
                    allowMove = false;
                }
            }

            if (allowMove) {
                minotaurEnemy.position.add(moveStep);
                minotaurEnemy.userData.stuckCounter = 0; // Reiniciar contador de atascado
            } else {
                // El Minotauro está bloqueado. Incrementar contador de atascado y buscar una alternativa.
                minotaurEnemy.userData.stuckCounter += deltaTime;

                if (minotaurState === 'chasing' && minotaurEnemy.userData.stuckCounter > 0.5) { // Si está atascado durante medio segundo persiguiendo
                    const currentMinoX = minotaurEnemy.userData.gridX;
                    const currentMinoZ = minotaurEnemy.userData.gridZ;
                    const directions = [{dx:0, dz:1}, {dx:0, dz:-1}, {dx:1, dz:0}, {dx:-1, dz:0}]; // Norte, Sur, Este, Oeste
                    let bestNextCell = null;
                    let minDistanceToPlayerFromAdj = Infinity; 

                    // Evaluar celdas adyacentes para encontrar un camino
                    for (const dir of directions) {
                        const nextX = currentMinoX + dir.dx;
                        const nextZ = currentMinoZ + dir.dz;
                        
                        if (isCellWalkableForMinotaur(nextX, nextZ, currentMazeLayout, maze)) {
                            const tempTargetWorldX = (nextX - currentMazeWidth / 2 + 0.5) * CELL_SIZE;
                            const tempTargetWorldZ = (nextZ - currentMazeHeight / 2 + 0.5) * CELL_SIZE;
                            const distToPlayerFromNextCell = new THREE.Vector3(tempTargetWorldX, player.position.y, tempTargetWorldZ).distanceTo(player.position);

                            // Priorizar celdas que se acerquen más al jugador
                            if (distToPlayerFromNextCell < minDistanceToPlayerFromAdj) {
                                minDistanceToPlayerFromAdj = distToPlayerFromNextCell;
                                bestNextCell = { x: nextX, z: nextZ };
                            }
                        }
                    }

                    if (bestNextCell) {
                        minotaurTargetCell = bestNextCell; // Establecer esta celda adyacente transitable como nuevo objetivo temporal
                        minotaurEnemy.userData.stuckCounter = 0; // Reiniciar contador de atascado
                    } else {
                        // No se encontró un buen camino adyacente, el Minotauro se rinde y vuelve a patrullar
                        minotaurState = 'patrolling';
                        minotaurTargetCell = null;
                        minotaurPatrolNextTargetTime = currentTime + MINOTAUR_PATROL_NEW_TARGET_INTERVAL;
                        minotaurEnemy.userData.stuckCounter = 0;
                    }
                }
            }
            
            // Rotar al Minotauro suavemente hacia la dirección de movimiento
            const targetRotationY = Math.atan2(direction.x, direction.z) + Math.PI; // Rotar 180 grados adicionales
            let currentRotationY = minotaurEnemy.rotation.y;
            
            // Asegurar que la rotación sea la más corta
            while (targetRotationY - currentRotationY > Math.PI) currentRotationY += 2 * Math.PI;
            while (targetRotationY - currentRotationY < -Math.PI) currentRotationY -= 2 * Math.PI;
            
            minotaurEnemy.rotation.y = THREE.MathUtils.lerp(currentRotationY, targetRotationY, MINOTAUR_TURN_SPEED * deltaTime);

        } else { 
            minotaurEnemy.userData.stuckCounter = 0; // Reiniciar contador de atascado si el objetivo es alcanzado
            if (minotaurState === 'patrolling') minotaurTargetCell = null; 
        }
    } else {
        minotaurEnemy.userData.stuckCounter = 0; // Reiniciar contador de atascado si no hay objetivo
    }


    // Comprobación de ataque (colisión) con el jugador usando Bounding Boxes
    if (player && minotaurEnemy && gameActive) { 
        playerCollisionBox.setFromCenterAndSize(player.position, new THREE.Vector3(PLAYER_RADIUS * 2, PLAYER_HEIGHT, PLAYER_RADIUS * 2));
        
        minotaurCollisionBox.setFromObject(minotaurEnemy); 
        minotaurCollisionBox.min.y = minotaurEnemy.position.y; 
        minotaurCollisionBox.max.y = minotaurEnemy.position.y + MINOTAUR_COLLISION_HEIGHT;

        if (playerCollisionBox.intersectsBox(minotaurCollisionBox)) {
            window.loseGame("¡Atrapado por el Minotauro!"); // Llamada a función en ui_and_data.js
        }
    }
}

/**
 * Determina si el Minotauro tiene línea de visión directa hacia el jugador.
 * Utiliza raycasting para comprobar si hay paredes entre ellos.
 * @returns {boolean} True si el Minotauro puede ver al jugador, false en caso contrario.
 */
function canMinotaurSeePlayer() {
    if (!minotaurEnemy || !player || !gameActive) return false;

    minotaurToPlayerVec.subVectors(player.position, minotaurEnemy.position);
    const distanceSq = minotaurToPlayerVec.lengthSq();

    // Comprobación de distancia (rango de visión)
    if (distanceSq > MINOTAUR_VISION_RANGE_SQ) {
        return false; 
    }

    // Comprobación de ángulo (campo de visión)
    minotaurEnemy.getWorldDirection(minotaurForwardVec);
    minotaurForwardVec.y = 0; 
    minotaurForwardVec.normalize();

    const playerDir = minotaurToPlayerVec.clone().setY(0).normalize();
    const dot = minotaurForwardVec.dot(playerDir);

    if (dot < MINOTAUR_VISION_ANGLE_DOT) {
        return false; 
    }

    // Raycasting para comprobar obstáculos (paredes o puertas cerradas)
    minotaurRaycaster.set(minotaurEnemy.position, minotaurToPlayerVec.normalize());
    minotaurRaycaster.far = Math.sqrt(distanceSq); 
    const wallObjects = collidableObjects.filter(obj => obj.userData.isWall || (obj.userData.isDoor && (obj.userData.state === 'closed' || obj.userData.state === 'closing')) ); // Puertas cerradas bloquean la vista
    const intersects = minotaurRaycaster.intersectObjects(wallObjects, false);

    // Si hay intersecciones antes del jugador, la línea de visión está bloqueada
    if (intersects.length > 0 && intersects[0].distance * intersects[0].distance < distanceSq - 0.1) { 
         return false; 
    }
    return true; // Puede ver al jugador
}

/**
 * Encuentra una celda adyacente transitable aleatoria para que el Minotauro la use como objetivo de patrulla.
 * @param {number} currentX - Coordenada X actual del Minotauro en la cuadrícula.
 * @param {number} currentZ - Coordenada Z actual del Minotauro en la cuadrícula.
 * @returns {object|null} Un objeto {x, z} para la celda objetivo o null si no hay celdas transitables adyacentes.
 */
function findRandomPatrolTarget(currentX, currentZ) {
    const possibleMoves = [];
    const directions = [{dx:0, dz:1}, {dx:0, dz:-1}, {dx:1, dz:0}, {dx:-1, dz:0}]; // Direcciones: Abajo, Arriba, Derecha, Izquierda

    for (const dir of directions) {
        const nextX = currentX + dir.dx;
        const nextZ = currentZ + dir.dz;
        if (isCellWalkableForMinotaur(nextX, nextZ, currentMazeLayout, maze)) { // Comprobar si la celda es transitable
            possibleMoves.push({ x: nextX, z: nextZ });
        }
    }

    if (possibleMoves.length > 0) {
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
    return null; 
}

/**
 * Genera una partícula de humo y la añade a la escena.
 */
function spawnSmokeParticle() {
    if (smokeParticles.length >= MAX_SMOKE_PARTICLES) return; // Limitar el número de partículas
    if (!spearFlameMesh || !gameActive || !player) return;

    // Obtener la posición mundial de la llama de la antorcha del jugador
    spearLightAndFlameGroup.getWorldPosition(smokeSpawnPosition); 

    // Crear la partícula de humo
    const particle = new THREE.Mesh(smokeParticleGeometry, smokeParticleMaterial.clone()); 
    particle.position.copy(smokeSpawnPosition);
    particle.position.y += SPEAR_FLAME_SIZE * 0.5; // Ajustar la altura de aparición

    particle.userData.life = 0;
    particle.userData.maxLife = SMOKE_PARTICLE_MIN_LIFE + Math.random() * (SMOKE_PARTICLE_MAX_LIFE - SMOKE_PARTICLE_MIN_LIFE);
    
    // Asignar una velocidad inicial aleatoria
    particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,  
        0.5 + Math.random() * 0.3,    
        (Math.random() - 0.5) * 0.15   
    );
    // Ajustar la velocidad para que siga al jugador
    particle.userData.velocity.x -= playerVelocity.x * 0.05; 
    particle.userData.velocity.z -= playerVelocity.z * 0.05; 


    scene.add(particle);
    smokeParticles.push(particle); // Añadir a la lista de partículas activas
}

/**
 * Actualiza la posición, tamaño y opacidad de las partículas de humo.
 * @param {number} deltaTime - Tiempo transcurrido desde el último frame en segundos.
 */
function updateSmokeParticles(deltaTime) {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.userData.life += deltaTime; // Aumentar tiempo de vida

        if (p.userData.life >= p.userData.maxLife) {
            // Si la partícula ha superado su vida máxima, eliminarla
            scene.remove(p);
            if (p.material) p.material.dispose(); 
            smokeParticles.splice(i, 1);
            continue;
        }

        p.position.addScaledVector(p.userData.velocity, deltaTime); // Mover partícula
        p.userData.velocity.y += 0.20 * deltaTime; // La partícula sube lentamente
        
        // Ajustar opacidad y escala en función del tiempo de vida
        const lifeRatio = p.userData.life / p.userData.maxLife;
        p.material.opacity = SMOKE_PARTICLE_START_OPACITY * (1 - lifeRatio);
        
        const currentScale = SMOKE_PARTICLE_START_SIZE + (SMOKE_PARTICLE_END_SIZE - SMOKE_PARTICLE_START_SIZE) * lifeRatio;
        p.scale.set(currentScale, currentScale, currentScale);
    }

    // Generar nuevas partículas si el jugador se está moviendo y está en el suelo
    if(playerOnGround && (Math.abs(playerVelocity.x) > 0.1 || Math.abs(playerVelocity.z) > 0.1 ) ){
        timeSinceLastSmokeSpawn += deltaTime;
        if (timeSinceLastSmokeSpawn > SMOKE_SPAWN_INTERVAL) {
            spawnSmokeParticle();
            timeSinceLastSmokeSpawn = 0;
        }
    }
}

// Exportar funciones y variables que necesitan ser accesibles globalmente por otros scripts
// Las variables globales ya están expuestas en game_engine.js
window.findCell = findCell;
window.findDeadEnds = findDeadEnds;
window.buildMazeGeometry = buildMazeGeometry;
window.addStaticTorch = addStaticTorch;
window.handleDoorInteraction = handleDoorInteraction;
window.closeDoor = closeDoor;
window.triggerPitTrap = triggerPitTrap;
window.triggerFallingBlockTrap = triggerFallingBlockTrap;
window.triggerSpikeTrap = triggerSpikeTrap;
window.isCellWalkableForMinotaur = isCellWalkableForMinotaur;
window.updateMinotaur = updateMinotaur;
window.canMinotaurSeePlayer = canMinotaurSeePlayer;
window.findRandomPatrolTarget = findRandomPatrolTarget;
window.spawnSmokeParticle = spawnSmokeParticle;
window.updateSmokeParticles = updateSmokeParticles;