// game_engine.js: Define las constantes, la escena principal, la cámara, el renderizador, el jugador y el bucle de animación.

// --- Constantes y Configuración ---
const GAME_VERSION = "v1.14-door_mechanics"; 
const MAX_RESOLUTION_DIMENSION = 1920;
const MAX_RESOLUTION_DIMENSION_MOBILE = 1280;
const CELL_SIZE = 4; const WALL_HEIGHT = 7;
const PLAYER_HEIGHT = 2.4; 
const PLAYER_RADIUS = 0.4; 
const PLAYER_SPEED = 4.5; 
const SPRINT_SPEED = 8.0; 
const SPRINT_THRESHOLD = 0.9; 
const JUMP_VELOCITY = 10.5; 
const GRAVITY = -18.0; 
const CAMERA_DISTANCE = 6; 
const CAMERA_HEIGHT_OFFSET = 2.5; 
const PUSH_DISTANCE = 0.8; 
const JOYSTICK_VISUAL_RADIUS = 60; 
const JOYSTICK_EFFECTIVE_RADIUS = 50; 
const JOYSTICK_DEADZONE = 0.1; 
let CAMERA_SENSITIVITY = 0.002; // Made mutable
const CAMERA_SENSITIVITY_MOBILE_MULTIPLIER = 2.0; 
const OBSTACLE_OPACITY = 0.20; 
		
       
const TORCH_COLOR = 0xffa545; 
const SPEAR_LIGHT_INTENSITY = 5.0; 
const SPEAR_LIGHT_DISTANCE = 30; 
const SPEAR_LIGHT_DECAY = 15;
const SPEAR_FLAME_SIZE = 0.15; 

const TORCH_STATIC_INTENSITY = 10.0; 
const TORCH_STATIC_DISTANCE = 20; 
const TORCH_STATIC_DECAY = 8;
const STATIC_TORCH_FREQUENCY = 0.45;
		
		
		
const TORCH_FLICKER_AMOUNT = 0.25; const TORCH_WALL_OFFSET = 0.25; 
const FLAME_BASE_OPACITY = 0.8; 
const FLAME_OPACITY_VAR = 0.3; 
const FLAME_BASE_SCALE_Y = 0.4; 
const FLAME_SCALE_Y_VAR = 0.15; 
const MIN_CAMERA_Y_ABOVE_GROUND = 0.5;
const MINIMAP_SIZE = 160; const MINIMAP_RADIUS_CELLS = 5; const MINIMAP_CELL_SIZE_PX = Math.floor(MINIMAP_SIZE / (MINIMAP_RADIUS_CELLS * 2 + 1)); const MINIMAP_PLAYER_COLOR = '#ff4444'; const MINIMAP_WALL_COLOR = '#505050'; const MINIMAP_PATH_COLOR = '#888888'; const MINIMAP_END_COLOR = '#F44336';
const MINIMAP_END_LINK_COLOR = '#FF9800';
const MINIMAP_PITTRAP_INTACT_COLOR = '#D2691E'; 
const MINIMAP_PITTRAP_BROKEN_COLOR = '#111111';
const MINIMAP_FALLING_BLOCK_COLOR = '#6A5ACD'; 
const MINIMAP_SPIKES_COLOR = '#CD5C5C';
const MINIMAP_MINOTAUR_COLOR = '#FF0000';
const MINIMAP_LAVA_COLOR = '#ff6600'; 
const MINIMAP_DOOR_COLOR = '#A0522D';
const MINIMAP_MOVING_PLATFORM_COLOR = '#008080'; // New constant

const PLAYER_VISION_RADIUS_CELLS = 4; const MINIMAP_UNSEEN_COLOR = '#181818';
const FIRST_PERSON_EYE_HEIGHT_FACTOR = 0.85;
const CAMERA_PITCH_OFFSET_FPS = Math.PI / 2;

const PIT_TRAP_CELL_TYPE = 7;
const BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT = 8;
const FALLING_BLOCK_TRAP_CELL_TYPE = 9;
const SPIKE_TRAP_CELL_TYPE = 10;
const MINOTAUR_CELL_TYPE = 11; 
const LAVA_CELL_TYPE = 12; 
const END_CELL_TERMINATE = 6;
const END_CELL_SPECIFIC_NEXT = 61;
const DOOR_H_CELL_TYPE = 13; // Horizontal door (opens along Z axis)
const DOOR_V_CELL_TYPE = 14; // Vertical door (opens along X axis)
const MOVING_PLATFORM_CELL_TYPE = 15; // New cell type

const PIT_TRAP_TRIGGER_RADIUS_SQUARED = (CELL_SIZE * 0.30) * (CELL_SIZE * 0.30);
const PIT_TRAP_BREAK_ANIMATION_TIME = 600;
const PIT_FALL_DEPTH = -WALL_HEIGHT * 1.5;
const PIT_HOLE_MATERIAL = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.9 });
const PIT_COVER_THICKNESS = 0.05;
const PLAYER_STEP_HEIGHT = 0.25;
const FALLING_BLOCK_MATERIAL = new THREE.MeshStandardMaterial({ color: 0x605548, roughness: 0.9, metalness: 0.1 }); 
const SPIKE_MATERIAL = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3 });
const SPIKE_RISE_TIME = 200;
const SPIKE_HEIGHT = PLAYER_HEIGHT * 0.8;
const SPIKE_TRAP_DEACTIVATION_TIME = 2000; // Time after rising for spikes to deactivate (visual stays up, but no more damage)

const LAVA_SURFACE_OFFSET_Y = -0.15; 
const LAVA_LIGHT_COLOR = 0xff4500;
const LAVA_LIGHT_INTENSITY = 1.5;
const LAVA_LIGHT_DISTANCE = CELL_SIZE * 1.5;
const LAVA_FLOW_SPEED_U = 0.0007;
const LAVA_FLOW_SPEED_V = 0.0005;

const DOOR_TRIGGER_RADIUS = CELL_SIZE * 0.4; // How close player needs to be to open door (2D distance)
const DOOR_OPEN_DURATION = 800; // ms
const DOOR_CLOSE_DELAY = 3000; // ms after opening before it starts closing

const MOVING_PLATFORM_HEIGHT = 0.2;
const MOVING_PLATFORM_WIDTH_FACTOR = 0.8; // Platform is 80% of cell size
const MOVING_PLATFORM_SPEED = 1.0; // Units per second


// --- Minotaur Constants --- 
const MINOTAUR_TARGET_HEIGHT = PLAYER_HEIGHT * 1.1; 
const MINOTAUR_COLLISION_HEIGHT = PLAYER_HEIGHT * 1.6; 
const MINOTAUR_COLLISION_RADIUS = PLAYER_RADIUS * 1.6; 

const MINOTAUR_PATROL_SPEED = PLAYER_SPEED * 0.6;
const MINOTAUR_CHASE_SPEED = PLAYER_SPEED * 0.8;
const MINOTAUR_TURN_SPEED = Math.PI * 1.5; 
const MINOTAUR_VISION_RANGE_SQ = (CELL_SIZE * 5) * (CELL_SIZE * 5);
const MINOTAUR_VISION_ANGLE_DOT = Math.cos( (Math.PI / 2.5) / 2 ); 
const MINOTAUR_LOSE_SIGHT_TIME = 5000; // ms
const MINOTAUR_ATTACK_RANGE_BUFFER = 0.2; 
const MINOTAUR_ATTACK_RANGE_SQUARED = (MINOTAUR_COLLISION_RADIUS + PLAYER_RADIUS + MINOTAUR_ATTACK_RANGE_BUFFER) * (MINOTAUR_COLLISION_RADIUS + PLAYER_RADIUS + MINOTAUR_ATTACK_RANGE_BUFFER); 
const MINOTAUR_PATROL_TURN_CHANCE = 0.1;
const MINOTAUR_PATROL_NEW_TARGET_INTERVAL = 5000; // ms
const MINOTAUR_TORCH_COLOR = 0xff8c00; 

const MINOTAUR_TORCH_LIGHT_INTENSITY = 15.0;
const MINOTAUR_TORCH_LIGHT_DISTANCE = 50;
const MINOTAUR_TORCH_LIGHT_DECAY = 35.0;
const MINOTAUR_TORCH_FLAME_SIZE = 0.35;
const MINOTAUR_TORCH_OFFSET = new THREE.Vector3(MINOTAUR_COLLISION_RADIUS * 0.8, MINOTAUR_COLLISION_HEIGHT * 0.7, MINOTAUR_COLLISION_RADIUS * 0.4); 

// --- Smoke Particle Constants --- 
const MAX_SMOKE_PARTICLES = 0; 
const SMOKE_SPAWN_INTERVAL = 0.02; 
const SMOKE_PARTICLE_MIN_LIFE = 1.5; 
const SMOKE_PARTICLE_MAX_LIFE = 2.5; 
const SMOKE_PARTICLE_START_SIZE = 0.1;
const SMOKE_PARTICLE_END_SIZE = 1.0; 
const SMOKE_PARTICLE_START_OPACITY = 0.90; 
const SMOKE_PARTICLE_COLOR = 0x050505; 

// --- TEXTURAS ---
const textureBaseURL = 'https://urysoft.github.io/ai.html.games/general/assets/images/';
const BLOOD_SPLATTER_TEXTURE_URL = textureBaseURL + 'blood1.png';
const DOOR_TEXTURE_URL = textureBaseURL + 'textura_puerta1.jpg'; // Nueva textura para puertas

const textureURLs = [];
for (let i = 1; i <= 26; i++) {
    textureURLs.push(`${textureBaseURL}textura${i}.jpeg`);
}
textureURLs.push(`${textureBaseURL}textura_lava1.jpg`); 
textureURLs.push(DOOR_TEXTURE_URL); // Añadir textura de puerta

const textureLoader = new THREE.TextureLoader();
let loadedTextures = [];
let floorTexture, wallTexture, ceilingTexture, crackedTexture, lavaTexture, doorTexture, bloodSplatterTexture; 
let bloodSplatters = [];

// --- Death Image Constants ---
const DEATH_IMAGE_BASE_URL = 'https://urysoft.github.io/ai.html.games/games/minotaurio/images/';
const DEATH_REASON_TO_IMAGE = {
    "Caíste en un foso!": "muerte_foso.png",
    "¡Quemado por la lava!": "muerte_lava.png",
    "¡Atrapado por el Minotauro!": "muerte_minotaurio.png",
    "¡Ensartado por pinchos!": "muerte_pinchos.png",
    "¡Aplastado por rocas!": "muerte_rocas.png"
};
const DEATH_IMAGE_DISPLAY_DURATION = 3000; // ms

// --- Predefined Maps Constants ---
const PREDEFINED_MAP_BASE_URL = "https://urysoft.github.io/ai.html.games/games/minotaurio/maps/";
const MAX_PREDEFINED_MAPS = 25;

// Constants for FPS torch positioning
const FPS_TORCH_LOCAL_POS = new THREE.Vector3(0.8, -0.6, -1.5); // Position relative to camera, adjusted to look like holding it
const FPS_TORCH_LOCAL_ROT = new THREE.Euler(Math.PI / 18, 0, 0); // Rotation relative to camera


// --- Variables globales de Three.js y juego ---
let scene, camera, renderer, player, clock;
let currentMazeLayout = []; // Estado actual del laberinto (útil para trampas que cambian la casilla)
let maze = []; // Layout original del laberinto (para verificar tipos de casilla originales)
let initialPlayerPosition = new THREE.Vector3();
let currentPlayingScenarioData = null;

let currentMazeWidth, currentMazeHeight;
let collidableObjects = []; // Objetos con los que el jugador puede colisionar
let interactiveObjects = []; // Objetos con los que el jugador puede interactuar
let playerVelocity = new THREE.Vector3();
let playerOnGround = false;
let moveForward = 0, moveRight = 0; // Controles de movimiento
let cameraPhi = Math.PI / 3; // Ángulo de la cámara (vertical)
let cameraTheta = 0; // Ángulo de la cámara (horizontal)
let endZones = []; // Puntos de salida

let gameActive = false; // Estado del juego (pausado/activo)
let animationFrameId; // ID del requestAnimationFrame

// Referencias a elementos del DOM (se inicializan en ui_and_data.js)
let containerDiv;
let joystickArea, joystickThumb;
let jumpButton, actionButton, gameMenuActionButton;
let messageDiv;
let minimapCanvas, minimapCtx;
let pointerLockInfoDiv;
let isTouchDevice;

// Variables de control de entrada
let joystickPointerId = -1;
let cameraPointerId = -1;
let joystickStartPos = { x: 0, y: 0 };
let joystickCurrentPos = { x: 0, y: 0 };
let cameraTouchStartPos = { x: 0, y: 0 };
let keyStates = {}; // Estado de las teclas presionadas
let isPointerLocked = false; // Estado del bloqueo del puntero

let currentlyTransparentObjects = new Set(); // Objetos que se hacen transparentes en vista TPS

// Luces y partículas
let spearLight = null; // Luz de la antorcha del jugador
let spearFlameMesh = null; // Malla de la llama de la antorcha del jugador
let spearLightAndFlameGroup = null; // Grupo para la antorcha y su luz
let originalSpearParent = null; // Padre original de la antorcha (ej. hueso de la mano)
let originalSpearLocalPos = new THREE.Vector3(); // Posición local original de la antorcha
let originalSpearLocalRot = new THREE.Euler(); // Rotación local original de la antorcha

let staticTorches = []; // Antorchas estáticas en el laberinto
let lavaCells = []; // Celdas de lava

// Variables de colisión
const lightWorldPosHelper = new THREE.Vector3(); 
const collisionCheckTempBox = new THREE.Box3();
const playerCollisionBox = new THREE.Box3(); 
const minotaurCollisionBox = new THREE.Box3(); 

// Variables de trampas y Minotauro (gestionadas en game_objects.js pero declaradas aquí para accesibilidad global)
let pitTrapObjects = [];
let fallingBlockTrapObjects = [];
let spikeTrapObjects = [];
let playerFallingIntoPit = null; // Indica si el jugador está cayendo en un foso

let minotaurEnemy = null; 
let minotaurModelGLB = null; 
let minotaurInitialGridPos = null;
let minotaurState = 'patrolling';
let minotaurTargetCell = null;
let minotaurLastSawPlayerTime = 0;
let minotaurPatrolNextTargetTime = 0;
const minotaurRaycaster = new THREE.Raycaster();
const minotaurToPlayerVec = new THREE.Vector3();
const minotaurForwardVec = new THREE.Vector3();
let minotaurTorches = [];
let minotaurCollisionCylinder = null; 

let doorObjects = []; // Almacenar objetos de puerta
let movingPlatforms = []; // Array para las plataformas móviles

// Modelo del jugador y animaciones
let playerModel = null; 
let playerAnimations = [];
let playerMixer = null;
let idleAction = null, walkAction = null, runAction = null;
let currentAction = null;

// Partículas de humo (para la antorcha del jugador)
let smokeParticles = [];
let smokeParticleGeometry, smokeParticleMaterial;
let timeSinceLastSmokeSpawn = 0;
const smokeSpawnPosition = new THREE.Vector3(); 

// Variables de visibilidad del minimapa
let visibilityMaze = [];


/**
 * Inicializa la escena de Three.js y el juego.
 * @param {object} customMazeData - Datos del laberinto a cargar.
 */
function init(customMazeData) {
    if (!customMazeData) {
        console.error("Error: init() fue llamado sin customMazeData. Regresando a selección de mapas.");
        if (loadingScreenElement) loadingScreenElement.style.display = 'none';
        window.showCustomGameUI(); // Llamada a función en ui_and_data.js
        return;
    }

    // Limpiar escena anterior
    cleanUpScene(); 

    // Inicializar Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.Fog(0x050508, 10, 35);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;
        containerDiv.appendChild(renderer.domElement);

        if (isTouchDevice) {
            window.setupTouchControls(); // Llamada a función en ui_and_data.js
        } else {
            window.setupKeyboardAndMouseControls(); // Llamada a función en ui_and_data.js
        }
    }

    clock = new THREE.Clock();
    const ambientLight = new THREE.AmbientLight(0x404040, 0.15);
    scene.add(ambientLight);

    // Configurar minimapa
    minimapCanvas.width = minimapWidth;
    minimapCanvas.height = minimapHeight;
    minimapCtx = minimapCanvas.getContext('2d');
    if (!minimapCtx) { console.error("No se pudo obtener el contexto 2D del minimapa."); }

    console.log("Iniciando con laberinto personalizado/predeterminado:", customMazeData.name || customMazeData.fileName);
    maze = JSON.parse(JSON.stringify(customMazeData.grid));
    currentMazeLayout = JSON.parse(JSON.stringify(maze)); // Copia mutable para trampas, etc.
    currentMazeWidth = customMazeData.width;
    currentMazeHeight = customMazeData.height;
    currentPlayingScenarioData = JSON.parse(JSON.stringify(customMazeData)); 
    
    // Inicializar mapa de visibilidad del minimapa
    visibilityMaze = [];
    for (let z = 0; z < currentMazeHeight; z++) {
        visibilityMaze[z] = [];
        for (let x = 0; x < currentMazeWidth; x++) {
            visibilityMaze[z][x] = false;
        }
    }

    // Geometría y material de partículas de humo
    if (!smokeParticleGeometry) {
        smokeParticleGeometry = new THREE.SphereGeometry(SMOKE_PARTICLE_START_SIZE, 6, 4);
    }
    if (!smokeParticleMaterial) { 
        smokeParticleMaterial = new THREE.MeshBasicMaterial({
            color: SMOKE_PARTICLE_COLOR,
            transparent: true,
            opacity: SMOKE_PARTICLE_START_OPACITY,
            depthWrite: false,
            blending: THREE.NormalBlending 
        });
    }

    // Construir la geometría del laberinto (definida en game_objects.js)
    window.buildMazeGeometry(currentMazeWidth, currentMazeHeight, currentMazeLayout);

    // Configurar jugador
    let modelInstance = null;
    if (playerModel) {
        modelInstance = playerModel.clone(); 

        const box = new THREE.Box3().setFromObject(modelInstance);
        const modelSize = new THREE.Vector3();
        box.getSize(modelSize);

        if (modelSize.y > 0) { 
            const scaleFactor = PLAYER_HEIGHT / modelSize.y;
            modelInstance.scale.set(scaleFactor, scaleFactor, scaleFactor);
            modelInstance.position.y = 0; 
        } else {
            console.warn("Player model has zero height. Scaling may be incorrect.");
        }

        player = new THREE.Group(); 
        player.add(modelInstance);  

        if (playerAnimations && playerAnimations.length > 0) {
            playerMixer = new THREE.AnimationMixer(modelInstance);
            const findAnim = (names) => {
                for (const name of names) {
                    const clip = THREE.AnimationUtils.findByName(playerAnimations, name);
                    if (clip) return playerMixer.clipAction(clip);
                }
                return null;
            };
            idleAction = findAnim(['Idle', 'idle', 'Armature|Idle', 'CharacterArmature|Idle', 'metarig|Idle', 'Idle_Sword']);
            walkAction = findAnim(['Walk', 'walk', 'Walking', 'walk_forward', 'Armature|Walk', 'CharacterArmature|Walk', 'metarig|Walk', 'WalkForward', 'Walk_Sword']);
            runAction = findAnim(['Run', 'run', 'Running', 'run_forward', 'Armature|Run', 'CharacterArmature|Run', 'metarig|Run', 'RunForward', 'Run_Sword']);

            if (!idleAction && playerAnimations.length > 0) {
                console.warn("Could not find a specifically named 'Idle' animation. Using first available animation as idle:", playerAnimations[0].name);
                idleAction = playerMixer.clipAction(playerAnimations[0]);
            }
            
            if (idleAction) {
                idleAction.play();
                currentAction = idleAction; 
            } else {
                console.warn("No idle animation found or usable for player.");
            }
            if (!walkAction) console.warn("No walk animation found for player (tried common names).");
            if (!runAction) console.warn("No run animation found for player (tried common names).");
        } else {
             console.warn("Player model loaded, but no animations found in the GLB.");
        }

    } else {
        console.warn("Player model not loaded, falling back to cylinder.");
        const playerGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.6 });
        player = new THREE.Mesh(playerGeometry, playerMaterial); 
        player.castShadow = true; 
    }
    player.rotation.order = 'YXZ'; 

    // Encontrar posición inicial del jugador
    const startPos = window.findCell(5, maze, currentMazeWidth, currentMazeHeight);
    if (startPos) {
        initialPlayerPosition.set(
            (startPos.x - currentMazeWidth / 2 + 0.5) * CELL_SIZE,
            PLAYER_HEIGHT / 2 + 0.01, 
            (startPos.z - currentMazeHeight / 2 + 0.5) * CELL_SIZE
        );
    } else {
        console.warn("No se encontró celda de inicio (5) en el laberinto. Colocando en el centro del primer camino disponible o (0,0).");
        let fallbackStart = window.findCell(1, maze, currentMazeWidth, currentMazeHeight);
        if (!fallbackStart) fallbackStart = {x: Math.floor(currentMazeWidth/2), z: Math.floor(currentMazeHeight/2)};
         if (!maze[fallbackStart.z] || maze[fallbackStart.z][fallbackStart.x] === 0) { 
             fallbackStart = {x:1,z:1}; 
        }
        initialPlayerPosition.set(
            (fallbackStart.x - currentMazeWidth / 2 + 0.5) * CELL_SIZE,
            PLAYER_HEIGHT / 2 + 0.01,
            (fallbackStart.z - currentMazeHeight / 2 + 0.5) * CELL_SIZE
        );
    }
    player.position.copy(initialPlayerPosition);
    playerVelocity.set(0,0,0);
    playerOnGround = true;
    scene.add(player);

    // Configurar luz y llama de la antorcha del jugador
    spearLightAndFlameGroup = new THREE.Group();
    spearLight = new THREE.PointLight(TORCH_COLOR, SPEAR_LIGHT_INTENSITY, SPEAR_LIGHT_DISTANCE, SPEAR_LIGHT_DECAY);
    spearLight.castShadow = true; 
    spearLight.shadow.mapSize.width = 512; // Increased shadow map size for quality
    spearLight.shadow.mapSize.height = 512;
    spearLight.shadow.camera.near = 0.1;
    spearLight.shadow.camera.far = SPEAR_LIGHT_DISTANCE;
    spearLight.userData.baseIntensity = SPEAR_LIGHT_INTENSITY;
    spearLight.userData.originalDistance = SPEAR_LIGHT_DISTANCE; 
    spearLightAndFlameGroup.add(spearLight);

    const spearFlameMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd080, 
        transparent: true,
        opacity: FLAME_BASE_OPACITY * 0.9, 
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const spearFlameGeometry = new THREE.ConeGeometry(SPEAR_FLAME_SIZE * 0.6, SPEAR_FLAME_SIZE * 2.2, 8);
    spearFlameGeometry.translate(0, SPEAR_FLAME_SIZE * 1.1, 0); 
    spearFlameMesh = new THREE.Mesh(spearFlameGeometry, spearFlameMaterial);
    spearLightAndFlameGroup.add(spearFlameMesh);

    // Adjuntar la antorcha al modelo del jugador (si existe un hueso de lanza)
    if (modelInstance) { 
        let spearNode = null;
        modelInstance.traverse((node) => {
            if (node.name.toLowerCase() === "spear" && (node.isObject3D || node.isBone)) { 
                spearNode = node;
            }
        });

        if (spearNode) {
            console.log("Attaching spear light to Spear node:", spearNode.name);
            originalSpearParent = spearNode; // Store the parent
            spearNode.add(spearLightAndFlameGroup);
            spearLightAndFlameGroup.position.set(0, 0.1, -1.5); // Original position relative to spearNode
            spearLightAndFlameGroup.rotation.x = Math.PI / 18; // Original rotation relative to spearNode
        } else {
            console.warn("Spear node not found. Attaching light to player's root. Adjust fallback position.");
            originalSpearParent = modelInstance; // Store the parent
            modelInstance.add(spearLightAndFlameGroup);
            spearLightAndFlameGroup.position.set(PLAYER_RADIUS * -0.3, PLAYER_HEIGHT * 0.4, PLAYER_RADIUS * 0.8); // Original position relative to player model
            spearLightAndFlameGroup.rotation.set(0, 0, 0); // Default rotation if no spearNode found
        }
    } else { 
        originalSpearParent = player; // Store the parent
        player.add(spearLightAndFlameGroup);
        spearLightAndFlameGroup.position.set(PLAYER_RADIUS * -0.3, PLAYER_HEIGHT * 0.4, PLAYER_RADIUS * 0.8); // Original position relative to player
        spearLightAndFlameGroup.rotation.set(0, 0, 0); // Default rotation
    }
    // Almacenar posición y rotación local originales después de la configuración inicial
    originalSpearLocalPos.copy(spearLightAndFlameGroup.position);
    originalSpearLocalRot.copy(spearLightAndFlameGroup.rotation);


    // Techo
    const ceilingSize = Math.max(currentMazeWidth, currentMazeHeight) * CELL_SIZE * 1.2;
    const ceilingGeometry = new THREE.PlaneGeometry(ceilingSize, ceilingSize);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide, roughness: 0.9 });
    if (ceilingTexture) {
        ceilingMat.map = ceilingTexture.clone();
        ceilingMat.map.needsUpdate = true;
        ceilingMat.color.set(0xffffff);
        ceilingMat.map.repeat.set(ceilingSize / (CELL_SIZE * 2), ceilingSize / (CELL_SIZE * 2));
    }
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMat);
    ceiling.position.y = WALL_HEIGHT + 0.1; ceiling.rotation.x = Math.PI / 2; ceiling.receiveShadow = true; ceiling.userData = { isCeiling: true, originalOpacity: 1.0, isTransparentCapable: true }; scene.add(ceiling); collidableObjects.push(ceiling);

    // Ajustar renderizador y cámara al tamaño de la ventana
    window.updateRendererAndCameraSize();

    // Asegurar que la vista inicial sea TPS y la antorcha proyecte sombras
    isFirstPersonView = false;
    player.visible = true; 
    spearLight.castShadow = true;
    
    cameraPhi = Math.PI / 3;
    cameraTheta = 0;
    window.updateCamera(); 
    gameActive = true; 
    if (!animationFrameId) {
         window.animate(); // Iniciar el bucle de animación
    }
}


/**
 * Bucle de animación principal del juego.
 */
function animate() {
    // Si el juego no está activo y no hay tweens o el jugador no está cayendo, detener la animación.
    if (!gameActive && TWEEN.getAll().length === 0 && playerFallingIntoPit === null) { 
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }
    animationFrameId = requestAnimationFrame(animate);

    const deltaTime = Math.min(0.05, clock.getDelta()); // Limitar el delta para evitar saltos grandes

    TWEEN.update(); // Actualizar las animaciones de Tween.js

    // Actualizar jugador y minotauro solo si el juego está activo o el jugador está cayendo
    if (gameActive || playerFallingIntoPit !== null) { 
        if (playerMixer) {
            playerMixer.update(deltaTime); // Actualizar animaciones del jugador
        }
        updatePlayer(deltaTime); // Actualizar lógica del jugador
        if (minotaurEnemy) window.updateMinotaur(deltaTime); // Actualizar lógica del minotauro (definido en game_objects.js)

        // Actualizar plataformas móviles (definido en game_objects.js)
        for (const platformData of movingPlatforms) {
            const mesh = platformData.mesh;
            const direction = platformData.direction;
            const speed = platformData.speed;

            mesh.position.x += direction.x * speed * deltaTime;
            mesh.position.z += direction.z * speed * deltaTime;

            // Rebotar en los límites X
            if (mesh.position.x - platformData.platformWidth / 2 < platformData.minXBound) {
                mesh.position.x = platformData.minXBound + platformData.platformWidth / 2;
                direction.x *= -1;
            } else if (mesh.position.x + platformData.platformWidth / 2 > platformData.maxXBound) {
                mesh.position.x = platformData.maxXBound - platformData.platformWidth / 2;
                direction.x *= -1;
            }

            // Rebotar en los límites Z
            if (mesh.position.z - platformData.platformDepth / 2 < platformData.minZBound) {
                mesh.position.z = platformData.minZBound + platformData.platformDepth / 2;
                direction.z *= -1;
            } else if (mesh.position.z + platformData.platformDepth / 2 > platformData.maxZBound) {
                mesh.position.z = platformData.maxZBound - platformData.platformDepth / 2;
                direction.z *= -1;
            }
        }
    }

    // Actualizar luces y partículas (flicker) si el juego está activo o hay animaciones en curso
    if (gameActive || TWEEN.getAll().length > 0) { 
        const flicker = (Math.random() - 0.5) * TORCH_FLICKER_AMOUNT;
        if (spearLight && spearLight.userData.baseIntensity) { 
             spearLight.intensity = Math.max(0, spearLight.userData.baseIntensity + flicker * 1.2);
        }

        if (spearFlameMesh && spearFlameMesh.material) { 
            const pVO = (Math.random()-0.5)*FLAME_OPACITY_VAR * 1.1; 
            const pVS = (Math.random()-0.5)*FLAME_SCALE_Y_VAR * 1.1; 
            spearFlameMesh.material.opacity = Math.max(0.2,Math.min(1.0, FLAME_BASE_OPACITY + pVO)); 
            const scaleMultiplier = Math.max(0.3, 1.0 + pVS);
            spearFlameMesh.scale.set(scaleMultiplier * 0.7, scaleMultiplier, scaleMultiplier*0.7); 
        }

        for (const torch of staticTorches) { 
            const sLF = (Math.random()-0.5)*TORCH_FLICKER_AMOUNT*1.1; 
            const vO = (Math.random()-0.5)*FLAME_OPACITY_VAR; 
            const vS = (Math.random()-0.5)*FLAME_SCALE_Y_VAR; 
            if (torch.light?.userData.baseIntensity) { 
                torch.light.intensity = Math.max(0, torch.light.userData.baseIntensity + sLF); 
            } 
            if (torch.flameMesh?.material) { 
                torch.flameMesh.material.opacity = Math.max(0.1,Math.min(1.0,FLAME_BASE_OPACITY+vO)); 
                torch.flameMesh.scale.y = Math.max(0.1,FLAME_BASE_SCALE_Y+vS); 
                torch.flameMesh.scale.x = torch.flameMesh.scale.z = Math.max(0.1,FLAME_BASE_SCALE_Y*0.8 + vS * 0.5); 
            } 
        }
        // Actualizar antorchas del Minotauro
        for (const mTorch of minotaurTorches) {
            const mFlicker = (Math.random() - 0.5) * TORCH_FLICKER_AMOUNT * 0.9;
            mTorch.light.intensity = Math.max(0, MINOTAUR_TORCH_LIGHT_INTENSITY + mFlicker);
            
            const mVO = (Math.random() - 0.5) * FLAME_OPACITY_VAR * 0.8;
            const mVS = (Math.random() - 0.5) * FLAME_SCALE_Y_VAR * 0.8;
            mTorch.flameMesh.material.opacity = Math.max(0.2, Math.min(1.0, FLAME_BASE_OPACITY * 0.8 + mVO));
            mTorch.flameMesh.scale.y = Math.max(0.3, 1.0 + mVS);
            mTorch.flameMesh.scale.x = mTorch.flameMesh.scale.z = Math.max(0.3, (1.0 + mVS) * 0.7);
        }

        // Actualizar lava
        for (const lavaCell of lavaCells) {
            if (lavaCell.mesh.material.map) {
                lavaCell.mesh.material.map.offset.x += LAVA_FLOW_SPEED_U;
                lavaCell.mesh.material.map.offset.y += LAVA_FLOW_SPEED_V;
                if (lavaCell.mesh.material.map.offset.x > 1) lavaCell.mesh.material.map.offset.x -= 1;
                if (lavaCell.mesh.material.map.offset.y > 1) lavaCell.mesh.material.map.offset.y -= 1;
            }
            if (lavaCell.light) {
                lavaCell.light.intensity = Math.max(0, lavaCell.light.userData.baseIntensity + (Math.random() - 0.5) * TORCH_FLICKER_AMOUNT * 0.3);
            }
        }

        window.updateSmokeParticles(deltaTime); // Actualizar partículas de humo (definido en game_objects.js)
    }

    window.updateCamera(); // Actualizar posición y orientación de la cámara
    window.updateVisibility(); // Actualizar visibilidad del minimapa (definido en ui_and_data.js)
    window.drawMinimap(); // Dibujar minimapa (definido en ui_and_data.js)

    if(renderer && scene && camera) renderer.render(scene, camera); // Renderizar la escena
}

/**
 * Actualiza la lógica del jugador (movimiento, colisiones).
 * @param {number} deltaTime - Tiempo transcurrido desde el último frame en segundos.
 */
function updatePlayer(deltaTime) {
    if (!gameActive || !player) return;
    if (!isTouchDevice) { window.updateMovementFromKeyboard(); } // Actualizar movimiento por teclado (desde ui_and_data.js)

    let currentSpeed = PLAYER_SPEED;
    let isSprinting = (!isTouchDevice && keyStates['ShiftLeft'] && moveForward > 0);
    if (playerOnGround && !playerFallingIntoPit && ( (moveForward > SPRINT_THRESHOLD && joystickPointerId !== -1) || isSprinting) ) {
        currentSpeed = SPRINT_SPEED;
    }

    let dampingFactor = playerOnGround ? 0.85 : 0.98;
    if (!playerOnGround) playerVelocity.y += GRAVITY * deltaTime;
    playerVelocity.y = Math.max(playerVelocity.y, -30); // Limitar velocidad de caída

    const previousY = player.position.y;

    // Lógica de muerte por caída en foso (solo si está cayendo)
    if (playerFallingIntoPit) {
        if (player.position.y + playerVelocity.y * deltaTime < PIT_FALL_DEPTH) { // Predecir la posición Y para la muerte
            window.loseGame("Caíste en un foso!"); // Llamada a función en ui_and_data.js
            return; 
        }
    } else {
        // Lógica de muerte por pinchos (solo si no está cayendo en foso)
        const currentPlayerGridX = Math.floor((player.position.x / CELL_SIZE) + (currentMazeWidth / 2));
        const currentPlayerGridZ = Math.floor((player.position.z / CELL_SIZE) + (currentMazeHeight / 2));

        for (const trap of spikeTrapObjects) {
            if (trap.state === 'risen' && trap.damageReadyTime > clock.elapsedTime * 1000 && // Si los pinchos están levantados y activos para dañar
                currentPlayerGridX === trap.triggerCellX && currentPlayerGridZ === trap.triggerCellZ) {
                window.loseGame("¡Ensartado por pinchos!"); // Llamada a función en ui_and_data.js
                return; 
            }
        }
    }

    // Calcular velocidad deseada en XZ
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(player.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(player.quaternion);
    right.y = 0;
    right.normalize();

    const targetVelocityXZ = new THREE.Vector3();
    targetVelocityXZ.addScaledVector(forward, -moveForward * currentSpeed);
    targetVelocityXZ.addScaledVector(right,   -moveRight * currentSpeed);

    // Aplicar suavizado a la velocidad
    playerVelocity.x += (targetVelocityXZ.x - playerVelocity.x) * 0.25;
    playerVelocity.z += (targetVelocityXZ.z - playerVelocity.z) * 0.25;
    
    playerVelocity.x *= dampingFactor;
    playerVelocity.z *= dampingFactor;

    // Actualizar animaciones del modelo del jugador
    let isMoving = Math.abs(moveForward) > 0.01 || Math.abs(moveRight) > 0.01 || Math.abs(playerVelocity.x) > 0.05 || Math.abs(playerVelocity.z) > 0.05;
    let isSprintingEffective = (currentSpeed === SPRINT_SPEED && isMoving && playerOnGround);

    if (playerMixer) {
        let actionToPlay = idleAction;
        if (playerFallingIntoPit) { 
            actionToPlay = idleAction; 
        } else if (isSprintingEffective && runAction) {
            actionToPlay = runAction;
        } else if (isMoving && playerOnGround && walkAction) {
            actionToPlay = walkAction;
        } else if (!playerOnGround && idleAction) { 
            actionToPlay = idleAction; 
        }

        if (actionToPlay && actionToPlay !== currentAction) {
            if (currentAction) {
                currentAction.fadeOut(0.2);
            }
            actionToPlay.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.2).play();
            currentAction = actionToPlay;
        } else if (!currentAction && idleAction) { 
            idleAction.reset().play();
            currentAction = idleAction;
        }
    }

    // Calcular el desplazamiento en este frame
    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerOnGround = false; // Se establecerá a true si hay colisión con el suelo

    const collisionSizeVec = new THREE.Vector3(PLAYER_RADIUS * 2, PLAYER_HEIGHT, PLAYER_RADIUS * 2);

    // Colisión vertical con objetos (incluyendo plataformas móviles)
    const verticalCheckCenter = player.position.clone().add(new THREE.Vector3(0, deltaPosition.y, 0));
    collisionCheckTempBox.setFromCenterAndSize(verticalCheckCenter, collisionSizeVec);

    let playerOnMovingPlatform = false;
    for (const platformData of movingPlatforms) {
        const platformMesh = platformData.mesh;
        const playerFeetY = player.position.y - PLAYER_HEIGHT / 2;
        const platformTopY = platformMesh.position.y + MOVING_PLATFORM_HEIGHT / 2;

        // Verificar superposición horizontal (2D)
        const playerRect = {
            minX: player.position.x - PLAYER_RADIUS, maxX: player.position.x + PLAYER_RADIUS,
            minZ: player.position.z - PLAYER_RADIUS, maxZ: player.position.z + PLAYER_RADIUS
        };
        const platformRect = {
            minX: platformMesh.position.x - platformData.platformWidth / 2, maxX: platformMesh.position.x + platformData.platformWidth / 2,
            minZ: platformMesh.position.z - platformData.platformDepth / 2, maxZ: platformMesh.position.z + platformData.platformDepth / 2
        };

        const horizontalOverlap = !(playerRect.maxX < platformRect.minX || playerRect.minX > platformRect.maxX ||
                                    playerRect.maxZ < platformRect.minZ || playerRect.minZ > platformRect.maxZ);

        // Si el jugador está cayendo o en el suelo, y hay superposición horizontal
        if (horizontalOverlap && playerVelocity.y <= 0 && playerFeetY <= platformTopY + 0.05) { 
            playerOnGround = true;
            playerOnMovingPlatform = true;
            playerVelocity.y = 0; // Detener movimiento vertical
            player.position.y = platformTopY + PLAYER_HEIGHT / 2; // Ajustar jugador a la parte superior de la plataforma

            // Mover al jugador horizontalmente con la plataforma
            player.position.x += platformData.direction.x * platformData.speed * deltaTime;
            player.position.z += platformData.direction.z * platformData.speed * deltaTime;

            // Verificar si el jugador se cae de la celda de la plataforma después de moverse
            const playerCellX = Math.floor((player.position.x / CELL_SIZE) + (currentMazeWidth / 2));
            const playerCellZ = Math.floor((player.position.z / CELL_SIZE) + (currentMazeHeight / 2));
            if (playerCellX !== platformData.gridX || playerCellZ !== platformData.gridZ) {
                // El jugador se movió fuera de la celda de la plataforma, tratar como caída al foso
                window.loseGame("¡Caíste en un foso!"); // Llamada a función en ui_and_data.js
                return; 
            }
            break; 
        }
    }


    for (const obj of collidableObjects) {
        if (obj.userData.isFloorTile || obj.userData.isCeiling || obj === minotaurCollisionCylinder || obj.userData.isMovingPlatform) continue; 
        if (obj.userData.isPitTrapCover && !obj.userData.isCollidable) continue;
        if (obj.userData.isFallingBlock && obj.userData.state !== 'landed') continue; 
        if (obj.userData.isDoor && (obj.userData.state === 'open' || obj.userData.state === 'opening')) continue;

        const oB = new THREE.Box3().setFromObject(obj);
        if (collisionCheckTempBox.intersectsBox(oB)) {
            if (deltaPosition.y < 0 && collisionCheckTempBox.min.y < oB.max.y) { // Cayendo sobre el objeto
                playerVelocity.y = 0;
                deltaPosition.y = oB.max.y - (player.position.y - PLAYER_HEIGHT / 2) + 0.001;
                playerOnGround = true;
            } else if (deltaPosition.y > 0 && collisionCheckTempBox.max.y > oB.min.y) { // Saltando hacia el objeto desde abajo
                playerVelocity.y = 0;
                deltaPosition.y = oB.min.y - (player.position.y + PLAYER_HEIGHT / 2) - 0.001;
            }
            break; 
        }
    }

    // Verificación genérica del suelo y la interacción con la lava
    const playerGridXForGroundCheck = Math.floor((player.position.x / CELL_SIZE) + (currentMazeWidth / 2));
    const playerGridZForGroundCheck = Math.floor((player.position.z / CELL_SIZE) + (currentMazeHeight / 2));
    let isOverLavaCell = false;
    if (playerGridXForGroundCheck >= 0 && playerGridXForGroundCheck < currentMazeWidth &&
        playerGridZForGroundCheck >= 0 && playerGridZForGroundCheck < currentMazeHeight &&
        currentMazeLayout[playerGridZForGroundCheck] && currentMazeLayout[playerGridZForGroundCheck][playerGridXForGroundCheck] === LAVA_CELL_TYPE) {
        isOverLavaCell = true;
    }
    
    const groundY = 0; 
    const feetY = player.position.y + deltaPosition.y - PLAYER_HEIGHT / 2;

    if (playerFallingIntoPit) {
        // La comprobación de muerte por caída ya se hizo al principio de updatePlayer
    } else if (!playerOnMovingPlatform) { // Solo aplicar esto si el jugador NO está en una plataforma móvil
        if (isOverLavaCell) {
            // Sobre lava: el ajuste normal al suelo (y=0) se omite. La gravedad seguirá actuando.
            // playerOnGround permanecerá falso a menos que se golpee un objeto colisionable específico (que no sea la superficie de lava).
        } else {
            // Colisión normal con el suelo para celdas que no son de lava (si no está ya en el suelo por colisión de objeto)
            if (feetY <= groundY && playerVelocity.y <= 0 && !playerOnGround) {
                playerVelocity.y = 0;
                deltaPosition.y = groundY - (player.position.y - PLAYER_HEIGHT / 2);
                playerOnGround = true;
            }
        }
    }
    player.position.y += deltaPosition.y; 


    // Colisión Horizontal
    if (!playerFallingIntoPit && gameActive) { 
        const horizontalCheckPos = player.position.clone().add(new THREE.Vector3(deltaPosition.x, 0, deltaPosition.z));
        collisionCheckTempBox.setFromCenterAndSize(horizontalCheckPos, collisionSizeVec);

        let collisionX = false; let collisionZ = false;
        for (const obj of collidableObjects) {
            if (obj.userData.isFloorTile || obj.userData.isCeiling || obj === minotaurCollisionCylinder || obj.userData.isMovingPlatform) continue; 
            if (obj.userData.isPitTrapCover && !obj.userData.isCollidable) continue;
            if (obj.userData.isFallingBlock && obj.userData.state !== 'landed') continue; 
            if (obj.userData.isDoor && (obj.userData.state === 'open' || obj.userData.state === 'opening')) continue;

            const oB = new THREE.Box3().setFromObject(obj);

            // Comprobar colisión en X
            const tempBoxX = new THREE.Box3().setFromCenterAndSize(player.position.clone().add(new THREE.Vector3(deltaPosition.x, 0, 0)), collisionSizeVec);
            if (tempBoxX.intersectsBox(oB)) {
                // Permite al jugador subir un pequeño escalón
                if (oB.max.y > player.position.y - PLAYER_HEIGHT/2 && oB.max.y < player.position.y - PLAYER_HEIGHT/2 + PLAYER_STEP_HEIGHT && playerOnGround && deltaPosition.x !== 0) {
                    const stepUpAmount = oB.max.y - (player.position.y - PLAYER_HEIGHT/2) + 0.01;
                    player.position.y += stepUpAmount; // Subir
                } else {
                    collisionX = true;
                }
            }
            // Comprobar colisión en Z
            const tempBoxZ = new THREE.Box3().setFromCenterAndSize(player.position.clone().add(new THREE.Vector3(0, 0, deltaPosition.z)), collisionSizeVec);
            if (tempBoxZ.intersectsBox(oB)) {
                 // Permite al jugador subir un pequeño escalón
                 if (oB.max.y > player.position.y - PLAYER_HEIGHT/2 && oB.max.y < player.position.y - PLAYER_HEIGHT/2 + PLAYER_STEP_HEIGHT && playerOnGround && deltaPosition.z !== 0) {
                    const stepUpAmount = oB.max.y - (player.position.y - PLAYER_HEIGHT/2) + 0.01;
                    player.position.y += stepUpAmount; // Subir
                } else {
                    collisionZ = true;
                }
            }
            if (collisionX && collisionZ) break;
        }
        if(collisionX) { playerVelocity.x = 0; deltaPosition.x = 0; }
        if(collisionZ) { playerVelocity.z = 0; deltaPosition.z = 0; }
    }

    player.position.x += deltaPosition.x;
    player.position.z += deltaPosition.z;

    // Comprobación de muerte por lava (después de todas las actualizaciones de posición para el frame)
    if (!playerFallingIntoPit && gameActive) {
        const finalPlayerGridX = Math.floor((player.position.x / CELL_SIZE) + (currentMazeWidth / 2));
        const finalPlayerGridZ = Math.floor((player.position.z / CELL_SIZE) + (currentMazeHeight / 2));

        if (finalPlayerGridX >= 0 && finalPlayerGridX < currentMazeWidth &&
            finalPlayerGridZ >= 0 && finalPlayerGridZ < currentMazeHeight &&
            currentMazeLayout[finalPlayerGridZ] && currentMazeLayout[finalPlayerGridZ][finalPlayerGridX] === LAVA_CELL_TYPE) {
            
            if ((player.position.y - (PLAYER_HEIGHT / 2)) < (LAVA_SURFACE_OFFSET_Y + 0.05)) { // Pies en/por debajo de la superficie de la lava
                window.loseGame("¡Quemado por la lava!"); // Llamada a función en ui_and_data.js
                return; 
            }
        } else if (currentMazeLayout[finalPlayerGridZ] && currentMazeLayout[finalPlayerGridZ][finalPlayerGridX] === MOVING_PLATFORM_CELL_TYPE && !playerOnMovingPlatform) {
             // El jugador cayó en la sección del foso de una celda de plataforma móvil
             if ((player.position.y - (PLAYER_HEIGHT / 2)) < (PIT_FALL_DEPTH + 1.0)) { // Comprobar si ha caído lo suficientemente profundo
                window.loseGame("¡Caíste en un foso!"); // Llamada a función en ui_and_data.js
                return; 
             }
        }
    }

    // La rotación del jugador sigue la dirección de la cámara
    player.rotation.y = cameraTheta + Math.PI;

    // Activación de trampas y zonas de fin (definido en game_objects.js) y interacción con puertas
    if (!playerFallingIntoPit && gameActive) { 
        for (const trap of pitTrapObjects) {
            if (trap.state === 'intact') {
                const distSq = player.position.clone().setY(0).distanceToSquared(new THREE.Vector3(trap.worldX, 0, trap.worldZ));
                if (playerOnGround && distSq < PIT_TRAP_TRIGGER_RADIUS_SQUARED && Math.abs(player.position.y - PLAYER_HEIGHT / 2) < PLAYER_STEP_HEIGHT + 0.01) {
                    window.triggerPitTrap(trap); // Llamada a función en game_objects.js
                }
            }
        }
        for (const trap of fallingBlockTrapObjects) {
            if (trap.state === 'armed') {
                const playerGridX = Math.round(player.position.x / CELL_SIZE + currentMazeWidth / 2 - 0.5);
                const playerGridZ = Math.round(player.position.z / CELL_SIZE + currentMazeHeight / 2 - 0.5);
                if (playerGridX === trap.triggerCellX && playerGridZ === trap.triggerCellZ && playerOnGround) {
                    window.triggerFallingBlockTrap(trap); // Llamada a función en game_objects.js
                }
            } else if (trap.state === 'falling') {
                const fallSpeed = WALL_HEIGHT * 3 * deltaTime;
                trap.blockMesh.position.y -= fallSpeed; 
                
                const playerBox = new THREE.Box3().setFromCenterAndSize(player.position, new THREE.Vector3(PLAYER_RADIUS*2, PLAYER_HEIGHT, PLAYER_RADIUS*2));
                const blockGroupBBox = new THREE.Box3().setFromObject(trap.blockMesh); 

                if (playerBox.intersectsBox(blockGroupBBox)) {
                    let hitRock = false;
                    for(const rock of trap.blockMesh.children) {
                        const rockBBoxWorld = new THREE.Box3().setFromObject(rock);
                        if (playerBox.intersectsBox(rockBBoxWorld)) {
                            hitRock = true;
                            break;
                        }
                    }
                    if (hitRock) {
                        window.loseGame("¡Aplastado por rocas!"); // Llamada a función en ui_and_data.js
                        trap.state = 'landed';
                        trap.blockMesh.position.y = (WALL_HEIGHT * 0.35) / 2; 
                        if (!collidableObjects.includes(trap.blockMesh)) collidableObjects.push(trap.blockMesh);
                        return; 
                    }
                }
                if (trap.blockMesh.position.y <= (WALL_HEIGHT * 0.35) / 2) { 
                    trap.blockMesh.position.y = (WALL_HEIGHT * 0.35) / 2;
                    trap.state = 'landed';
                    if (!collidableObjects.includes(trap.blockMesh)) collidableObjects.push(trap.blockMesh);
                }
            }
        }
        for (const trap of spikeTrapObjects) {
             if (trap.state === 'hidden') {
                const playerGridX = Math.round(player.position.x / CELL_SIZE + currentMazeWidth / 2 - 0.5);
                const playerGridZ = Math.round(player.position.z / CELL_SIZE + currentMazeHeight / 2 - 0.5);
                if (playerGridX === trap.triggerCellX && playerGridZ === trap.triggerCellZ && playerOnGround) {
                    window.triggerSpikeTrap(trap); // Llamada a función en game_objects.js
                }
            }
        }

        // Interacción con puertas
        for (const door of doorObjects) {
            if (door.userData.state === 'closed' || door.userData.state === 'closing') {
                const playerXZ = new THREE.Vector2(player.position.x, player.position.z);
                const doorXZ = new THREE.Vector2(door.position.x, door.position.z);
                const dist = playerXZ.distanceTo(doorXZ);
                if (dist < DOOR_TRIGGER_RADIUS) {
                    window.handleDoorInteraction(door); // Llamada a función en game_objects.js
                }
            }
        }
    }

    // Comprobación de la zona de fin
    if (endZones.length > 0 && gameActive && !playerFallingIntoPit) { 
        for (const currentEndZone of endZones) {
            const pXZ = new THREE.Vector2(player.position.x, player.position.z);
            const eZXZ = new THREE.Vector2(currentEndZone.position.x, currentEndZone.position.z);
            if (playerOnGround && pXZ.distanceTo(eZXZ) < PLAYER_RADIUS + CELL_SIZE * 0.3) {
                window.winGame(currentEndZone.userData.behaviorType, currentEndZone.userData.gridX, currentEndZone.userData.gridZ); // Llamada a función en ui_and_data.js
                break; 
            }
        }
    }
}

/**
 * Actualiza la posición y orientación de la cámara.
 */
function updateCamera() {
    if (!player || !camera) return;

    if (isFirstPersonView) {
        // Vista en primera persona
        camera.position.copy(player.position);
        camera.position.y += PLAYER_HEIGHT * (FIRST_PERSON_EYE_HEIGHT_FACTOR - 0.5); 
        camera.rotation.order = 'YXZ';
        camera.rotation.y = cameraTheta;
        camera.rotation.x = cameraPhi - CAMERA_PITCH_OFFSET_FPS;
        camera.rotation.z = 0;
        camera.updateMatrixWorld(); 

        // Restaurar opacidad de objetos transparentes (no es necesario en primera persona)
        for (const obj of currentlyTransparentObjects) {
            if (obj.material && typeof obj.material.opacity !== 'undefined' && obj.userData.isTransparentCapable) {
                obj.material.transparent = false;
                obj.material.opacity = obj.userData.originalOpacity || 1.0;
            }
        }
        currentlyTransparentObjects.clear();
    } else { 
        // Vista en tercera persona
        const targetPosition = new THREE.Vector3();
        const offset = new THREE.Vector3();
        offset.x = CAMERA_DISTANCE * Math.sin(cameraPhi) * Math.sin(cameraTheta);
        offset.y = CAMERA_DISTANCE * Math.cos(cameraPhi) + CAMERA_HEIGHT_OFFSET;
        offset.z = CAMERA_DISTANCE * Math.sin(cameraPhi) * Math.cos(cameraTheta);

        targetPosition.copy(player.position).add(offset);

        // Raycasting para evitar que la cámara atraviese paredes
        const cameraRaycaster = new THREE.Raycaster();
        const rayOrigin = player.position.clone().add(new THREE.Vector3(0, PLAYER_HEIGHT * 0.3, 0)); 
        const directionToCamera = targetPosition.clone().sub(rayOrigin).normalize();
        const rayLength = rayOrigin.distanceTo(targetPosition);

        cameraRaycaster.set(rayOrigin, directionToCamera);
        cameraRaycaster.far = rayLength;

        // Filtrar objetos para la comprobación de la cámara (paredes, puertas cerradas, etc.)
        const cameraCheckObjects = collidableObjects.filter(obj =>
            obj !== player &&
            !obj.userData.isFloorTile && 
            obj.userData.isTransparentCapable &&
            !(obj.userData.isPitTrapCover && !obj.userData.isCollidable) &&
            !(obj.userData.isFallingBlock && obj.userData.state !== 'landed') && 
            !(obj.userData.isDoor && (obj.userData.state === 'open' || obj.userData.state === 'opening')) && // Puertas abiertas no bloquean
            !(obj.userData.isMovingPlatform) && // Plataformas móviles no bloquean la vista
            obj !== minotaurCollisionCylinder 
        );

        const intersects = cameraRaycaster.intersectObjects(cameraCheckObjects, false);

        let objectsToMakeTransparentThisFrame = new Set();
        for (const intersect of intersects) {
            if (intersect.object.userData.isTransparentCapable) {
                objectsToMakeTransparentThisFrame.add(intersect.object);
            }
        }

        // Restaurar opacidad de objetos que ya no bloquean la vista
        for (const obj of currentlyTransparentObjects) {
            if (!objectsToMakeTransparentThisFrame.has(obj)) {
                if (obj.material && typeof obj.material.opacity !== 'undefined' && obj.userData.isTransparentCapable) {
                    obj.material.transparent = false;
                    obj.material.opacity = obj.userData.originalOpacity || 1.0;
                }
            }
        }
        // Aplicar transparencia a objetos que ahora bloquean la vista
        for (const obj of objectsToMakeTransparentThisFrame) {
            if (obj.material && typeof obj.material.opacity !== 'undefined' && obj.userData.isTransparentCapable) {
                obj.material.transparent = true;
                obj.material.opacity = OBSTACLE_OPACITY;
            }
        }
        currentlyTransparentObjects = objectsToMakeTransparentThisFrame;

        // Ajustar posición final de la cámara si hay intersecciones
        let finalCameraPosition = targetPosition.clone();
        if (intersects.length > 0) {
            let closestDistance = rayLength;
            for (const intersect of intersects) {
                if (intersect.distance < closestDistance) {
                    closestDistance = intersect.distance;
                }
            }
            finalCameraPosition.copy(rayOrigin).addScaledVector(directionToCamera, Math.max(0.5, closestDistance - 0.3)); 
        }

        // Asegurar que la cámara no baje del suelo del laberinto
        finalCameraPosition.y = Math.max(finalCameraPosition.y, player.position.y + MIN_CAMERA_Y_ABOVE_GROUND); 
        camera.position.copy(finalCameraPosition);

        // La cámara mira al jugador
        const lookAtTarget = player.position.clone().add(new THREE.Vector3(0, PLAYER_HEIGHT * 0.3, 0)); 
        camera.lookAt(lookAtTarget);
    }
}

/**
 * Alterna entre la vista en primera y tercera persona.
 */
function toggleView() {
    if (!player || !camera || !scene || !spearLightAndFlameGroup) {
        console.warn("Toggle view called but essential objects (player, camera, scene, spearLightAndFlameGroup) are missing.");
        return;
    }

    isFirstPersonView = !isFirstPersonView;
    player.visible = !isFirstPersonView; // Ocultar/mostrar modelo del jugador

    if (isFirstPersonView) {
        // Mover antorcha a la cámara
        if (spearLightAndFlameGroup.parent) {
            spearLightAndFlameGroup.parent.remove(spearLightAndFlameGroup);
        }
        camera.add(spearLightAndFlameGroup);
        spearLightAndFlameGroup.position.copy(FPS_TORCH_LOCAL_POS);
        spearLightAndFlameGroup.rotation.copy(FPS_TORCH_LOCAL_ROT);
        
        // Ajustar luz y sombras para primera persona
        spearLight.intensity = SPEAR_LIGHT_INTENSITY * 1.5; // Un poco más brillante en FPS
        spearLight.castShadow = false; // Deshabilitar sombras en FPS para rendimiento
        spearLight.distance = SPEAR_LIGHT_DISTANCE;

        window.showMessage("Vista: Primera Persona", 1500); // Llamada a función en ui_and_data.js
    } else { // Vista en tercera persona
        // Mover antorcha de vuelta a su padre original
        if (spearLightAndFlameGroup.parent) {
            spearLightAndFlameGroup.parent.remove(spearLightAndFlameGroup);
        }
        if (originalSpearParent) {
            originalSpearParent.add(spearLightAndFlameGroup);
            spearLightAndFlameGroup.position.copy(originalSpearLocalPos);
            spearLightAndFlameGroup.rotation.copy(originalSpearLocalRot);
        } else {
            // Fallback si no se encontró el padre original
            player.add(spearLightAndFlameGroup);
            spearLightAndFlameGroup.position.set(PLAYER_RADIUS * -0.3, PLAYER_HEIGHT * 0.4, PLAYER_RADIUS * 0.8);
            spearLightAndFlameGroup.rotation.set(0, 0, 0); 
        }

        // Restaurar intensidad y sombras
        spearLight.intensity = SPEAR_LIGHT_INTENSITY;
        spearLight.castShadow = true; // Habilitar sombras en TPS
        spearLight.distance = SPEAR_LIGHT_DISTANCE;

        window.showMessage("Vista: Tercera Persona", 1500); // Llamada a función en ui_and_data.js
    }
    window.updateCamera(); // Recalcular posición/orientación de la cámara
}

/**
 * Ajusta el tamaño del renderizador y la cámara en función del tamaño de la ventana.
 */
function updateRendererAndCameraSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let maxDim = Math.max(width, height);
    let currentMaxRes = isTouchDevice ? MAX_RESOLUTION_DIMENSION_MOBILE : MAX_RESOLUTION_DIMENSION;

    const scaleFactor = maxDim > currentMaxRes ? currentMaxRes / maxDim : 1;
    const renderWidth = Math.floor(width * scaleFactor);
    const renderHeight = Math.floor(height * scaleFactor);

    if(renderer && camera) {
        renderer.setSize(renderWidth, renderHeight, false);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.aspect = renderWidth / renderHeight;
        camera.updateProjectionMatrix();
    }
}

/**
 * Limpia la escena de Three.js y resetea las listas de objetos.
 * Esto es crucial antes de cargar un nuevo laberinto.
 */
function cleanUpScene() {
    if (scene) {
        // Recorrer y eliminar todos los hijos de la escena
        while(scene.children.length > 0){
            const object = scene.children[0];
            // Disponer de geometría y materiales para liberar memoria
            if(object.geometry) object.geometry.dispose();
            if(object.material){
                if(Array.isArray(object.material)){
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            // Recorrer hijos anidados y disponer de sus recursos
            if (object.traverse) { 
                object.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
            scene.remove(object); // Eliminar el objeto de la escena
        }
    }
    // Resetear todas las listas de objetos del juego
    collidableObjects = [];
    interactiveObjects = [];
    staticTorches = [];
    lavaCells = []; 
    pitTrapObjects = [];
    fallingBlockTrapObjects = [];
    spikeTrapObjects = [];
    doorObjects = []; 
    movingPlatforms = []; 
    minotaurEnemy = null;
    minotaurCollisionCylinder = null; 
    endZones = [];
    minotaurTorches = []; 
    
    // Limpiar salpicaduras de sangre
    bloodSplatters.forEach(splatter => { 
        if (splatter.geometry) splatter.geometry.dispose();
        if (splatter.material) splatter.material.dispose();
    });
    bloodSplatters = [];

    // Limpiar partículas de humo
    smokeParticles.forEach(p => { 
        if (p.material) p.material.dispose();
    });
    smokeParticles = [];

    // Resetear referencias a la antorcha del jugador para asegurar su reinicialización
    spearLight = null;
    spearFlameMesh = null;
    spearLightAndFlameGroup = null;
    originalSpearParent = null; 
    originalSpearLocalPos = new THREE.Vector3();
    originalSpearLocalRot = new THREE.Euler();

    // Detener cualquier animación de Tween que pudiera estar activa
    TWEEN.removeAll();
}

// Exportar funciones y variables que necesitan ser accesibles globalmente por otros scripts
// Usar window.variable = variable para exponerlas globalmente.
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.player = player;
window.clock = clock;
window.animationFrameId = animationFrameId;

window.currentMazeLayout = currentMazeLayout;
window.maze = maze;
window.initialPlayerPosition = initialPlayerPosition;
window.currentPlayingScenarioData = currentPlayingScenarioData;
window.currentMazeWidth = currentMazeWidth;
window.currentMazeHeight = currentMazeHeight;

window.collidableObjects = collidableObjects;
window.interactiveObjects = interactiveObjects;
window.playerVelocity = playerVelocity;
window.playerOnGround = playerOnGround;
window.moveForward = moveForward;
window.moveRight = moveRight;
window.cameraPhi = cameraPhi;
window.cameraTheta = cameraTheta;
window.endZones = endZones;

window.gameActive = gameActive;
window.isTouchDevice = isTouchDevice;
window.keyStates = keyStates;
window.isPointerLocked = isPointerLocked;

window.lightWorldPosHelper = lightWorldPosHelper;
window.collisionCheckTempBox = collisionCheckTempBox;
window.playerCollisionBox = playerCollisionBox;
window.minotaurCollisionBox = minotaurCollisionBox;

window.pitTrapObjects = pitTrapObjects;
window.fallingBlockTrapObjects = fallingBlockTrapObjects;
window.spikeTrapObjects = spikeTrapObjects;
window.playerFallingIntoPit = playerFallingIntoPit;

window.minotaurEnemy = minotaurEnemy;
window.minotaurModelGLB = minotaurModelGLB;
window.minotaurInitialGridPos = minotaurInitialGridPos;
window.minotaurState = minotaurState;
window.minotaurTargetCell = minotaurTargetCell;
window.minotaurLastSawPlayerTime = minotaurLastSawPlayerTime;
window.minotaurPatrolNextTargetTime = minotaurPatrolNextTargetTime;
window.minotaurRaycaster = minotaurRaycaster;
window.minotaurToPlayerVec = minotaurToPlayerVec;
window.minotaurForwardVec = minotaurForwardVec;
window.minotaurTorches = minotaurTorches;
window.minotaurCollisionCylinder = minotaurCollisionCylinder;

window.doorObjects = doorObjects;
window.movingPlatforms = movingPlatforms;
window.staticTorches = staticTorches;
window.lavaCells = lavaCells;

window.playerModel = playerModel;
window.playerAnimations = playerAnimations;
window.playerMixer = playerMixer;
window.idleAction = idleAction;
window.walkAction = walkAction;
window.runAction = runAction;
window.currentAction = currentAction;

window.spearLight = spearLight;
window.spearFlameMesh = spearFlameMesh;
window.spearLightAndFlameGroup = spearLightAndFlameGroup;
window.originalSpearParent = originalSpearParent;
window.originalSpearLocalPos = originalSpearLocalPos;
window.originalSpearLocalRot = originalSpearLocalRot;

window.smokeParticles = smokeParticles;
window.smokeParticleGeometry = smokeParticleGeometry;
window.smokeParticleMaterial = smokeParticleMaterial;
window.timeSinceLastSmokeSpawn = timeSinceLastSmokeSpawn;
window.smokeSpawnPosition = smokeSpawnPosition;

window.textureLoader = textureLoader;
window.loadedTextures = loadedTextures;
window.floorTexture = floorTexture;
window.wallTexture = wallTexture;
window.ceilingTexture = ceilingTexture;
window.crackedTexture = crackedTexture;
window.lavaTexture = lavaTexture;
window.doorTexture = doorTexture;
window.bloodSplatterTexture = bloodSplatterTexture;
window.bloodSplatters = bloodSplatters;
window.currentlyTransparentObjects = currentlyTransparentObjects;

window.minimapCanvas = minimapCanvas;
window.minimapCtx = minimapCtx;
window.minimapWidth = minimapWidth;
window.minimapHeight = minimapHeight;
window.visibilityMaze = visibilityMaze;


// Exportar funciones principales del motor
window.init = init;
window.animate = animate;
window.updatePlayer = updatePlayer;
window.updateCamera = updateCamera;
window.toggleView = toggleView;
window.updateRendererAndCameraSize = updateRendererAndCameraSize;
window.cleanUpScene = cleanUpScene;

// También exportar constantes que otros scripts pueden necesitar
window.GAME_VERSION = GAME_VERSION;
window.PLAYER_HEIGHT = PLAYER_HEIGHT;
window.PLAYER_RADIUS = PLAYER_RADIUS;
window.CELL_SIZE = CELL_SIZE;
window.WALL_HEIGHT = WALL_HEIGHT;
window.PIT_FALL_DEPTH = PIT_FALL_DEPTH;
window.LAVA_SURFACE_OFFSET_Y = LAVA_SURFACE_OFFSET_Y;
window.MINOTAUR_TARGET_HEIGHT = MINOTAUR_TARGET_HEIGHT;
window.MINOTAUR_COLLISION_HEIGHT = MINOTAUR_COLLISION_HEIGHT;
window.MINOTAUR_COLLISION_RADIUS = MINOTAUR_COLLISION_RADIUS;
window.CAMERA_SENSITIVITY = CAMERA_SENSITIVITY; // Acceso mutable desde ui_and_data.js

window.PIT_TRAP_CELL_TYPE = PIT_TRAP_CELL_TYPE;
window.BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT = BROKEN_PIT_TRAP_CELL_TYPE_LAYOUT;
window.FALLING_BLOCK_TRAP_CELL_TYPE = FALLING_BLOCK_TRAP_CELL_TYPE;
window.SPIKE_TRAP_CELL_TYPE = SPIKE_TRAP_CELL_TYPE;
window.MINOTAUR_CELL_TYPE = MINOTAUR_CELL_TYPE;
window.LAVA_CELL_TYPE = LAVA_CELL_TYPE;
window.END_CELL_TERMINATE = END_CELL_TERMINATE;
window.END_CELL_SPECIFIC_NEXT = END_CELL_SPECIFIC_NEXT;
window.DOOR_H_CELL_TYPE = DOOR_H_CELL_TYPE;
window.DOOR_V_CELL_TYPE = DOOR_V_CELL_TYPE;
window.MOVING_PLATFORM_CELL_TYPE = MOVING_PLATFORM_CELL_TYPE;