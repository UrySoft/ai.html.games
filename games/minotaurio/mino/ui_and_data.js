// ui_and_data.js: Gestiona la interfaz de usuario, IndexedDB, editor de escenarios y flujo general del juego.

// --- Referencias a elementos del DOM ---
// Se inicializan aquí una vez que el DOM esté cargado
let startPredefinedMapsButton;
let startCustomGameButton;
let loadingTextElement;
let startOptionsDiv;
let customGameScreen;
let scenarioEditorScreen;
let customScenarioListUL;
let noCustomScenariosMsg;
let createNewScenarioBtn;
let importScenarioBtn;
let importFileInput;
let backToMainMenuBtn;
let backToCustomScreenBtn;
let dimensionSelectorDiv;
let scenarioSizeSelect;
let confirmSizeBtn;
let brushToolsDiv;
let scenarioNameInput;
let editorGridContainer;
let editorActionsDiv;
let saveScenarioBtn;
let playEditedScenarioBtn;
let editorMessageSpan;
let textureSelectorsDiv;
let endCellOptionsDiv;
let specificNextScenarioSelect;
let nextScenarioSelectionScreen;
let nextScenarioListUL;
let noNextScenariosMsg;
let cancelNextScenarioBtn;
let predefinedMapsScreen;
let predefinedMapListUL;
let noPredefinedMapsMsg;
let backToMainFromPredefinedBtn;
let fullscreenButton;
let gameMenuOverlay;
let resumeGameBtn;
let mainMenuFromGameBtn;
let fullscreenToggleButton;
let cameraSensitivitySlider;
let gameMenuActionButton;

// --- Variables del editor ---
let currentEditingScenario = null;
let editorGridData = [];
let selectedBrush = 'wall';
let hasUnsavedChanges = false;
let editorCellElements = [];

// --- Variables de IndexedDB ---
const DB_NAME = "MinotaurioCustomScenariosDB";
const DB_VERSION = 1;
const STORE_NAME = "scenarios";
let db;

/**
 * Inicializa la base de datos IndexedDB.
 * @returns {Promise<IDBDatabase>} Una promesa que resuelve con la instancia de la DB.
 */
function initDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.warn("IndexedDB no soportado por este navegador. Juego Personalizado no funcionará.");
            alert("Tu navegador no soporta IndexedDB, necesario para guardar escenarios personalizados.");
            reject("IndexedDB not supported");
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                store.createIndex("name", "name", { unique: false });
            }
            console.log("IndexedDB: Actualización/creación de base de datos completada.");
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB: Conexión exitosa.");
            resolve(db);
        };
        request.onerror = (event) => {
            console.error("IndexedDB: Error al abrir la base de datos", event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Guarda o actualiza un escenario en la base de datos.
 * @param {object} scenarioData - Los datos del escenario a guardar.
 * @returns {Promise<object>} Una promesa que resuelve con los datos del escenario guardado (incluyendo ID si es nuevo).
 */
function saveScenarioDB(scenarioData) {
    return new Promise((resolve, reject) => {
        if (!db) { reject("DB no inicializada"); return; }
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        let request;
        let dataToStore;
        if (scenarioData.id !== null && scenarioData.id !== undefined) {
             dataToStore = { ...scenarioData };
             request = store.put(dataToStore); // Actualizar existente
        } else {
             const { id, ...dataWithoutId } = scenarioData;
             dataToStore = dataWithoutId;
             request = store.add(dataToStore); // Añadir nuevo
        }
        request.onsuccess = (event) => {
            const resultId = event.target.result;
            console.log("Escenario guardado/actualizado en DB:", scenarioData.name, "ID asignado/actualizado:", resultId);
            scenarioData.id = resultId;
            resolve(scenarioData);
        };
        request.onerror = (event) => {
            console.error("Error al guardar escenario en DB:", event.target.error);
            if (event.target.error.name === 'ConstraintError') {
                alert("Error de restricción al guardar el escenario. Puede que ya exista un escenario con un nombre o identificador similar (si hay reglas de unicidad). Revisa la consola.");
            } else if (event.target.error.name === 'DataError') {
                 alert("Error de datos al guardar el escenario. Revisa el formato o los valores. Revisa la consola.");
            }
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene todos los escenarios guardados de la base de datos.
 * @returns {Promise<Array<object>>} Una promesa que resuelve con un array de escenarios.
 */
function getAllScenariosDB() {
    return new Promise((resolve, reject) => {
        if (!db) { resolve([]); return; }
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => { resolve(request.result); };
        request.onerror = (event) => {
            console.error("Error al obtener todos los escenarios:", event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene un escenario por su ID de la base de datos.
 * @param {number} id - El ID del escenario.
 * @returns {Promise<object|undefined>} Una promesa que resuelve con el escenario o undefined si no se encuentra.
 */
function getScenarioByIdDB(id) {
    return new Promise((resolve, reject) => {
        if (!db) { reject("DB no inicializada"); return; }
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => { resolve(request.result);};
        request.onerror = (event) => {
            console.error("Error al obtener escenario por ID:", id, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Elimina un escenario de la base de datos.
 * @param {number} id - El ID del escenario a eliminar.
 * @returns {Promise<void>} Una promesa que resuelve cuando el escenario es eliminado.
 */
function deleteScenarioDB(id) {
    return new Promise((resolve, reject) => {
        if (!db) { reject("DB no inicializada"); return; }
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => {
            console.log("Escenario eliminado de DB, ID:", id);
            resolve();
        };
        request.onerror = (event) => {
            console.error("Error al eliminar escenario de DB:", event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Muestra un mensaje temporal en la pantalla.
 * @param {string} text - El texto del mensaje.
 * @param {number} duration - Duración en milisegundos (defecto: 2500).
 */
let messageTimeout = null;
function showMessage(text, duration = 2500) { 
    if (messageTimeout) clearTimeout(messageTimeout); 
    messageDiv.textContent = text; 
    messageDiv.style.display = 'block'; 
    messageTimeout = setTimeout(() => { 
        messageDiv.style.display = 'none'; 
        messageTimeout = null; 
    }, duration); 
}

/**
 * Carga y reproduce el siguiente escenario especificado por su identificador.
 * Puede intentar cargar por nombre de archivo, nombre de escenario personalizado o secuencialmente.
 * @param {string} targetIdentifier - Nombre del escenario o nombre de archivo.
 * @param {boolean} isSequentialPredefinedFallback - Si true, intenta cargar el siguiente mapa predefinido si targetIdentifier falla.
 * @param {number} sequentialIndex - El índice del mapa predefinido a cargar si isSequentialPredefinedFallback es true.
 */
async function loadAndPlayNextScenario(targetIdentifier, isSequentialPredefinedFallback, sequentialIndex) {
    let scenarioToPlay = null;
    let attemptedIdentifier = targetIdentifier || (isSequentialPredefinedFallback && sequentialIndex ? `map${sequentialIndex}` : 'unknown');
    console.log(`loadAndPlayNextScenario: Buscando siguiente escenario. Identificador objetivo: "${attemptedIdentifier}"`);

    // Prioridad 1: El identificador es un nombre de archivo .json predefinido completo
    if (targetIdentifier && targetIdentifier.endsWith('.json')) {
        const mapUrl = `${PREDEFINED_MAP_BASE_URL}${targetIdentifier}`;
        try {
            const response = await fetch(mapUrl);
            if (response.ok) {
                scenarioToPlay = await response.json();
                scenarioToPlay.fileName = targetIdentifier; 
                console.log(`loadAndPlayNextScenario: Mapa predefinido encontrado por nombre de archivo: ${targetIdentifier}`);
            }
        } catch (error) { /* Ignorar, se intentarán otras opciones */ }
    }

    // Prioridad 2: El identificador es un nombre de escenario personalizado
    if (!scenarioToPlay && targetIdentifier && !targetIdentifier.endsWith('.json')) {
        const customScenarios = await getAllScenariosDB();
        scenarioToPlay = customScenarios.find(s => s.name === targetIdentifier);
        if (scenarioToPlay) {
            console.log(`loadAndPlayNextScenario: Escenario personalizado encontrado por nombre: ${targetIdentifier}`);
        }
    }
    
    // Prioridad 3: El identificador es un nombre descriptivo de un mapa predefinido (sin .json)
    if (!scenarioToPlay && targetIdentifier) {
        let potentialFileName = targetIdentifier.endsWith('.json') ? targetIdentifier : `${targetIdentifier}.json`;
        if (!targetIdentifier.endsWith('.json') && !targetIdentifier.startsWith("map")) { 
            console.log(`loadAndPlayNextScenario: "${targetIdentifier}" no es nombre de archivo ni personalizado. Buscando como nombre descriptivo en mapas predefinidos...`);
            const allPredefinedMaps = [];
            for (let i = 1; i <= MAX_PREDEFINED_MAPS; i++) {
                try {
                    const res = await fetch(`${PREDEFINED_MAP_BASE_URL}map${i}.json`);
                    if (res.ok) {
                        const mapJson = await res.json();
                        mapJson.fileName = `map${i}.json`; 
                        allPredefinedMaps.push(mapJson);
                    }
                } catch (e) { /* Ignorar si un mapa no existe */ }
            }
            scenarioToPlay = allPredefinedMaps.find(m => m.name === targetIdentifier);
            if(scenarioToPlay) console.log(`loadAndPlayNextScenario: Mapa predefinido encontrado por nombre descriptivo "${targetIdentifier}": ${scenarioToPlay.fileName}`);
        } else if (!targetIdentifier.endsWith('.json') && targetIdentifier.startsWith("map")) { 
             const mapUrl = `${PREDEFINED_MAP_BASE_URL}${potentialFileName}`;
             try {
                const response = await fetch(mapUrl);
                if (response.ok) {
                    scenarioToPlay = await response.json();
                    scenarioToPlay.fileName = potentialFileName;
                    console.log(`loadAndPlayNextScenario: Mapa predefinido encontrado (nombre sin .json): ${potentialFileName}`);
                }
            } catch (error) { /* Ignorar */ }
        }
    }

    // Prioridad 4: Carga secuencial de mapa predefinido (si isSequentialPredefinedFallback es true)
    if (!scenarioToPlay && isSequentialPredefinedFallback && sequentialIndex) {
        const nextMapFileName = `map${sequentialIndex}.json`;
        const mapUrl = `${PREDEFINED_MAP_BASE_URL}${nextMapFileName}`;
        try {
            const response = await fetch(mapUrl);
            if (response.ok) {
                scenarioToPlay = await response.json();
                scenarioToPlay.fileName = nextMapFileName;
                console.log(`loadAndPlayNextScenario: Mapa predefinido encontrado por carga secuencial: ${nextMapFileName}`);
            }
        } catch (error) { /* Ignorar */ }
    }


    if (scenarioToPlay) {
        if (nextScenarioSelectionScreen) nextScenarioSelectionScreen.style.display = 'none';
        if (predefinedMapsScreen) predefinedMapsScreen.style.display = 'none';
        if(loadingTextElement) loadingTextElement.style.display = 'block';
        if(loadingScreenElement) loadingScreenElement.style.display = 'flex';

        window.cleanUpScene(); // Llamada a función en game_engine.js
        window.preloadAssets(() => { // Llamada a función en game_engine.js
            if (scenarioToPlay.textures) {
                selectTexturesForScenario(scenarioToPlay.textures);
            } else {
                selectRandomTextures(); 
            }
            window.currentPlayingScenarioData = JSON.parse(JSON.stringify(scenarioToPlay));
            window.init(scenarioToPlay); // Llamada a función en game_engine.js
            finalizeLoadingScreen();
        });
    } else {
        alert(`Error: No se pudo encontrar el siguiente escenario "${attemptedIdentifier}". Volviendo al menú principal.`);
        window.location.reload();
    }
}

/**
 * Se activa cuando el jugador llega al punto de fin del laberinto.
 * @param {number} endCellType - El tipo de celda final (terminar partida o cargar siguiente).
 * @param {number} endCellX - Coordenada X de la celda final.
 * @param {number} endCellZ - Coordenada Z de la celda final.
 */
function winGame(endCellType = END_CELL_TERMINATE, endCellX = -1, endCellZ = -1) {
    if (!window.gameActive) return;
    window.gameActive = false;
    TWEEN.removeAll();

    console.log("Juego ganado! Tipo de fin:", endCellType, "en celda:", endCellX, ",", endCellZ);
    if (window.isPointerLocked && document.pointerLockElement) document.exitPointerLock();

    showMessage("¡HAS ESCAPADO!", DEATH_IMAGE_DISPLAY_DURATION); 

    if (endCellType === END_CELL_SPECIFIC_NEXT) {
        let nextScenarioIdentifier = window.currentPlayingScenarioData?.specificNextScenarioName;
        let isSequentialFallback = false;
        let sequentialIndex = null;

        // Si no se definió un siguiente escenario específico pero el mapa actual es predefinido (mapX.json),
        // intentar cargar el siguiente de la secuencia (mapX+1.json)
        if (!nextScenarioIdentifier && window.currentPlayingScenarioData?.fileName && window.currentPlayingScenarioData.fileName.startsWith("map")) {
            const currentMapNumberMatch = window.currentPlayingScenarioData.fileName.match(/map(\d+)\.json/);
            if (currentMapNumberMatch && currentMapNumberMatch[1]) {
                const currentMapNum = parseInt(currentMapNumberMatch[1]);
                if (!isNaN(currentMapNum) && currentMapNum < MAX_PREDEFINED_MAPS) {
                    sequentialIndex = currentMapNum + 1;
                    isSequentialFallback = true;
                }
            }
        }
        
        if (nextScenarioIdentifier || isSequentialFallback) {
             setTimeout(() => {
                loadAndPlayNextScenario(nextScenarioIdentifier, isSequentialFallback, sequentialIndex);
            }, 1500);
        } else {
            console.warn("Fin específico activado, pero no se pudo determinar el siguiente escenario. Terminando partida.");
            showMessage("¡HAS ESCAPADO! (Fin de la secuencia)", 10000);
            setTimeout(() => { window.location.reload(); }, 5000);
        }

    } else { 
        showMessage("¡HAS ESCAPADO!", 10000);
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
}

/**
 * Resetea el estado del juego después de una derrota o para reintentar.
 */
function performGameResetLogic() {
    // Resetear posición y velocidad del jugador
    window.player.position.copy(window.initialPlayerPosition);
    window.playerVelocity.set(0, 0, 0);
    window.playerOnGround = true;
    window.playerFallingIntoPit = null;
    window.moveForward = 0;
    window.moveRight = 0;
    window.keyStates = {};
    window.cameraPhi = Math.PI / 3;
    window.cameraTheta = window.player.rotation.y - Math.PI; 
    window.updateCamera();

    // Resetear animaciones del jugador
    if (window.playerMixer) {
        window.playerMixer.stopAllAction(); 
        if (window.idleAction) {
            window.idleAction.reset().fadeIn(0.1).play(); 
            window.currentAction = window.idleAction;
        } else {
            window.currentAction = null;
        }
    }
    
    // Resetear Minotauro
    if (window.minotaurEnemy && window.minotaurInitialGridPos) {
        const initialWorldX = (window.minotaurInitialGridPos.x - window.currentMazeWidth / 2 + 0.5) * CELL_SIZE;
        const initialWorldZ = (window.minotaurInitialGridPos.z - window.currentMazeHeight / 2 + 0.5) * CELL_SIZE;
        
        if (window.minotaurModelGLB) { 
            const tempModelForBBoxReset = window.minotaurModelGLB.clone(); 
            const originalBBoxReset = new THREE.Box3().setFromObject(tempModelForBBoxReset);
            const originalSizeReset = new THREE.Vector3();
            originalBBoxReset.getSize(originalSizeReset);
            const originalMinYReset = originalBBoxReset.min.y;

            let scaleFactorReset = 1.0;
            if (originalSizeReset.y > 0.01) {
                scaleFactorReset = MINOTAUR_TARGET_HEIGHT / originalSizeReset.y;
            } else {
                 console.warn("RESET: Minotaur model original height is very small or zero. Using scale factor 1.");
            }
            window.minotaurEnemy.scale.set(scaleFactorReset, scaleFactorReset, scaleFactorReset);

            const worldPosYForMinotaurOriginReset = -(originalMinYReset * scaleFactorReset);
            window.minotaurEnemy.position.set(initialWorldX, worldPosYForMinotaurOriginReset, initialWorldZ);
            window.minotaurEnemy.rotation.y = Math.PI; 
        } else { 
            window.minotaurEnemy.position.set(initialWorldX, MINOTAUR_COLLISION_HEIGHT / 2, initialWorldZ); 
            window.minotaurEnemy.rotation.y = Math.PI; 
        }

        window.minotaurState = 'patrolling';
        window.minotaurTargetCell = null;
        window.minotaurLastSawPlayerTime = 0;
        window.minotaurPatrolNextTargetTime = window.clock.elapsedTime * 1000;
        window.minotaurEnemy.userData.stuckCounter = 0; 
    }

    // Resetear trampas
    for (const trap of window.pitTrapObjects) {
        if (trap.state === 'broken' || trap.state === 'breaking') {
            trap.state = 'intact';
            window.currentMazeLayout[trap.gridZ][trap.gridX] = PIT_TRAP_CELL_TYPE;
            if (trap.mesh) {
                trap.mesh.visible = true;
                trap.mesh.userData.isCollidable = true;
                trap.mesh.position.set(trap.worldX, -PIT_COVER_THICKNESS / 2, trap.worldZ);
                trap.mesh.rotation.set(0, 0, 0);
                if (window.floorTexture && trap.mesh.material.map !== window.floorTexture) { 
                    const originalCoverMaterial = new THREE.MeshStandardMaterial({
                        map: window.floorTexture.clone(),
                        roughness: 0.95, metalness: 0.1,
                        color: window.floorTexture ? 0xffffff : 0x444038
                    });
                    if (originalCoverMaterial.map) {
                        originalCoverMaterial.map.needsUpdate = true;
                        originalCoverMaterial.map.repeat.set(1,1);
                    }
                    trap.mesh.material = originalCoverMaterial;
                }
            }
            if (trap.holeMesh) {
                trap.holeMesh.visible = false;
            }
        }
         trap.hasBeenRevealedByActivation = false; 
    }
    for (const trap of window.fallingBlockTrapObjects) {
         if (trap.state === 'falling' || trap.state === 'landed') {
            trap.state = 'armed';
            if (trap.blockMesh) { 
                 trap.blockMesh.visible = false;
                 trap.blockMesh.position.y = WALL_HEIGHT + WALL_HEIGHT * 0.45; 
                 const colIndex = window.collidableObjects.indexOf(trap.blockMesh);
                 if (colIndex > -1) window.collidableObjects.splice(colIndex, 1);
            }
             window.currentMazeLayout[trap.triggerCellZ][trap.triggerCellX] = FALLING_BLOCK_TRAP_CELL_TYPE;
        }
        trap.hasBeenRevealedByActivation = false; 
    }
    for (const trap of window.spikeTrapObjects) {
         if (trap.state === 'rising' || trap.state === 'risen') {
            trap.state = 'hidden';
            if (trap.spikeGroup) {
                trap.spikeGroup.visible = false;
                trap.spikeGroup.children.forEach(spike => {
                    spike.position.y = -SPIKE_HEIGHT / 2;
                });
            }
             window.currentMazeLayout[trap.triggerCellZ][trap.triggerCellX] = SPIKE_TRAP_CELL_TYPE;
        }
        trap.hasBeenRevealedByActivation = false; 
    }

    // Resetear Puertas
    for (const door of window.doorObjects) {
        if (door.userData.state !== 'closed') {
            if (door.userData.openTween) door.userData.openTween.stop();
            if (door.userData.closeTween) door.userData.closeTween.stop();
            if (door.userData.closeTimeout) clearTimeout(door.userData.closeTimeout);
            
            door.userData.half1.rotation.set(0,0,0);
            door.userData.half2.rotation.set(0,0,0);
            door.userData.half1.position.set(-CELL_SIZE * 0.25, 0, 0);
            door.userData.half2.position.set(CELL_SIZE * 0.25, 0, 0);
            door.userData.state = 'closed';
            if (!window.collidableObjects.includes(door)) {
                window.collidableObjects.push(door);
            }
        }
    }

    // Las plataformas móviles no necesitan un reseteo explícito de su posición ya que se actualizan constantemente.
    // Si el laberinto se reconstruye, serán nuevas instancias.
    
    TWEEN.removeAll(); // Asegurar que no haya tweens en cola

    window.gameActive = true; 
    if (!window.animationFrameId && TWEEN.getAll().length === 0) { 
         window.animate(); // Reiniciar el bucle de animación
    }
    showMessage("Inténtalo de nuevo...", 2000);
}

/**
 * Se activa cuando el jugador pierde la partida.
 * Muestra una pantalla de muerte y resetea el juego.
 * @param {string} reason - Razón de la derrota.
 */
function loseGame(reason = "Has perdido.") {
    if (!window.gameActive && window.playerFallingIntoPit === null) return; 
    window.gameActive = false;

    console.log("Juego perdido:", reason);
    if (window.isPointerLocked && document.pointerLockElement) document.exitPointerLock();

    showMessage(reason, DEATH_IMAGE_DISPLAY_DURATION); 

    const deathScreenOverlay = document.getElementById('death-screen-overlay');
    const deathImageElement = document.getElementById('death-image');
    const imageName = DEATH_REASON_TO_IMAGE[reason];

    // Añadir efecto de salpicadura de sangre
    if (window.bloodSplatterTexture && window.player && window.scene) { 
        const playerGridX = Math.floor((window.player.position.x / CELL_SIZE) + (window.currentMazeWidth / 2));
        const playerGridZ = Math.floor((window.player.position.z / CELL_SIZE) + (window.currentMazeHeight / 2));

        if (playerGridX >= 0 && playerGridX < window.currentMazeWidth && playerGridZ >= 0 && playerGridZ < window.currentMazeHeight) {
            const worldX = (playerGridX - window.currentMazeWidth / 2 + 0.5) * CELL_SIZE;
            const worldZ = (playerGridZ - window.currentMazeHeight / 2 + 0.5) * CELL_SIZE;
            
            let groundLevelForSplatter = 0.01; 
            if (window.currentMazeLayout[playerGridZ] && window.currentMazeLayout[playerGridZ][playerGridX] === LAVA_CELL_TYPE) {
                groundLevelForSplatter = LAVA_SURFACE_OFFSET_Y + 0.01;
            }

            const splatterGeometry = new THREE.PlaneGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9);
            const splatterMaterial = new THREE.MeshBasicMaterial({
                map: window.bloodSplatterTexture,
                transparent: true,
                opacity: 0.75, 
                depthWrite: false, 
                blending: THREE.NormalBlending 
            });
            const splatterMesh = new THREE.Mesh(splatterGeometry, splatterMaterial);
            splatterMesh.position.set(worldX, groundLevelForSplatter, worldZ); 
            splatterMesh.rotation.x = -Math.PI / 2;
            splatterMesh.rotation.z = Math.random() * Math.PI * 2; 
            window.scene.add(splatterMesh);
            window.bloodSplatters.push(splatterMesh); 
        }
    }

    // Mostrar imagen de muerte (si existe) y luego resetear el juego
    if (imageName && deathScreenOverlay && deathImageElement) {
        deathImageElement.src = DEATH_IMAGE_BASE_URL + imageName;
        deathScreenOverlay.style.display = 'flex';

        setTimeout(() => {
            deathScreenOverlay.style.display = 'none';
            performGameResetLogic();
        }, DEATH_IMAGE_DISPLAY_DURATION);
    } else {
        setTimeout(() => {
            performGameResetLogic();
        }, DEATH_IMAGE_DISPLAY_DURATION); 
    }
}

/**
 * Dibuja el minimapa del laberinto.
 */
function drawMinimap() {
    if (!minimapCtx || !window.player || !window.currentMazeLayout.length || !window.visibilityMaze.length || !window.currentMazeWidth || !window.currentMazeHeight) return;
    
    // Obtener la posición del jugador en la cuadrícula
    const playerGridX = Math.round(window.player.position.x / CELL_SIZE + window.currentMazeWidth / 2 - 0.5);
    const playerGridZ = Math.round(window.player.position.z / CELL_SIZE + window.currentMazeHeight / 2 - 0.5);
    
    minimapCtx.clearRect(0, 0, minimapWidth, minimapHeight);
    minimapCtx.save();
    
    // Centrar el minimapa y rotarlo según la orientación de la cámara
    minimapCtx.translate(minimapWidth / 2, minimapHeight / 2);
    minimapCtx.rotate(window.cameraTheta);

    const radius = MINIMAP_RADIUS_CELLS;
    const cellSizePx = MINIMAP_CELL_SIZE_PX;

    for (let relZ = -radius; relZ <= radius; relZ++) {
        for (let relX = -radius; relX <= radius; relX++) {
            const checkX = playerGridX + relX;
            const checkZ = playerGridZ + relZ;
            let fillColor;

            // Determinar color de la celda
            if (!window.visibilityMaze[checkZ] || typeof window.visibilityMaze[checkZ][checkX] === 'undefined' || !window.visibilityMaze[checkZ][checkX]) {
                fillColor = MINIMAP_UNSEEN_COLOR; // Celda no vista
            } else {
                if (checkX < 0 || checkX >= window.currentMazeWidth || checkZ < 0 || checkZ >= window.currentMazeHeight) {
                    fillColor = MINIMAP_UNSEEN_COLOR; // Fuera de los límites del laberinto (pero dentro del radio de visión)
                } else {
                    const cellTypeInLayout = window.currentMazeLayout[checkZ][checkX];
                    const originalCellType = window.maze[checkZ][checkX]; 

                    if (cellTypeInLayout === 0) fillColor = MINIMAP_WALL_COLOR;
                    else if (cellTypeInLayout === LAVA_CELL_TYPE) fillColor = MINIMAP_LAVA_COLOR; 
                    else if (cellTypeInLayout === BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT) fillColor = MINIMAP_PITTRAP_BROKEN_COLOR;
                    else if (cellTypeInLayout === END_CELL_TERMINATE) fillColor = MINIMAP_END_COLOR;
                    else if (cellTypeInLayout === END_CELL_SPECIFIC_NEXT) fillColor = MINIMAP_END_LINK_COLOR;
                    else if (originalCellType === PIT_TRAP_CELL_TYPE ||
                             originalCellType === FALLING_BLOCK_TRAP_CELL_TYPE ||
                             originalCellType === SPIKE_TRAP_CELL_TYPE ||
                             originalCellType === MINOTAUR_CELL_TYPE ||
                             originalCellType === MOVING_PLATFORM_CELL_TYPE) { 
                        // Muestra las trampas intactas si han sido reveladas por el jugador
                        const trapObject = window.pitTrapObjects.find(t => t.gridX === checkX && t.gridZ === checkZ);
                        if (trapObject && trapObject.hasBeenRevealedByActivation && cellTypeInLayout === PIT_TRAP_CELL_TYPE && trapObject.state !== 'broken') {
                             fillColor = MINIMAP_PITTRAP_INTACT_COLOR; 
                        } else if (originalCellType === MOVING_PLATFORM_CELL_TYPE) {
                             fillColor = MINIMAP_MOVING_PLATFORM_COLOR;
                        } else {
                             fillColor = MINIMAP_PATH_COLOR; // Resto de celdas especiales como camino si son reveladas
                        }
                    } else if (originalCellType === DOOR_H_CELL_TYPE || originalCellType === DOOR_V_CELL_TYPE) {
                        const door = window.doorObjects.find(d => d.userData.gridX === checkX && d.userData.gridZ === checkZ);
                        if (door && (door.userData.state === 'closed' || door.userData.state === 'closing')) {
                            fillColor = MINIMAP_DOOR_COLOR;
                        } else {
                            fillColor = MINIMAP_PATH_COLOR; 
                        }
                    }
                    else fillColor = MINIMAP_PATH_COLOR; // Por defecto, es un camino
                }
            }
            minimapCtx.fillStyle = fillColor;
            const drawX = relX * cellSizePx - cellSizePx / 2;
            const drawY = relZ * cellSizePx - cellSizePx / 2;
            minimapCtx.fillRect(drawX, drawY, cellSizePx, cellSizePx);
        }
    }
    minimapCtx.restore(); 

    // Dibujar el marcador del jugador (triángulo)
    minimapCtx.beginPath();
    const playerMarkerSize = cellSizePx * 0.9;
    const halfSize = playerMarkerSize / 2;
    minimapCtx.moveTo(minimapWidth / 2, minimapHeight / 2 - halfSize * 0.8);
    minimapCtx.lineTo(minimapWidth / 2 - halfSize * 0.6, minimapHeight / 2 + halfSize * 0.5);
    minimapCtx.lineTo(minimapWidth / 2 + halfSize * 0.6, minimapHeight / 2 + halfSize * 0.5);
    minimapCtx.closePath();
    minimapCtx.fillStyle = MINIMAP_PLAYER_COLOR;
    minimapCtx.fill();
}

/**
 * Comprueba si hay una línea de visión sin obstáculos entre dos celdas.
 * Se utiliza para la actualización de visibilidad del minimapa.
 * @param {number} x0 - Coordenada X de la celda de origen.
 * @param {number} z0 - Coordenada Z de la celda de origen.
 * @param {number} x1 - Coordenada X de la celda de destino.
 * @param {number} z1 - Coordenada Z de la celda de destino.
 * @returns {boolean} True si hay línea de visión, false en caso contrario.
 */
function hasLineOfSight(x0, z0, x1, z1) { 
    let dx = Math.abs(x1 - x0); 
    let sx = x0 < x1 ? 1 : -1; 
    let dz = -Math.abs(z1 - z0); 
    let sz = z0 < z1 ? 1 : -1; 
    let err = dx + dz; 
    let currentX = x0; 
    let currentZ = z0; 
    let steps = 0; 
    const maxSteps = window.currentMazeWidth + window.currentMazeHeight; // Límite para evitar bucles infinitos

    while (steps < maxSteps) { 
        steps++; 
        if (currentX === x1 && currentZ === z1) return true; // Llegó al destino
        
        if (!(currentX === x0 && currentZ === z0)) { // No comprobar el punto de inicio
            if (currentX >= 0 && currentX < window.currentMazeWidth && currentZ >= 0 && currentZ < window.currentMazeHeight) { 
                const cellType = window.currentMazeLayout[currentZ][currentX];
                // Si la celda es una pared o una puerta cerrada, bloquea la línea de visión
                if ((cellType === 0) || (cellType === DOOR_H_CELL_TYPE || cellType === DOOR_V_CELL_TYPE) ) {
                    const door = window.doorObjects.find(d => d.userData.gridX === currentX && d.userData.gridZ === currentZ);
                    if (!door || (door.userData.state === 'closed' || door.userData.state === 'closing')) { 
                        // Marcar la celda como vista aunque bloquee la vista (útil para el minimapa)
                        if (window.visibilityMaze[currentZ] && typeof window.visibilityMaze[currentZ][currentX] !== 'undefined') { window.visibilityMaze[currentZ][currentX] = true; } 
                        return false; 
                    }
                }
            } else { 
                return false; // Fuera de los límites del laberinto
            } 
        } 
        
        // Algoritmo de línea Bresenham para avanzar paso a paso
        let e2 = 2 * err; 
        let moved = false; 
        if (e2 >= dz) { 
            if (currentX === x1 && currentZ === z1 && !(currentX === x0 && currentZ === z0)) break; 
            err += dz; currentX += sx; moved = true; 
        } 
        if (e2 <= dx) { 
            if (currentX === x1 && currentZ === z1 && !(currentX === x0 && currentZ === z0)) break; 
            err += dx; currentZ += sz; moved = true; 
        } 
        if (!moved && (currentX !== x1 || currentZ !== z1)) { 
            return false; // Se estancó o no pudo moverse hacia el objetivo
        } 
    } 
    return (currentX === x1 && currentZ === z1); // Llegó al destino
}

/**
 * Actualiza las celdas visibles en el minimapa basándose en la posición del jugador y la línea de visión.
 */
function updateVisibility() {
    if (!window.player || !window.visibilityMaze.length || !window.currentMazeLayout.length || !window.currentMazeWidth || !window.currentMazeHeight) return;
    
    const playerGridX = Math.round(window.player.position.x / CELL_SIZE + window.currentMazeWidth / 2 - 0.5);
    const playerGridZ = Math.round(window.player.position.z / CELL_SIZE + window.currentMazeHeight / 2 - 0.5);
    const visionRadius = PLAYER_VISION_RADIUS_CELLS;

    // Marcar la celda actual del jugador como vista
    if (playerGridX >= 0 && playerGridX < window.currentMazeWidth && playerGridZ >= 0 && playerGridZ < window.currentMazeHeight) {
        if(window.visibilityMaze[playerGridZ]) window.visibilityMaze[playerGridZ][playerGridX] = true;
    }

    // Comprobar la visibilidad de las celdas en el radio de visión
    for (let relZ = -visionRadius; relZ <= visionRadius; relZ++) {
        for (let relX = -visionRadius; relX <= visionRadius; relX++) {
            if (relX === 0 && relZ === 0) continue; // Saltar la celda del jugador
            
            // Comprobar si la celda está dentro del círculo de visión
            if (relX * relX + relZ * relZ <= visionRadius * visionRadius) {
                const checkX = playerGridX + relX;
                const checkZ = playerGridZ + relZ;
                
                if (checkX >= 0 && checkX < window.currentMazeWidth && checkZ >= 0 && checkZ < window.currentMazeHeight) {
                    // Si hay línea de visión directa, marcar la celda como vista
                    if (hasLineOfSight(playerGridX, playerGridZ, checkX, checkZ)) {
                        if(window.visibilityMaze[checkZ]) window.visibilityMaze[checkZ][checkX] = true;
                    }
                }
            }
        }
    }
}

/**
 * Comprueba si el objetivo del puntero está dentro de una pantalla de UI.
 * @param {EventTarget} target - El elemento sobre el que se activó el evento.
 * @returns {boolean} True si está dentro de una pantalla de UI, false en caso contrario.
 */
function isInsideUIScreen(target) { 
    return target.closest('#loading-screen') || 
           target.closest('#custom-game-screen') || 
           target.closest('#scenario-editor-screen') || 
           target.closest('#next-scenario-selection-screen') || 
           target.closest('#predefined-maps-screen') ||
           target.closest('#game-menu-overlay'); // Incluir el nuevo menú de juego
}

// --- Controles de entrada (Joystick y Teclado/Ratón) ---
let touchControlsSetupDone = false;
let keyboardControlsSetupDone = false;

/**
 * Actualiza la posición visual del "thumb" del joystick.
 */
function updateJoystickThumb() { 
    const dX=joystickCurrentPos.x-joystickStartPos.x, dY=joystickCurrentPos.y-joystickStartPos.y, dist=Math.sqrt(dX*dX+dY*dY); 
    const angle=Math.atan2(dY,dX); 
    const tD=Math.min(dist, JOYSTICK_VISUAL_RADIUS/2-joystickThumb.offsetWidth/4); 
    const tX=Math.cos(angle)*tD, tY=Math.sin(angle)*tD; 
    joystickThumb.style.transform=`translate(${tX}px, ${tY}px)`; 
}

/**
 * Actualiza las variables de movimiento (moveForward, moveRight) basándose en la posición del joystick.
 */
function updateMovementFromJoystick() {
    const dx = joystickCurrentPos.x - joystickStartPos.x;
    const dy = joystickCurrentPos.y - joystickStartPos.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist === 0) {
        window.moveForward = 0; window.moveRight = 0; return;
    }
    let normalizedX = dx / JOYSTICK_EFFECTIVE_RADIUS;
    let normalizedY = dy / JOYSTICK_EFFECTIVE_RADIUS;
    const magnitude = Math.min(1.0, dist / JOYSTICK_EFFECTIVE_RADIUS);
    if (magnitude < JOYSTICK_DEADZONE) {
        window.moveForward = 0; window.moveRight = 0; return;
    }
    window.moveForward = -normalizedY * magnitude;
    window.moveRight   =  normalizedX * magnitude;
    window.moveForward = Math.max(-1, Math.min(1, window.moveForward));
    window.moveRight   = Math.max(-1, Math.min(1, window.moveRight));
}

/**
 * Configura los eventos de entrada táctil.
 */
function setupTouchControls() {
    if (touchControlsSetupDone) return;
    document.body.addEventListener('pointerdown', handlePointerDown); 
    document.body.addEventListener('pointermove', handlePointerMove); 
    document.body.addEventListener('pointerup', handlePointerEnd); 
    document.body.addEventListener('pointercancel', handlePointerEnd);
    
    jumpButton.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        if (window.playerOnGround && window.gameActive && window.playerFallingIntoPit === null) window.playerVelocity.y = JUMP_VELOCITY; 
    }, { passive: false });

    actionButton.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        if (window.gameActive) window.toggleView(); // Llamada a función en game_engine.js
    }, { passive: false });

    gameMenuActionButton.addEventListener('touchstart', (e) => { // NUEVO: Botón de menú en juego
        e.preventDefault(); 
        toggleGameMenu(true); 
    }, { passive: false });

    touchControlsSetupDone = true;
}

/**
 * Maneja el evento pointerdown para controles táctiles.
 * @param {PointerEvent} event - El evento de puntero.
 */
function handlePointerDown(event) { 
    if (isInsideUIScreen(event.target)) { return; } 
    if (event.target === jumpButton || event.target === actionButton || event.target === gameMenuActionButton || event.target.closest('#minimapCanvas')) return; 
    event.preventDefault(); 
    const tX=event.clientX, tY=event.clientY, sW=window.innerWidth; 
    
    if (tX < sW/2 && joystickPointerId===-1){ // Lado izquierdo para joystick
        joystickPointerId=event.pointerId; 
        joystickStartPos={x:tX,y:tY}; 
        joystickCurrentPos={x:tX,y:tY}; 
        joystickArea.style.display='flex'; 
        joystickArea.style.left=`${tX}px`; 
        joystickArea.style.top=`${tY}px`; 
        joystickThumb.style.transform='translate(0px, 0px)'; 
        updateMovementFromJoystick(); 
    } else if (tX >= sW/2 && cameraPointerId===-1){ // Lado derecho para control de cámara
        cameraPointerId=event.pointerId; 
        cameraTouchStartPos={x:tX, y:tY}; 
    } 
}

/**
 * Maneja el evento pointermove para controles táctiles.
 * @param {PointerEvent} event - El evento de puntero.
 */
function handlePointerMove(event) { 
    if (isInsideUIScreen(event.target)) { return; } 
    if (event.target === jumpButton || event.target === actionButton || event.target === gameMenuActionButton || event.target.closest('#minimapCanvas')) return; 
    event.preventDefault(); 
    
    if(event.pointerId===joystickPointerId){
        joystickCurrentPos={x:event.clientX, y:event.clientY}; 
        updateJoystickThumb(); 
        updateMovementFromJoystick(); 
    } else if(event.pointerId===cameraPointerId){ 
        const tX=event.clientX, tY=event.clientY; 
        window.updateCameraLook(tX-cameraTouchStartPos.x, tY-cameraTouchStartPos.y); 
        cameraTouchStartPos={x:tX,y:tY}; 
    } 
}

/**
 * Maneja el evento pointerup (o pointercancel) para controles táctiles.
 * @param {PointerEvent} event - El evento de puntero.
 */
function handlePointerEnd(event) { 
    if (isInsideUIScreen(event.target)) { return; } 
    if (event.target === jumpButton || event.target === actionButton || event.target === gameMenuActionButton || event.target.closest('#minimapCanvas')) return; 
    
    if(event.pointerId===joystickPointerId){ 
        joystickPointerId=-1; 
        joystickArea.style.display='none'; 
        window.moveForward=0; 
        window.moveRight=0; 
    } else if(event.pointerId===cameraPointerId){ 
        cameraPointerId=-1; 
    } 
}

/**
 * Configura los eventos de entrada de teclado y ratón.
 */
function setupKeyboardAndMouseControls() {
    if (keyboardControlsSetupDone) return;
    document.addEventListener('keydown', (event) => { 
        window.keyStates[event.code] = true; 
        if (event.code === 'Escape' && window.gameActive) { // NUEVO: Pausar juego con ESC
            toggleGameMenu(true);
        }
        handleKeyPress(event.code); 
    }); 
    document.addEventListener('keyup', (event) => { window.keyStates[event.code] = false; });
    
    // Bloqueo del puntero al hacer clic en el canvas
    window.renderer.domElement.addEventListener('mousedown', (event) => { 
        if (event.button === 0 && !window.isPointerLocked && window.gameActive && gameMenuOverlay.style.display === 'none') { 
            window.renderer.domElement.requestPointerLock(); 
        } 
    });
    
    // Click derecho para cambiar vista
    window.renderer.domElement.addEventListener('contextmenu', (event) => { 
        event.preventDefault(); 
        if (window.gameActive) { 
            window.toggleView(); // Llamada a función en game_engine.js
        } 
    });
    
    // Eventos de bloqueo del puntero
    document.addEventListener('pointerlockchange', () => { 
        window.isPointerLocked = document.pointerLockElement === window.renderer.domElement; 
        if (window.isPointerLocked) { 
            if (pointerLockInfoDiv) pointerLockInfoDiv.style.display = 'none'; 
            window.renderer.domElement.style.cursor = 'none'; 
        } else { 
            if (pointerLockInfoDiv && !window.isTouchDevice && gameMenuOverlay.style.display === 'none') pointerLockInfoDiv.style.display = 'block'; 
            window.renderer.domElement.style.cursor = 'grab'; 
            window.keyStates = {}; 
            window.moveForward=0; window.moveRight=0; 
        } 
    }, false);
    
    document.addEventListener('pointerlockerror', () => { 
        console.error('Error blocking mouse pointer.'); 
        if (pointerLockInfoDiv && !window.isTouchDevice) pointerLockInfoDiv.style.display = 'block'; 
    }, false);
    
    // Movimiento del ratón para control de cámara
    document.addEventListener('mousemove', (event) => { 
        if (window.isPointerLocked && window.gameActive) { 
            window.updateCameraLook(event.movementX, event.movementY); 
        } 
    });
    keyboardControlsSetupDone = true;
}

/**
 * Maneja las pulsaciones de teclas específicas.
 * @param {string} code - El 'code' de la tecla pulsada (ej. 'KeyV', 'Escape').
 */
function handleKeyPress(code) { 
    if (!window.gameActive) return; 
    if (code === 'KeyV') { window.toggleView(); } // Llamada a función en game_engine.js
}

/**
 * Actualiza la rotación de la cámara basándose en el movimiento del ratón/dedo.
 * @param {number} deltaX - Desplazamiento horizontal del puntero.
 * @param {number} deltaY - Desplazamiento vertical del puntero.
 */
function updateCameraLook(deltaX, deltaY) {
    let currentSensitivity = CAMERA_SENSITIVITY;
    if (window.isTouchDevice) {
        currentSensitivity *= CAMERA_SENSITIVITY_MOBILE_MULTIPLIER;
    }
    window.cameraTheta -= deltaX * currentSensitivity;
    window.cameraPhi -= deltaY * currentSensitivity;
    window.cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, window.cameraPhi));
}

/**
 * Muestra u oculta el menú en juego y pausa/reanuda el juego.
 * @param {boolean} show - Si true, muestra el menú; si false, lo oculta.
 */
function toggleGameMenu(show) {
    if (show) {
        gameMenuOverlay.style.display = 'flex';
        window.gameActive = false; // Pausar lógica del juego
        if (window.isPointerLocked && document.pointerLockElement) {
            document.exitPointerLock(); // Liberar bloqueo del puntero cuando el menú está abierto
        }
        // Actualizar valor del slider de sensibilidad
        cameraSensitivitySlider.value = CAMERA_SENSITIVITY;
    } else {
        gameMenuOverlay.style.display = 'none';
        window.gameActive = true; // Reanudar lógica del juego
        if (!window.isTouchDevice && !window.isPointerLocked) { // Volver a solicitar bloqueo del puntero si no es táctil y no está bloqueado
            window.renderer.domElement.requestPointerLock();
        }
    }
}

// --- Lógica de Interfaz de Usuario y Editor de Escenarios ---

/**
 * Rellena los selectores de textura en el editor con las texturas disponibles.
 */
function populateTextureSelectors() {
    const selectorsData = [
        { id: 'wall-texture-select', previewId: 'wall-texture-preview' },
        { id: 'floor-texture-select', previewId: 'floor-texture-preview' },
        { id: 'ceiling-texture-select', previewId: 'ceiling-texture-preview' }
    ];

    selectorsData.forEach(data => {
        const selectElement = document.getElementById(data.id);
        const previewElement = document.getElementById(data.previewId);
        if (!selectElement || !previewElement) return;

        selectElement.innerHTML = '<option value="-1" data-url="">Aleatorio</option>';
        textureURLs.forEach((url, index) => {
            if (url.includes("textura_lava1.jpg") || url.includes("textura_puerta1.jpg")) return; // Excluir lava y puerta
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Textura ${index + 1}`;
            option.dataset.url = url;
            selectElement.appendChild(option);
        });

        selectElement.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const textureUrl = selectedOption.dataset.url;
            if (textureUrl) {
                previewElement.src = textureUrl;
                previewElement.style.display = 'inline-block';
            } else {
                previewElement.src = '';
                previewElement.style.display = 'none';
            }
        });
        // Configurar la vista previa inicial
        if (selectElement.value !== "-1" && selectElement.options[selectElement.selectedIndex]) {
             const initialUrl = selectElement.options[selectElement.selectedIndex].dataset.url;
             if (initialUrl) {
                 previewElement.src = initialUrl;
                 previewElement.style.display = 'inline-block';
             } else {
                 previewElement.src = '';
                 previewElement.style.display = 'none';
             }
        } else {
             previewElement.src = '';
             previewElement.style.display = 'none';
        }

    });
}

/**
 * Selecciona texturas para el juego basándose en la configuración del escenario.
 * @param {object} scenarioTextures - Objeto con los índices de textura para pared, suelo y techo.
 */
function selectTexturesForScenario(scenarioTextures) {
    if (window.loadedTextures.length === 0) { console.warn("No hay texturas cargadas."); selectRandomTextures(); return; }
    const validTextures = window.loadedTextures.filter(t => t && !t.image.src.includes("textura_lava1.jpg") && !t.image.src.includes("textura_puerta1.jpg"));
    if (validTextures.length === 0) { console.warn("No hay texturas válidas cargadas (o solo lava/puerta)."); selectRandomTextures(); return; }

    const getTex = (index) => (index !== -1 && window.loadedTextures[index] && !window.loadedTextures[index].image.src.includes("textura_lava1.jpg") && !window.loadedTextures[index].image.src.includes("textura_puerta1.jpg")) ? window.loadedTextures[index].clone() : validTextures[Math.floor(Math.random() * validTextures.length)].clone();

    window.wallTexture = getTex(scenarioTextures?.wall);
    window.floorTexture = getTex(scenarioTextures?.floor);
    window.ceilingTexture = getTex(scenarioTextures?.ceiling);

    // Asegurar que las texturas aleatorias no sean iguales si hay más de una opción
    if (scenarioTextures?.wall === -1 && scenarioTextures?.floor === -1 && window.wallTexture.image.src === window.floorTexture.image.src && validTextures.length > 1) {
        let newFloorIndex;
        do { newFloorIndex = Math.floor(Math.random() * validTextures.length); } while (validTextures[newFloorIndex].image.src === window.wallTexture.image.src);
        window.floorTexture = validTextures[newFloorIndex].clone();
    }
     if (scenarioTextures?.ceiling === -1) {
        if (validTextures.length > 2) {
            let newCeilingIndex;
            do { newCeilingIndex = Math.floor(Math.random() * validTextures.length); } while (validTextures[newCeilingIndex].image.src === window.wallTexture.image.src || validTextures[newCeilingIndex].image.src === window.floorTexture.image.src);
            window.ceilingTexture = validTextures[newCeilingIndex].clone();
        } else if (validTextures.length === 2) {
             window.ceilingTexture = validTextures.find(t => t.image.src !== window.wallTexture.image.src && t.image.src !== window.floorTexture.image.src) || window.wallTexture.clone();
        } else {
            window.ceilingTexture = window.wallTexture.clone();
        }
    }

    if (window.floorTexture) window.floorTexture.needsUpdate = true;
    if (window.wallTexture) window.wallTexture.needsUpdate = true;
    if (window.ceilingTexture) window.ceilingTexture.needsUpdate = true;
    window.crackedTexture = window.floorTexture.clone();
    if (window.crackedTexture) window.crackedTexture.needsUpdate = true;
    
    // Asegurarse de que las texturas de lava y puerta estén configuradas
    if (!window.lavaTexture) { 
        const lavaTexEntry = window.loadedTextures.find(t => t && t.image.src.includes("textura_lava1.jpg"));
        if (lavaTexEntry) window.lavaTexture = lavaTexEntry.clone();
    }
    if (!window.doorTexture) {
        const doorTexEntry = window.loadedTextures.find(t => t && t.image.src.includes("textura_puerta1.jpg"));
        if (doorTexEntry) window.doorTexture = doorTexEntry.clone();
    }

    console.log("Texturas de escenario aplicadas.");
}

/**
 * Selecciona texturas aleatorias para el juego.
 */
function selectRandomTextures() {
    if (window.loadedTextures.length === 0) { console.warn("No hay texturas cargadas para seleccionar. Se usarán colores sólidos."); window.floorTexture = null; window.wallTexture = null; window.ceilingTexture = null; window.crackedTexture = null; window.doorTexture = null; return; }
    const validTextures = window.loadedTextures.filter(t => t && !t.image.src.includes("textura_lava1.jpg") && !t.image.src.includes("textura_puerta1.jpg")); 
    if (validTextures.length === 0) { console.warn("Todas las texturas cargadas son inválidas (o solo hay lava/puerta)."); window.floorTexture = null; window.wallTexture = null; window.ceilingTexture = null; window.crackedTexture = null; window.doorTexture = null; return; }

    let floorIdx = Math.floor(Math.random() * validTextures.length);
    window.floorTexture = validTextures[floorIdx].clone();

    let wallIdx;
    if (validTextures.length > 1) {
        do { wallIdx = Math.floor(Math.random() * validTextures.length); } while (wallIdx === floorIdx);
        window.wallTexture = validTextures[wallIdx].clone();
    } else {
        window.wallTexture = validTextures[0].clone();
    }

    let ceilingIdx;
     if (validTextures.length > 2) {
        do { ceilingIdx = Math.floor(Math.random() * validTextures.length); } while (ceilingIdx === floorIdx || ceilingIdx === wallIdx);
        window.ceilingTexture = validTextures[ceilingIdx].clone();
    } else if (validTextures.length > 1) {
         do { ceilingIdx = Math.floor(Math.random() * validTextures.length); } while (ceilingIdx === floorIdx && ceilingIdx === wallIdx); 
         if (ceilingIdx === floorIdx && ceilingIdx === wallIdx && validTextures.length > 1) { 
            window.ceilingTexture = validTextures.find(t => t !== validTextures[floorIdx]) || validTextures[0].clone(); 
         } else {
            window.ceilingTexture = validTextures[ceilingIdx].clone();
         }
    }
     else {
         window.ceilingTexture = validTextures[0].clone();
    }

    if (window.floorTexture) window.floorTexture.needsUpdate = true;
    if (window.wallTexture) window.wallTexture.needsUpdate = true;
    if (window.ceilingTexture) window.ceilingTexture.needsUpdate = true;

    window.crackedTexture = window.floorTexture.clone();
    if (window.crackedTexture) window.crackedTexture.needsUpdate = true;
    
    if (!window.lavaTexture) {
        const lavaTexEntry = window.loadedTextures.find(t => t && t.image.src.includes("textura_lava1.jpg"));
        if (lavaTexEntry) window.lavaTexture = lavaTexEntry.clone();
        else console.warn("Textura de lava no encontrada en loadedTextures.");
    }
    if (!window.doorTexture) {
        const doorTexEntry = window.loadedTextures.find(t => t && t.image.src.includes("textura_puerta1.jpg"));
        if (doorTexEntry) window.doorTexture = doorTexEntry.clone();
        else console.warn("Textura de puerta no encontrada en loadedTextures.");
    }

    console.log("Texturas aleatorias seleccionadas.");
}

/**
 * Muestra la UI de selección de escenarios para la próxima partida.
 */
async function displayNextScenarioSelection() {
    try {
        const scenarios = await getAllScenariosDB();
        nextScenarioListUL.innerHTML = '';
        if (scenarios && scenarios.length > 0) {
            noNextScenariosMsg.style.display = 'none';
            scenarios.forEach(scenario => {
                const listItem = document.createElement('li');
                listItem.classList.add('scenario-item');
                listItem.innerHTML = `
                    <div class="scenario-info">
                        <span>${escapeHTML(scenario.name)} (${scenario.width}x${scenario.height})</span>
                    </div>
                    <div class="scenario-actions">
                        <button class="action-btn play-this-scenario-btn" data-id="${scenario.id}">Jugar este</button>
                    </div>
                `;
                listItem.querySelector('.play-this-scenario-btn').addEventListener('click', async () => {
                    const scenarioId = parseInt(scenario.id);
                    const scenarioToPlay = await getScenarioByIdDB(scenarioId);
                    if (scenarioToPlay) {
                        nextScenarioSelectionScreen.style.display = 'none';
                        if(loadingTextElement) loadingTextElement.style.display = 'block';
                        if(loadingScreenElement) loadingScreenElement.style.display = 'flex';

                        window.cleanUpScene();
                        window.preloadAssets(() => { 
                            selectTexturesForScenario(scenarioToPlay.textures);
                            window.currentPlayingScenarioData = JSON.parse(JSON.stringify(scenarioToPlay));
                            window.init(scenarioToPlay);
                            finalizeLoadingScreen();
                        });
                    } else {
                        alert("Error: No se pudo cargar el escenario seleccionado.");
                    }
                });
                nextScenarioListUL.appendChild(listItem);
            });
            nextScenarioSelectionScreen.style.display = 'flex';
        } else {
            noNextScenariosMsg.style.display = 'block';
            nextScenarioSelectionScreen.style.display = 'flex';
        }
    } catch (error) { 
        console.error("Error cargando escenarios para la selección:", error); 
        noNextScenariosMsg.textContent = "Error cargando escenarios."; 
        noNextScenariosMsg.style.display = 'block'; 
        nextScenarioSelectionScreen.style.display = 'flex'; 
    }
}

/**
 * Muestra la interfaz de usuario de "Juego Personalizado".
 */
function showCustomGameUI() { 
    window.gameActive = false; 
    if (window.animationFrameId) { cancelAnimationFrame(window.animationFrameId); window.animationFrameId = null;} 
    if (window.isPointerLocked && document.pointerLockElement) document.exitPointerLock(); 
    
    if(startOptionsDiv) startOptionsDiv.style.display = 'none'; 
    if(loadingTextElement) loadingTextElement.style.display = 'none'; 
    if(loadingScreenElement) loadingScreenElement.style.display = 'none'; 
    
    customGameScreen.style.display = 'flex'; 
    scenarioEditorScreen.style.display = 'none'; 
    nextScenarioSelectionScreen.style.display = 'none'; 
    predefinedMapsScreen.style.display = 'none'; 
    
    loadAndDisplayCustomScenarios(); 
}

/**
 * Carga y muestra los escenarios personalizados guardados.
 */
async function loadAndDisplayCustomScenarios() {
    try {
        const scenarios = await getAllScenariosDB();
        customScenarioListUL.innerHTML = '';
        if (scenarios && scenarios.length > 0) {
            noCustomScenariosMsg.style.display = 'none';
            scenarios.forEach(scenario => {
                const listItem = document.createElement('li');
                listItem.classList.add('scenario-item');
                listItem.dataset.id = scenario.id;
                listItem.innerHTML = `
                    <div class="scenario-preview" id="preview-${scenario.id}"></div>
                    <div class="scenario-info">
                        <span>${escapeHTML(scenario.name)} (${scenario.width}x${scenario.height})</span>
                    </div>
                    <div class="scenario-actions">
                        <button class="action-btn play-scenario-btn">Jugar</button>
                        <button class="action-btn edit-scenario-btn">Editar</button>
                        <button class="action-btn export-scenario-btn">Exportar</button>
                        <button class="action-btn delete-scenario-btn">Eliminar</button>
                    </div>
                `;
                customScenarioListUL.appendChild(listItem);
                generateScenarioPreview(scenario, `preview-${scenario.id}`);
            });
            addScenarioActionListeners();
        } else {
            noCustomScenariosMsg.style.display = 'block';
        }
    } catch (error) { 
        console.error("Error loading scenarios:", error); 
        noCustomScenariosMsg.textContent = "Error loading scenarios."; 
        noCustomScenariosMsg.style.display = 'block'; 
    }
}

/**
 * Genera una vista previa en miniatura de un escenario en el editor.
 * @param {object} scenario - Datos del escenario.
 * @param {string} containerId - ID del contenedor HTML para la vista previa.
 */
function generateScenarioPreview(scenario, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !scenario.grid) return;

    container.innerHTML = '';
    const rows = scenario.height;
    const cols = scenario.width;
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('scenario-preview-cell');
            let cellColor = MINIMAP_PATH_COLOR;
            const cellType = scenario.grid[r][c];
            switch (cellType) {
                case 0: cellColor = MINIMAP_WALL_COLOR; break;
                case 1: cellColor = MINIMAP_PATH_COLOR; break;
                case 5: cellColor = MINIMAP_PLAYER_COLOR; break;
                case END_CELL_TERMINATE: cellColor = MINIMAP_END_COLOR; break;
                case END_CELL_SPECIFIC_NEXT: cellColor = MINIMAP_END_LINK_COLOR; break;
                case PIT_TRAP_CELL_TYPE: cellColor = MINIMAP_PITTRAP_INTACT_COLOR; break;
                case BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT: cellColor = MINIMAP_PITTRAP_BROKEN_COLOR; break;
                case FALLING_BLOCK_TRAP_CELL_TYPE: cellColor = MINIMAP_FALLING_BLOCK_COLOR; break;
                case SPIKE_TRAP_CELL_TYPE: cellColor = MINIMAP_SPIKES_COLOR; break;
                case MINOTAUR_CELL_TYPE: cellColor = MINIMAP_MINOTAUR_COLOR; break;
                case LAVA_CELL_TYPE: cellColor = MINIMAP_LAVA_COLOR; break; 
                case DOOR_H_CELL_TYPE:
                case DOOR_V_CELL_TYPE: cellColor = MINIMAP_DOOR_COLOR; break; 
                case MOVING_PLATFORM_CELL_TYPE: cellColor = MINIMAP_MOVING_PLATFORM_COLOR; break; 
            }
            cellDiv.style.backgroundColor = cellColor;
            container.appendChild(cellDiv);
        }
    }
}

/**
 * Añade los listeners de eventos a los botones de acción de cada escenario.
 */
function addScenarioActionListeners() {
    customScenarioListUL.querySelectorAll('.scenario-item').forEach(item => {
        const scenarioId = parseInt(item.dataset.id);
        item.querySelector('.play-scenario-btn').addEventListener('click', async () => {
            const scenarioToPlay = await getScenarioByIdDB(scenarioId);
            if (scenarioToPlay) {
                customGameScreen.style.display = 'none';
                if(loadingTextElement) loadingTextElement.style.display = 'block';
                if(loadingScreenElement) loadingScreenElement.style.display = 'flex';
                window.preloadAssets(() => { 
                    selectTexturesForScenario(scenarioToPlay.textures);
                    window.currentPlayingScenarioData = JSON.parse(JSON.stringify(scenarioToPlay));
                    window.init(scenarioToPlay);
                    finalizeLoadingScreen();
                });
            } else { alert("Error: Could not load scenario to play."); }
        });
        item.querySelector('.edit-scenario-btn').addEventListener('click', () => { openScenarioEditor(scenarioId); });
        item.querySelector('.export-scenario-btn').addEventListener('click', async () => {
            const scenario = await getScenarioByIdDB(scenarioId);
            if (scenario) { const { id, ...exportData } = scenario; exportScenarioAsJSON(exportData); }
        });
        item.querySelector('.delete-scenario-btn').addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this scenario?")) {
                try { await deleteScenarioDB(scenarioId); loadAndDisplayCustomScenarios(); }
                catch (error) { console.error("Error deleting scenario:", error); alert("Error deleting scenario."); }
            }
        });
    });
}

/**
 * Exporta un escenario como un archivo JSON descargable.
 * @param {object} scenarioData - Los datos del escenario a exportar.
 */
function exportScenarioAsJSON(scenarioData) { 
    const jsonString = JSON.stringify(scenarioData, null, 2); 
    const blob = new Blob([jsonString], { type: "application/json" }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement("a"); 
    a.href = url; 
    a.download = `${scenarioData.name.replace(/[^a-z0-9\s-]/gi, '_').trim().replace(/\s+/g, '-').toLowerCase() || 'custom_scenario'}.json`; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url); 
}

/**
 * Abre el editor de escenarios, cargando un escenario existente o creando uno nuevo.
 * @param {number|null} scenarioId - El ID del escenario a editar, o null para uno nuevo.
 */
async function openScenarioEditor(scenarioId) {
    customGameScreen.style.display = 'none';
    scenarioEditorScreen.style.display = 'flex';
    predefinedMapsScreen.style.display = 'none';
    hasUnsavedChanges = false;
    editorMessageSpan.textContent = '';
    playEditedScenarioBtn.disabled = true;

     if (document.getElementById('wall-texture-select').options.length <= 1) { 
         populateTextureSelectors();
     }

    if (scenarioId !== null) {
        const scenario = await getScenarioByIdDB(scenarioId);
        if (!scenario) { alert("Error: Could not load scenario."); backToCustomScreenBtn.click(); return; }
        currentEditingScenario = JSON.parse(JSON.parse(JSON.stringify(scenario))); 
        scenarioNameInput.value = currentEditingScenario.name;
        dimensionSelectorDiv.style.display = 'none';
        scenarioNameInput.style.display = 'block';
        brushToolsDiv.style.display = 'flex';
        if (textureSelectorsDiv) textureSelectorsDiv.style.display = 'block';
        editorActionsDiv.style.display = 'flex';

        updateTexturePreview('wall-texture-select', 'wall-texture-preview', currentEditingScenario.textures?.wall ?? -1);
        updateTexturePreview('floor-texture-select', 'floor-texture-preview', currentEditingScenario.textures?.floor ?? -1);
        updateTexturePreview('ceiling-texture-select', 'ceiling-texture-preview', currentEditingScenario.textures?.ceiling ?? -1);

        let endTypeToSelect = 'terminate'; 
        let hasSpecificEndCellInGrid = false;
        for (let r = 0; r < currentEditingScenario.grid.length; r++) {
            for (let c = 0; c < currentEditingScenario.grid[r].length; c++) {
                if (currentEditingScenario.grid[r][c] === END_CELL_SPECIFIC_NEXT) {
                    hasSpecificEndCellInGrid = true;
                    break;
                }
            }
            if (hasSpecificEndCellInGrid) break;
        }
        
        if (hasSpecificEndCellInGrid && currentEditingScenario.specificNextScenarioName) {
             endTypeToSelect = 'specific_next_scenario';
        }

        document.querySelector(`input[name="end-behavior"][value="${endTypeToSelect}"]`).checked = true;

        if (endTypeToSelect === 'specific_next_scenario') {
            await populateSpecificNextScenarioSelector(); 
            const scenarios = await getAllScenariosDB(); 
            const targetScenario = scenarios.find(s => s.name === currentEditingScenario.specificNextScenarioName);
            specificNextScenarioSelect.value = targetScenario ? targetScenario.id : "";
            specificNextScenarioSelect.style.display = 'inline-block';
        } else {
            specificNextScenarioSelect.style.display = 'none';
        }


        setupEditorGrid(currentEditingScenario.width, currentEditingScenario.height, currentEditingScenario.grid);
        checkEditorStateForPlayability();
    } else { 
        // Nuevo escenario
        currentEditingScenario = { id: null, name: "", width: 0, height: 0, grid: [], textures: {wall: -1, floor: -1, ceiling:-1 }, specificNextScenarioName: null, specificExitCoords: null };
        scenarioNameInput.value = '';
        dimensionSelectorDiv.style.display = 'flex';
        scenarioNameInput.style.display = 'none';
        brushToolsDiv.style.display = 'none';
        if (textureSelectorsDiv) textureSelectorsDiv.style.display = 'none';
        if (endCellOptionsDiv) endCellOptionsDiv.style.display = 'none';
        editorActionsDiv.style.display = 'none';
        editorGridContainer.innerHTML = '';

        updateTexturePreview('wall-texture-select', 'wall-texture-preview', -1);
        updateTexturePreview('floor-texture-select', 'floor-texture-preview', -1);
        updateTexturePreview('ceiling-texture-select', 'ceiling-texture-preview', -1);
        if (document.querySelector('input[name="end-behavior"]')) {
            document.querySelector('input[name="end-behavior"][value="terminate"]').checked = true;
        }
        if (specificNextScenarioSelect) {
            specificNextScenarioSelect.style.display = 'none';
            specificNextScenarioSelect.value = "";
        }
    }

    if (selectedBrush === 'end' && brushToolsDiv.style.display !== 'none' && endCellOptionsDiv) {
        endCellOptionsDiv.style.display = 'block';
        const currentEndBehavior = document.querySelector('input[name="end-behavior"]:checked').value;
        if(specificNextScenarioSelect) specificNextScenarioSelect.style.display = (currentEndBehavior === 'specific_next_scenario') ? 'inline-block' : 'none';
        if (currentEndBehavior === 'specific_next_scenario' && specificNextScenarioSelect && specificNextScenarioSelect.options.length <=1 ) { 
             populateSpecificNextScenarioSelector();
         }
    } else if (endCellOptionsDiv) {
        endCellOptionsDiv.style.display = 'none';
    }
    // Asegurar que el botón de pincel actual esté activo visualmente
    document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
    const activeButton = document.querySelector(`.brush-btn[data-type="${selectedBrush}"]`);
    if (activeButton) activeButton.classList.add('active');
}

/**
 * Rellena el selector para elegir el próximo escenario específico.
 */
async function populateSpecificNextScenarioSelector() {
    if (!specificNextScenarioSelect) return;

    const previouslySelectedId = specificNextScenarioSelect.value; // Guardar selección actual
    specificNextScenarioSelect.innerHTML = '<option value="">-- Seleccionar Escenario --</option>'; // Resetear opciones

    try {
        const scenarios = await getAllScenariosDB();
        scenarios.forEach(s => {
            // No permitir que un escenario se enlace a sí mismo
            if (currentEditingScenario && currentEditingScenario.id === s.id) {
                return;
            }
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            specificNextScenarioSelect.appendChild(option);
        });
        // Restaurar selección previa o establecer según el escenario cargado
        if (previouslySelectedId && specificNextScenarioSelect.querySelector(`option[value="${previouslySelectedId}"]`)) {
            specificNextScenarioSelect.value = previouslySelectedId;
        } else if (currentEditingScenario && currentEditingScenario.specificNextScenarioName) {
            const targetScenario = scenarios.find(s => s.name === currentEditingScenario.specificNextScenarioName);
            if (targetScenario) {
                specificNextScenarioSelect.value = targetScenario.id;
            }
        }
    } catch (error) {
        console.error("Error al poblar selector de escenarios específicos:", error);
    }
}

/**
 * Actualiza la imagen de vista previa de una textura en el editor.
 * @param {string} selectId - ID del elemento <select> de textura.
 * @param {string} previewId - ID del elemento <img> de vista previa.
 * @param {number} textureIndex - Índice de la textura en el array global textureURLs.
 */
function updateTexturePreview(selectId, previewId, textureIndex) {
    const selectElement = document.getElementById(selectId);
    const previewElement = document.getElementById(previewId);
    if (!selectElement || !previewElement) return;

    if (textureIndex !== -1 && textureURLs[textureIndex] && !textureURLs[textureIndex].includes("textura_lava1.jpg") && !textureURLs[textureIndex].includes("textura_puerta1.jpg")) {
        previewElement.src = textureURLs[textureIndex];
        previewElement.style.display = 'inline-block';
    } else {
        previewElement.src = '';
        previewElement.style.display = 'none';
    }
    selectElement.value = textureIndex;
}

/**
 * Configura la cuadrícula del editor y sus eventos de clic.
 * @param {number} width - Ancho de la cuadrícula.
 * @param {number} height - Alto de la cuadrícula.
 * @param {Array<Array<number>>} gridData - Datos iniciales de la cuadrícula.
 */
function setupEditorGrid(width, height, gridData) { 
    editorGridContainer.innerHTML = ''; 
    editorGridContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`; 
    editorGridContainer.style.gridTemplateRows = `repeat(${height}, 1fr)`; 
    
    // Copia profunda para no modificar el escenario original si se está editando
    editorGridData = JSON.parse(JSON.stringify(gridData)); 
    editorCellElements = []; 
    
    for (let r = 0; r < height; r++) { 
        editorCellElements[r] = []; 
        for (let c = 0; c < width; c++) { 
            const cell = document.createElement('div'); 
            cell.classList.add('grid-cell'); 
            cell.dataset.row = r; 
            cell.dataset.col = c; 
            
            if (r === 0 || r === height - 1 || c === 0 || c === width - 1) { 
                cell.classList.add('border'); 
                editorGridData[r][c] = 0; // Asegurar que los bordes sean paredes
            } 
            updateCellVisual(cell, editorGridData[r][c]); 
            cell.addEventListener('click', handleGridCellClick); 
            editorGridContainer.appendChild(cell); 
            editorCellElements[r][c] = cell; 
        } 
    } 
}

/**
 * Actualiza la apariencia visual de una celda en el editor.
 * @param {HTMLElement} cellElement - El elemento HTML de la celda.
 * @param {number} cellType - El tipo de celda.
 */
function updateCellVisual(cellElement, cellType) {
    cellElement.classList.remove('path', 'start', 'end', 'wall', 'pittrap', 'fallingblock', 'spikes', 'minotaur', 'lava', 'door', 'movingplatform'); 
    let symbol = '';
    cellElement.style.fontSize = "12px";
    cellElement.style.color = "rgba(255,255,255,0.8)";
    
    const defaultBgClass = cellElement.classList.contains('border') ? 'border' : (editorGridData[parseInt(cellElement.dataset.row)][parseInt(cellElement.dataset.col)] === 0 ? 'wall' : 'path');
    if (!cellElement.classList.contains(defaultBgClass)) {
         cellElement.style.backgroundColor = ""; 
    }

    switch (cellType) {
        case 0: cellElement.classList.add('wall'); break;
        case 1: cellElement.classList.add('path'); break;
        case 5: cellElement.classList.add('start'); symbol = 'S'; break;
        case END_CELL_TERMINATE: cellElement.classList.add('end'); symbol = 'E'; break;
        case END_CELL_SPECIFIC_NEXT:
            cellElement.classList.add('end'); 
            symbol = 'E>';
            cellElement.style.backgroundColor = MINIMAP_END_LINK_COLOR; 
            break;
        case PIT_TRAP_CELL_TYPE: cellElement.classList.add('pittrap'); symbol = 'T'; break;
        case FALLING_BLOCK_TRAP_CELL_TYPE: cellElement.classList.add('fallingblock'); symbol = 'B'; break;
        case SPIKE_TRAP_CELL_TYPE: cellElement.classList.add('spikes'); symbol = 'P'; break;
        case MINOTAUR_CELL_TYPE: cellElement.classList.add('minotaur'); symbol = 'M'; break;
        case LAVA_CELL_TYPE: cellElement.classList.add('lava'); symbol = 'L'; break; 
        case DOOR_H_CELL_TYPE: cellElement.classList.add('door'); symbol = 'D—'; break; 
        case DOOR_V_CELL_TYPE: cellElement.classList.add('door'); symbol = 'D|'; break; 
        case MOVING_PLATFORM_CELL_TYPE: cellElement.classList.add('movingplatform'); symbol = 'PF'; break; 
        default: cellElement.classList.add('wall'); break; 
    }
    cellElement.textContent = symbol;
}

/**
 * Maneja el clic en una celda de la cuadrícula del editor.
 * Aplica el tipo de celda seleccionado por el pincel.
 * @param {MouseEvent} event - El evento de clic.
 */
function handleGridCellClick(event) {
    const cell = event.target;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    if (cell.classList.contains('border')) return; // No permitir cambios en las celdas de borde

    let newType;
    let newCellTypeForGridData = -1; // Usado para el tipo de fin si es específico

    switch (selectedBrush) {
        case 'wall': newType = 0; break;
        case 'path': newType = 1; break;
        case 'start': newType = 5; break;
        case 'pittrap': newType = PIT_TRAP_CELL_TYPE; break;
        case 'fallingblock': newType = FALLING_BLOCK_TRAP_CELL_TYPE; break;
        case 'spikes': newType = SPIKE_TRAP_CELL_TYPE; break;
        case 'minotaur': newType = MINOTAUR_CELL_TYPE; break;
        case 'lava': newType = LAVA_CELL_TYPE; break; 
        case 'doorh': newType = DOOR_H_CELL_TYPE; break; 
        case 'doorv': newType = DOOR_V_CELL_TYPE; break; 
        case 'movingplatform': newType = MOVING_PLATFORM_CELL_TYPE; break; 
        case 'end':
            const endBehaviorRadio = document.querySelector('input[name="end-behavior"]:checked');
            const endBehavior = endBehaviorRadio ? endBehaviorRadio.value : 'terminate';

            if (endBehavior === 'specific_next_scenario') {
                newType = END_CELL_SPECIFIC_NEXT;
                const targetScenarioIdSelected = specificNextScenarioSelect.value ? parseInt(specificNextScenarioSelect.value) : null;
                if (targetScenarioIdSelected === null || isNaN(targetScenarioIdSelected) || targetScenarioIdSelected === "") {
                    editorMessageSpan.textContent = "Selecciona un escenario de destino para el fin específico o cambia el comportamiento.";
                    setTimeout(() => editorMessageSpan.textContent = "", 3500);
                    return; 
                }
            } else {
                newType = END_CELL_TERMINATE;
            }
            newCellTypeForGridData = newType; 
            break;
        default: return;
    }
    
    // Si se coloca un punto de inicio o un Minotauro, eliminar el anterior para asegurar unicidad
    if (newType === 5 || newType === MINOTAUR_CELL_TYPE) { 
         for (let i = 0; i < editorGridData.length; i++) {
            for (let j = 0; j < editorGridData[i].length; j++) {
                if (editorGridData[i][j] === newType) { 
                    editorGridData[i][j] = 1; // Convertir el anterior a camino
                    if (editorCellElements[i] && editorCellElements[i][j]) {
                        updateCellVisual(editorCellElements[i][j], 1);
                    }
                }
            }
        }
    }

    // Actualizar la celda clickeada
    editorGridData[r][c] = (newCellTypeForGridData !== -1 && selectedBrush === 'end') ? newCellTypeForGridData : newType;
    updateCellVisual(cell, editorGridData[r][c]);
    hasUnsavedChanges = true; // Marcar como cambios no guardados
    checkEditorStateForPlayability(); // Volver a comprobar la validez y el estado del botón "Jugar"
}

/**
 * Valida la cuadrícula del editor para asegurar que el laberinto es jugable.
 * @returns {object} Un objeto con {valid: boolean, message: string}.
 */
function validateEditorGrid() {
    if (!editorGridData || editorGridData.length === 0 || !editorGridData[0] || editorGridData[0].length === 0) return {valid: false, message: "The grid is empty."};
    let startPoint = null;
    let endPointInfos = []; 
    let minotaurPoint = null;
    const rows = editorGridData.length;
    const cols = editorGridData[0].length;

    for (let r = 0; r < rows; r++) {
        if (!editorGridData[r]) { console.error(`Row ${r} is null/undefined in editorGridData`); continue; }
        for (let c = 0; c < cols; c++) {
            const cellValue = editorGridData[r][c];
            if (cellValue === undefined || cellValue === null) { console.warn(`Cell [${r}][${c}] is null/undefined, treating as wall (0).`); editorGridData[r][c] = 0; if (editorCellElements && editorCellElements[r] && editorCellElements[r][c]) { updateCellVisual(editorCellElements[r][c], 0); } }
            
            if (editorGridData[r][c] === 5) { 
                if (startPoint) return {valid: false, message: "Only one start point (S) is allowed."}; 
                startPoint = {r, c}; 
            }
            if (editorGridData[r][c] === END_CELL_TERMINATE || editorGridData[r][c] === END_CELL_SPECIFIC_NEXT) { 
                endPointInfos.push({r, c, type: editorGridData[r][c]}); 
            }
            if (editorGridData[r][c] === MINOTAUR_CELL_TYPE) { 
                if (minotaurPoint) return {valid: false, message: "Only one Minotaur (M) is allowed."}; 
                minotaurPoint = {r,c};
            }
            // Comprobar que las trampas, puertas y plataformas no estén en el borde
            if ((editorGridData[r][c] === PIT_TRAP_CELL_TYPE || 
                 editorGridData[r][c] === FALLING_BLOCK_TRAP_CELL_TYPE || 
                 editorGridData[r][c] === SPIKE_TRAP_CELL_TYPE || 
                 editorGridData[r][c] === LAVA_CELL_TYPE || 
                 editorGridData[r][c] === MOVING_PLATFORM_CELL_TYPE || 
                 editorGridData[r][c] === DOOR_H_CELL_TYPE || 
                 editorGridData[r][c] === DOOR_V_CELL_TYPE) && (r === 0 || r === rows - 1 || c === 0 || c === cols - 1)) { 
                return { valid: false, message: `Traps, Doors or Platforms cannot be on the border.` }; 
            }
        }
    }
    // Comprobar la existencia de puntos clave
    if (!startPoint) return {valid: false, message: "Missing a start point (S)."};
    if (endPointInfos.length === 0) return {valid: false, message: "Missing at least one end point (E or E>)."}; 

    // Comprobar que los puntos clave no estén en los bordes
    if (startPoint.r === 0 || startPoint.r === rows - 1 || startPoint.c === 0 || startPoint.c === cols - 1) return { valid: false, message: "Start (S) cannot be on the border." };

    for (const endInfo of endPointInfos) {
        if (endInfo.r === 0 || endInfo.r === rows - 1 || endInfo.c === 0 || endInfo.c === cols - 1) return { valid: false, message: `End point (E or E>) at ${endInfo.r},${endInfo.c} cannot be on the border.` };
        if (editorGridData[endInfo.r][endInfo.c] === 0) return { valid: false, message: `End point at ${endInfo.r},${endInfo.c} cannot be on a wall.` }; 
    }
    if (minotaurPoint) {
         if (minotaurPoint.r === 0 || minotaurPoint.r === rows - 1 || minotaurPoint.c === 0 || minotaurPoint.c === cols - 1) return { valid: false, message: "Minotaur (M) cannot be on the border." };
         if (editorGridData[minotaurPoint.r][minotaurPoint.c] === LAVA_CELL_TYPE) return {valid: false, message: "Minotaur (M) cannot start on Lava."}; 
    }
    
    // Si hay celdas de fin específico, comprobar que el selector de destino esté configurado
    const hasSpecificNextTypeCell = endPointInfos.some(ep => ep.type === END_CELL_SPECIFIC_NEXT);
    if (hasSpecificNextTypeCell) {
        const selectedEndBehaviorRadio = document.querySelector('input[name="end-behavior"]:checked');
        if (selectedEndBehaviorRadio && selectedEndBehaviorRadio.value === 'specific_next_scenario') {
            if (!specificNextScenarioSelect.value || specificNextScenarioSelect.value === "") {
                return {valid: false, message: "An 'E>' cell exists, but 'Cargar Escenario Específico' (in options) has no destination selected."};
            }
        }
    }

    return {valid: true, message: "Valid maze."};
}

/**
 * Escapa caracteres HTML especiales en una cadena.
 * @param {string} str - La cadena a escapar.
 * @returns {string} La cadena con los caracteres HTML escapados.
 */
function escapeHTML(str) { 
    if (str === null || str === undefined) return ""; 
    return String(str).replace(/[&<>"']/g, function (match) { 
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]; 
    }); 
}

/**
 * Muestra la interfaz de usuario de selección de mapas predefinidos.
 */
function showPredefinedMapSelectionUI() {
    window.gameActive = false;
    if (window.animationFrameId) { cancelAnimationFrame(window.animationFrameId); window.animationFrameId = null; }
    if (window.isPointerLocked && document.pointerLockElement) document.exitPointerLock();
    
    if(startOptionsDiv) startOptionsDiv.style.display = 'none';
    if(loadingTextElement) loadingTextElement.style.display = 'none';
    if(loadingScreenElement) loadingScreenElement.style.display = 'none';
    customGameScreen.style.display = 'none';
    scenarioEditorScreen.style.display = 'none';
    nextScenarioSelectionScreen.style.display = 'none';
    predefinedMapsScreen.style.display = 'flex';
    loadAndDisplayPredefinedMaps();
}

/**
 * Carga y muestra la lista de mapas predefinidos.
 */
async function loadAndDisplayPredefinedMaps() {
    predefinedMapListUL.innerHTML = '';
    noPredefinedMapsMsg.textContent = "Cargando mapas...";
    noPredefinedMapsMsg.style.display = 'block';
    const fetchedMaps = [];
    let mapsFound = 0;

    for (let i = 1; i <= MAX_PREDEFINED_MAPS; i++) {
        const mapUrl = `${PREDEFINED_MAP_BASE_URL}map${i}.json`;
        try {
            const response = await fetch(mapUrl);
            if (response.ok) {
                const mapData = await response.json();
                if (mapData && mapData.grid && mapData.width && mapData.height) {
                    mapData.fileName = `map${i}.json`; 
                    fetchedMaps.push(mapData);
                    mapsFound++;
                } else {
                    console.warn(`Mapa ${mapUrl} parece corrupto o incompleto.`);
                }
            } else {
                // console.log(`Mapa ${mapUrl} no encontrado (HTTP ${response.status}).`);
            }
        } catch (error) {
            // console.warn(`Error cargando mapa ${mapUrl}:`, error); 
        }
    }

    if (mapsFound > 0) {
        noPredefinedMapsMsg.style.display = 'none';
        fetchedMaps.forEach(mapData => {
            const listItem = document.createElement('li');
            listItem.classList.add('scenario-item'); 
            
            const displayName = mapData.name || mapData.fileName;

            listItem.innerHTML = `
                <div class="scenario-info">
                    <span>${escapeHTML(displayName)} (${mapData.width}x${mapData.height})</span>
                </div>
                <div class="scenario-actions">
                    <button class="action-btn play-predefined-map-btn">Jugar este mapa</button>
                </div>
            `;
            
            listItem.querySelector('.play-predefined-map-btn').addEventListener('click', () => {
                predefinedMapsScreen.style.display = 'none';
                if(loadingTextElement) loadingTextElement.style.display = 'block';
                if(loadingScreenElement) loadingScreenElement.style.display = 'flex';

                window.preloadAssets(() => { 
                    if (mapData.textures) {
                        selectTexturesForScenario(mapData.textures);
                    } else {
                        selectRandomTextures(); 
                    }
                    window.currentPlayingScenarioData = JSON.parse(JSON.stringify(mapData));
                    window.init(mapData);
                    finalizeLoadingScreen();
                });
            });
            predefinedMapListUL.appendChild(listItem);
        });
    } else {
        noPredefinedMapsMsg.textContent = "No hay mapas predeterminados disponibles o no se pudieron cargar.";
        noPredefinedMapsMsg.style.display = 'block';
    }
}

/**
 * Inicia la secuencia de carga inicial del juego.
 * Configura los listeners de eventos para los botones del menú principal.
 */
function startGameSequence() {
    console.log("Showing start options...");
    const gameVersionSpan = document.getElementById('game-version');
    if(gameVersionSpan) gameVersionSpan.textContent = GAME_VERSION;

    // Obtener referencias a elementos del DOM
    containerDiv = document.getElementById('container');
    joystickArea = document.getElementById('joystick-area');
    joystickThumb = document.getElementById('joystick-thumb');
    jumpButton = document.getElementById('jump-button');
    actionButton = document.getElementById('action-button');
    gameMenuActionButton = document.getElementById('game-menu-action-button');
    messageDiv = document.getElementById('message');
    minimapCanvas = document.getElementById('minimapCanvas');
    pointerLockInfoDiv = document.getElementById('pointer-lock-info');
    
    // Pantallas principales
    startOptionsDiv = document.getElementById('start-options');
    loadingTextElement = document.getElementById('loading-text-element');
    loadingScreenElement = document.getElementById('loading-screen');
    customGameScreen = document.getElementById('custom-game-screen');
    scenarioEditorScreen = document.getElementById('scenario-editor-screen');
    predefinedMapsScreen = document.getElementById('predefined-maps-screen');

    // Elementos de listas y botones de gestión
    customScenarioListUL = document.getElementById('custom-scenario-list');
    noCustomScenariosMsg = document.getElementById('no-custom-scenarios');
    createNewScenarioBtn = document.getElementById('create-new-scenario-btn');
    importScenarioBtn = document.getElementById('import-scenario-btn');
    importFileInput = document.getElementById('import-file-input');
    backToMainMenuBtn = document.getElementById('back-to-main-menu-btn');
    backToCustomScreenBtn = document.getElementById('back-to-custom-screen-btn');

    // Elementos del editor de escenarios
    dimensionSelectorDiv = document.getElementById('dimension-selector');
    scenarioSizeSelect = document.getElementById('scenario-size-select');
    confirmSizeBtn = document.getElementById('confirm-size-btn');
    brushToolsDiv = document.getElementById('brush-tools');
    scenarioNameInput = document.getElementById('scenario-name-input');
    editorGridContainer = document.getElementById('editor-grid-container');
    editorActionsDiv = document.getElementById('editor-actions');
    saveScenarioBtn = document.getElementById('save-scenario-btn');
    playEditedScenarioBtn = document.getElementById('play-edited-scenario-btn');
    editorMessageSpan = document.getElementById('editor-message');
    textureSelectorsDiv = document.getElementById('texture-selectors');
    endCellOptionsDiv = document.getElementById('end-cell-options');
    specificNextScenarioSelect = document.getElementById('specific-next-scenario-select');

    // Elementos de selección del siguiente escenario (post-partida)
    nextScenarioSelectionScreen = document.getElementById('next-scenario-selection-screen');
    nextScenarioListUL = document.getElementById('next-scenario-list');
    noNextScenariosMsg = document.getElementById('no-next-scenarios');
    cancelNextScenarioBtn = document.getElementById('cancel-next-scenario');

    // Elementos del menú en juego
    gameMenuOverlay = document.getElementById('game-menu-overlay');
    resumeGameBtn = document.getElementById('resume-game-btn');
    mainMenuFromGameBtn = document.getElementById('main-menu-from-game-btn');
    fullscreenToggleButton = document.getElementById('fullscreen-toggle-btn');
    cameraSensitivitySlider = document.getElementById('camera-sensitivity-slider');

    // Mostrar la pantalla de carga inicialmente
    if(loadingScreenElement) loadingScreenElement.style.display = 'flex';
    if(startOptionsDiv) startOptionsDiv.style.display = 'flex';
    if(loadingTextElement) loadingTextElement.style.display = 'none';
    
    // Asegurarse de que la pantalla de muerte esté oculta al inicio
    const deathScreenOverlay = document.getElementById('death-screen-overlay');
    if (deathScreenOverlay) deathScreenOverlay.style.display = 'none';

    // Inicializar selectores de textura
    populateTextureSelectors(); 

    // Inicializar IndexedDB
    initDB().then(() => {
        console.log("Database ready for use from startGameSequence.");
        if (startCustomGameButton) startCustomGameButton.disabled = false;
    }).catch(error => {
        console.error("Database initialization failed. Custom game will not work correctly.", error);
        alert("Could not initialize database for custom scenarios. This feature might not be available.");
        if (startCustomGameButton) startCustomGameButton.disabled = true;
    });

    // --- Configuración de Event Listeners ---
    if (startPredefinedMapsButton) {
        startPredefinedMapsButton.addEventListener('click', showPredefinedMapSelectionUI);
    }
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        });
    }

    startCustomGameButton.addEventListener('click', showCustomGameUI);

    cancelNextScenarioBtn.addEventListener('click', () => {
        nextScenarioSelectionScreen.style.display = 'none';
        predefinedMapsScreen.style.display = 'none'; 
        if(loadingScreenElement) loadingScreenElement.style.display = 'flex';
        if(startOptionsDiv) startOptionsDiv.style.display = 'flex';
    });
    backToMainFromPredefinedBtn.addEventListener('click', () => {
        predefinedMapsScreen.style.display = 'none';
        if(loadingScreenElement) loadingScreenElement.style.display = 'flex';
        if(startOptionsDiv) startOptionsDiv.style.display = 'flex';
    });

    // Event listeners para el editor
    confirmSizeBtn.addEventListener('click', confirmSizeBtnEventListener); 
    importScenarioBtn.addEventListener('click', () => { importFileInput.click(); });
    importFileInput.addEventListener('change', (event) => { 
        const file = event.target.files[0]; 
        if (file) { 
            const reader = new FileReader(); 
            reader.onload = async (e) => { 
                try { 
                    const importedScenario = JSON.parse(e.target.result); 
                    if (importedScenario.name && importedScenario.width && importedScenario.height && importedScenario.grid && Array.isArray(importedScenario.grid) && importedScenario.grid.length === importedScenario.height && importedScenario.grid.every(row => Array.isArray(row) && row.length === importedScenario.width)) { 
                        let scenarioToSave = { name: importedScenario.name, width: importedScenario.width, height: importedScenario.height, grid: importedScenario.grid, textures: importedScenario.textures || {wall:-1, floor:-1, ceiling:-1}, specificNextScenarioName: importedScenario.specificNextScenarioName || null, specificExitCoords: importedScenario.specificExitCoords || null }; 
                        const existingScenarios = await getAllScenariosDB(); 
                        const existingByName = existingScenarios.find(s => s.name === scenarioToSave.name); 
                        if (existingByName) { 
                            if (confirm(`Un escenario llamado "${scenarioToSave.name}" ya existe. ¿Quieres sobrescribirlo?`)) { 
                                scenarioToSave.id = existingByName.id; 
                            } else { 
                                importFileInput.value = ''; return; 
                            } 
                        } 
                        await saveScenarioDB(scenarioToSave); 
                        loadAndDisplayCustomScenarios(); 
                        alert(`Scenario "${importedScenario.name}" imported successfully.`); 
                    } else { alert("The JSON file does not have the expected scenario format or is corrupt."); } 
                } catch (error) { console.error("Error importing scenario:", error); alert("Error processing the JSON file. Ensure it is valid."); } 
                importFileInput.value = ''; 
            }; 
            reader.readAsText(file); 
        } 
    });
    createNewScenarioBtn.addEventListener('click', () => { openScenarioEditor(null); });
    backToCustomScreenBtn.addEventListener('click', () => { 
        if (hasUnsavedChanges) { 
            if (!confirm("You have unsaved changes. Are you sure you want to leave the editor? Changes will be lost.")) { return; } 
        } 
        scenarioEditorScreen.style.display = 'none'; 
        customGameScreen.style.display = 'flex'; 
        currentEditingScenario = null; 
        hasUnsavedChanges = false; 
        editorMessageSpan.textContent = ''; 
    });
    saveScenarioBtn.addEventListener('click', async () => {
        const scenarioName = scenarioNameInput.value.trim();
        if (!scenarioName) { editorMessageSpan.textContent = "Please enter a scenario name."; return; }

        currentEditingScenario.name = scenarioName;
        currentEditingScenario.grid = JSON.parse(JSON.stringify(editorGridData)); 
        currentEditingScenario.textures = {
            wall: parseInt(document.getElementById('wall-texture-select').value),
            floor: parseInt(document.getElementById('floor-texture-select').value),
            ceiling: parseInt(document.getElementById('ceiling-texture-select').value)
        };

        currentEditingScenario.specificNextScenarioName = null;
        currentEditingScenario.specificExitCoords = null; 
        
        const selectedEndBehaviorRadio = document.querySelector('input[name="end-behavior"]:checked');
        const endBehaviorSetting = selectedEndBehaviorRadio ? selectedEndBehaviorRadio.value : 'terminate';

        let hasAnySpecificEndCellInGrid = false;
        for (let r = 0; r < currentEditingScenario.grid.length; r++) {
            for (let c = 0; c < currentEditingScenario.grid[r].length; c++) {
                if (currentEditingScenario.grid[r][c] === END_CELL_SPECIFIC_NEXT) {
                    hasAnySpecificEndCellInGrid = true;
                    if (!currentEditingScenario.specificExitCoords) {
                         currentEditingScenario.specificExitCoords = {x: c, z: r}; 
                    }
                }
            }
        }

        if (endBehaviorSetting === 'specific_next_scenario' && hasAnySpecificEndCellInGrid) {
            const targetScenarioId = specificNextScenarioSelect.value ? parseInt(specificNextScenarioSelect.value) : null;
            if (targetScenarioId !== null && !isNaN(targetScenarioId) && targetScenarioId > 0) {
                const scenarios = await getAllScenariosDB();
                const targetScenario = scenarios.find(s => s.id === targetScenarioId);
                if (targetScenario) {
                    currentEditingScenario.specificNextScenarioName = targetScenario.name;
                } else {
                    editorMessageSpan.textContent = "Error: Escenario de destino no encontrado. Los fines 'E>' se guardarán como fines normales 'E'.";
                    for (let r=0; r<currentEditingScenario.grid.length; r++) for (let c=0; c<currentEditingScenario.grid[r].length; c++) if(currentEditingScenario.grid[r][c] === END_CELL_SPECIFIC_NEXT) currentEditingScenario.grid[r][c] = END_CELL_TERMINATE;
                    setTimeout(() => editorMessageSpan.textContent = "", 4000);
                }
            } else {
                 editorMessageSpan.textContent = "Advertencia: Fines 'E>' sin destino válido. Se guardarán como fines normales 'E'.";
                 for (let r=0; r<currentEditingScenario.grid.length; r++) for (let c=0; c<currentEditingScenario.grid[r].length; c++) if(currentEditingScenario.grid[r][c] === END_CELL_SPECIFIC_NEXT) currentEditingScenario.grid[r][c] = END_CELL_TERMINATE;
                 setTimeout(() => editorMessageSpan.textContent = "", 4000);
            }
        }
        delete currentEditingScenario.specificNextScenarioId_temp; 

        const validationResult = validateEditorGrid(); 
        if (!validationResult.valid) { editorMessageSpan.textContent = validationResult.message; return; }


        try {
            const allScenarios = await getAllScenariosDB();
            let nameConflict = null;
            if (currentEditingScenario.id !== null && currentEditingScenario.id !== undefined) { 
                nameConflict = allScenarios.find(s => s.name === currentEditingScenario.name && s.id !== currentEditingScenario.id);
            } else { 
                nameConflict = allScenarios.find(s => s.name === currentEditingScenario.name);
            }

            if (nameConflict) {
                if (!confirm(`Un escenario llamado "${currentEditingScenario.name}" ya existe. ¿Quieres sobrescribirlo?`)) {
                    editorMessageSpan.textContent = "Guardado cancelado. Conflicto de nombre.";
                    return;
                }
                if (currentEditingScenario.id === null || currentEditingScenario.id === undefined) {
                     currentEditingScenario.id = nameConflict.id;
                }
            }

            const savedScenario = await saveScenarioDB(currentEditingScenario);
            currentEditingScenario.id = savedScenario.id; 
            hasUnsavedChanges = false;
            editorMessageSpan.textContent = "Scenario saved!";
            playEditedScenarioBtn.disabled = false; 
            setTimeout(() => editorMessageSpan.textContent = "", 2000);
            loadAndDisplayCustomScenarios(); 
            openScenarioEditor(currentEditingScenario.id); 

        } catch (error) { console.error("Error saving scenario:", error); editorMessageSpan.textContent = "Error saving. Check console."; }
    });
    playEditedScenarioBtn.addEventListener('click', () => { 
        if (hasUnsavedChanges) { editorMessageSpan.textContent = "Save changes before playing."; return; } 
        if (!currentEditingScenario || currentEditingScenario.id === null || currentEditingScenario.id === undefined) { editorMessageSpan.textContent = "Save the scenario first."; return; } 
        const validation = validateEditorGrid(); 
        if (!validation.valid) { editorMessageSpan.textContent = "The maze is not valid for playing: " + validation.message; return; } 
        scenarioEditorScreen.style.display = 'none'; 
        if(loadingTextElement) loadingTextElement.style.display = 'block'; 
        if(loadingScreenElement) loadingScreenElement.style.display = 'flex'; 
        const scenarioToPlay = JSON.parse(JSON.stringify(currentEditingScenario)); 
        window.preloadAssets(() => { 
            selectTexturesForScenario(scenarioToPlay.textures); 
            window.currentPlayingScenarioData = JSON.parse(JSON.stringify(scenarioToPlay)); 
            window.init(scenarioToPlay); 
            finalizeLoadingScreen(); 
        }); 
    });

    // Event listeners para controles del editor y selección de texturas
    document.querySelectorAll('.brush-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            selectedBrush = button.dataset.type;

            if (selectedBrush === 'end') {
                if(endCellOptionsDiv) endCellOptionsDiv.style.display = 'block';
                const currentEndBehavior = document.querySelector('input[name="end-behavior"]:checked').value;
                if(specificNextScenarioSelect) specificNextScenarioSelect.style.display = (currentEndBehavior === 'specific_next_scenario') ? 'inline-block' : 'none';
                if (currentEndBehavior === 'specific_next_scenario' && specificNextScenarioSelect && specificNextScenarioSelect.options.length <=1 ) { 
                    populateSpecificNextScenarioSelector();
                }
            } else {
                if(endCellOptionsDiv) endCellOptionsDiv.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('input[name="end-behavior"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const newEndBehavior = this.value;
            if (newEndBehavior === 'specific_next_scenario') {
                populateSpecificNextScenarioSelector(); 
                if(specificNextScenarioSelect) specificNextScenarioSelect.style.display = 'inline-block';
            } else {
                if(specificNextScenarioSelect) specificNextScenarioSelect.style.display = 'none';
            }
            for (let r_idx = 0; r_idx < editorGridData.length; r_idx++) {
                for (let c_idx = 0; c_idx < editorGridData[r_idx].length; c_idx++) {
                    if (editorGridData[r_idx][c_idx] === END_CELL_TERMINATE || editorGridData[r_idx][c_idx] === END_CELL_SPECIFIC_NEXT) {
                        const newEndTypeForCell = (newEndBehavior === 'specific_next_scenario') ? END_CELL_SPECIFIC_NEXT : END_CELL_TERMINATE;
                        
                        if (newEndBehavior === 'specific_next_scenario' && (!specificNextScenarioSelect.value || specificNextScenarioSelect.value === "")) {
                            editorMessageSpan.textContent = "Selecciona un escenario de destino antes de cambiar todos los fines a 'Específico'.";
                            setTimeout(() => editorMessageSpan.textContent = "", 3500);
                            document.querySelector('input[name="end-behavior"][value="terminate"]').checked = true;
                            if(specificNextScenarioSelect) specificNextScenarioSelect.style.display = 'none';
                            return; 
                        }
                        
                        editorGridData[r_idx][c_idx] = newEndTypeForCell;
                        if (editorCellElements[r_idx] && editorCellElements[r_idx][c_idx]) {
                             updateCellVisual(editorCellElements[r_idx][c_idx], newEndTypeForCell);
                        }
                    }
                }
            }
            hasUnsavedChanges = true;
            checkEditorStateForPlayability();
        });
    });

    // Event listeners para el menú en juego
    resumeGameBtn.addEventListener('click', () => toggleGameMenu(false));
    mainMenuFromGameBtn.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que quieres volver al menú principal? Se perderá el progreso actual.")) {
            window.location.reload(); // Recargar la página para volver al menú principal
        }
    });
    fullscreenToggleButton.addEventListener('click', () => {
        const element = document.documentElement;
        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    });
    cameraSensitivitySlider.addEventListener('input', (event) => {
        CAMERA_SENSITIVITY = parseFloat(event.target.value);
    });

    // Registrar listeners de cambio de tamaño de ventana y pantalla completa
    window.addEventListener('resize', window.onWindowResize, false);
    document.addEventListener('fullscreenchange', window.onWindowResize);
    document.addEventListener('mozfullscreenchange', window.onWindowResize);
    document.addEventListener('webkitfullscreenchange', window.onWindowResize);
    document.addEventListener('msfullscreenchange', window.onWindowResize);
}

/**
 * Función que se ejecuta cuando el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar variables DOM aquí para asegurar que los elementos existan
    containerDiv = document.getElementById('container');
    joystickArea = document.getElementById('joystick-area');
    joystickThumb = document.getElementById('joystick-thumb');
    jumpButton = document.getElementById('jump-button');
    actionButton = document.getElementById('action-button');
    gameMenuActionButton = document.getElementById('game-menu-action-button'); // NEW
    messageDiv = document.getElementById('message');
    minimapCanvas = document.getElementById('minimapCanvas');
    pointerLockInfoDiv = document.getElementById('pointer-lock-info');

    startPredefinedMapsButton = document.getElementById('start-predefined-maps');
    startCustomGameButton = document.getElementById('start-custom-game');
    loadingTextElement = document.getElementById('loading-text-element');
    startOptionsDiv = document.getElementById('start-options');
    loadingScreenElement = document.getElementById('loading-screen');
    
    customGameScreen = document.getElementById('custom-game-screen');
    scenarioEditorScreen = document.getElementById('scenario-editor-screen');
    customScenarioListUL = document.getElementById('custom-scenario-list');
    noCustomScenariosMsg = document.getElementById('no-custom-scenarios');
    createNewScenarioBtn = document.getElementById('create-new-scenario-btn');
    importScenarioBtn = document.getElementById('import-scenario-btn');
    importFileInput = document.getElementById('import-file-input');
    backToMainMenuBtn = document.getElementById('back-to-main-menu-btn');
    backToCustomScreenBtn = document.getElementById('back-to-custom-screen-btn');
    dimensionSelectorDiv = document.getElementById('dimension-selector');
    scenarioSizeSelect = document.getElementById('scenario-size-select');
    confirmSizeBtn = document.getElementById('confirm-size-btn');
    brushToolsDiv = document.getElementById('brush-tools');
    scenarioNameInput = document.getElementById('scenario-name-input');
    editorGridContainer = document.getElementById('editor-grid-container');
    editorActionsDiv = document.getElementById('editor-actions');
    saveScenarioBtn = document.getElementById('save-scenario-btn');
    playEditedScenarioBtn = document.getElementById('play-edited-scenario-btn');
    editorMessageSpan = document.getElementById('editor-message');
    textureSelectorsDiv = document.getElementById('texture-selectors');
    endCellOptionsDiv = document.getElementById('end-cell-options');
    specificNextScenarioSelect = document.getElementById('specific-next-scenario-select');

    nextScenarioSelectionScreen = document.getElementById('next-scenario-selection-screen');
    nextScenarioListUL = document.getElementById('next-scenario-list');
    noNextScenariosMsg = document.getElementById('no-next-scenarios');
    cancelNextScenarioBtn = document.getElementById('cancel-next-scenario');

    predefinedMapsScreen = document.getElementById('predefined-maps-screen');
    predefinedMapListUL = document.getElementById('predefined-map-list');
    noPredefinedMapsMsg = document.getElementById('no-predefined-maps');
    backToMainFromPredefinedBtn = document.getElementById('back-to-main-from-predefined');

    fullscreenButton = document.getElementById('fullscreen-btn');

    gameMenuOverlay = document.getElementById('game-menu-overlay'); // NEW
    resumeGameBtn = document.getElementById('resume-game-btn'); // NEW
    mainMenuFromGameBtn = document.getElementById('main-menu-from-game-btn'); // NEW
    fullscreenToggleButton = document.getElementById('fullscreen-toggle-btn'); // NEW
    cameraSensitivitySlider = document.getElementById('camera-sensitivity-slider'); // NEW

    startGameSequence();
});

// Exportar funciones y variables que necesitan ser accesibles globalmente
window.showMessage = showMessage;
window.loseGame = loseGame;
window.winGame = winGame;
window.drawMinimap = drawMinimap;
window.hasLineOfSight = hasLineOfSight;
window.updateVisibility = updateVisibility;
window.isInsideUIScreen = isInsideUIScreen;
window.updateJoystickThumb = updateJoystickThumb;
window.updateMovementFromJoystick = updateMovementFromJoystick;
window.setupTouchControls = setupTouchControls;
window.handlePointerDown = handlePointerDown;
window.handlePointerMove = handlePointerMove;
window.handlePointerEnd = handlePointerEnd;
window.setupKeyboardAndMouseControls = setupKeyboardAndMouseControls;
window.handleKeyPress = handleKeyPress;
window.updateMovementFromKeyboard = updateMovementFromKeyboard;
window.updateCameraLook = updateCameraLook;
window.toggleGameMenu = toggleGameMenu;
window.populateTextureSelectors = populateTextureSelectors;
window.selectTexturesForScenario = selectTexturesForScenario;
window.selectRandomTextures = selectRandomTextures;
window.displayNextScenarioSelection = displayNextScenarioSelection;
window.showCustomGameUI = showCustomGameUI;
window.loadAndDisplayCustomScenarios = loadAndDisplayCustomScenarios;
window.generateScenarioPreview = generateScenarioPreview;
window.addScenarioActionListeners = addScenarioActionListeners;
window.exportScenarioAsJSON = exportScenarioAsJSON;
window.openScenarioEditor = openScenarioEditor;
window.populateSpecificNextScenarioSelector = populateSpecificNextScenarioSelector;
window.updateTexturePreview = updateTexturePreview;
window.setupEditorGrid = setupEditorGrid;
window.updateCellVisual = updateCellVisual;
window.handleGridCellClick = handleGridCellClick;
window.validateEditorGrid = validateEditorGrid;
window.checkEditorStateForPlayability = checkEditorStateForPlayability;
window.escapeHTML = escapeHTML;
window.showPredefinedMapSelectionUI = showPredefinedMapSelectionUI;
window.loadAndDisplayPredefinedMaps = loadAndDisplayPredefinedMaps;
window.startGameSequence = startGameSequence;
window.finalizeLoadingScreen = () => {
    setTimeout(() => {
        if(loadingScreenElement) {
            loadingScreenElement.style.opacity = '0';
            setTimeout(() => {
                loadingScreenElement.style.display = 'none';
                loadingScreenElement.style.opacity = '1'; 
            }, 500); 
        }
        console.log("Loading screen hidden. Game started.");
         if (!window.isTouchDevice && pointerLockInfoDiv && pointerLockInfoDiv.style.display !== 'none' && !window.isPointerLocked) {
            pointerLockInfoDiv.style.display = 'block';
        }
    }, 200); 
};