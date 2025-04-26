// Fantasy 3D Side-Scrolling Environment
// Main game initialization and rendering

// Import managers
// Note: In a module environment, you would use import statements instead

// Global variables
let scene, camera, renderer, stats;
let clock;
let skyManager, groundManager, environmentManager, playerManager;
let commandDispatcher, commandQueue, naturalLanguageProcessor;

// OpenAI API settings
let openaiApiKey = (typeof CONFIG !== 'undefined' && CONFIG.openai && CONFIG.openai.apiKey) ? CONFIG.openai.apiKey : (localStorage.getItem('openai_api_key') || '');
let openaiModel = (typeof CONFIG !== 'undefined' && CONFIG.openai && CONFIG.openai.defaultModel) ? CONFIG.openai.defaultModel : (localStorage.getItem('openai_model') || 'gpt-4o');
let openaiTemperature = (typeof CONFIG !== 'undefined' && CONFIG.openai && CONFIG.openai.defaultTemperature !== undefined) ? CONFIG.openai.defaultTemperature : parseFloat(localStorage.getItem('openai_temperature') || '0.7');

// Scene dimensions (landscape mode)
const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

// Debug flag
const DEBUG = true;

// Debug logging function
function log(message) {
    if (DEBUG) {
        console.log(message);
    }
}

// Initialize the game
function init() {
    console.log('Initializing game...');
    try {
        // Create clock for animations
        clock = new THREE.Clock();
        console.log('Clock created');
        
        // Setup scene
        createScene();
        
        // Setup camera
        createCamera();
        console.log('Camera created');
        
        // Setup renderer
        createRenderer();
        console.log('Renderer created');
        
        // Setup managers
        setupManagers();
        console.log('Managers created');
        
        // Add lights
        createLights();
        console.log('Lights created');
        
        // Create environment elements
        createEnvironment();
        console.log('Environment created');
        
        // Add stats for performance monitoring
        createStats();
        console.log('Stats created');
        
        // Start animation loop
        animate();
        console.log('Animation started');
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);
        
        // Setup UI controls for testing managers
        setupUIControls();
        
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Create the scene
function createScene() {
    scene = new THREE.Scene();
    console.log('Scene created');
}

// Create and position the camera
function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    // Position camera for side-scrolling view
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 10, 0);
}

// Create the WebGL renderer
function createRenderer() {
    try {
        console.log('Creating renderer...');
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x87CEEB, 1); // Set clear color to sky blue
        
        // Add renderer to DOM
        const container = document.getElementById('game-container');
        if (!container) {
            console.error('Could not find game-container element');
            return;
        }
        container.appendChild(renderer.domElement);
        console.log('Renderer added to DOM');
    } catch (error) {
        console.error('Error creating renderer:', error);
    }
}

/**
 * Setup scene managers
 */
/**
 * Setup scene managers
 */
function setupManagers() {
    try {
        console.log('Setting up managers...');
        
        // Create Sky Manager
        skyManager = new SkyManager(scene);
        skyManager.changeSkyColor(0x87CEEB); // light blue
        
        // Create Ground Manager
        groundManager = new GroundManager(scene);
        
        // Create Environment Manager
        environmentManager = new EnvironmentManager(scene, groundManager);
        
        // Create Player Manager
        playerManager = new PlayerManager(scene, groundManager);
        
        // Create Command Dispatcher
        commandDispatcher = new CommandDispatcher({
            skyManager,
            groundManager,
            environmentManager,
            playerManager
        });
        
        // Create Command Queue
        commandQueue = new CommandQueue(commandDispatcher, {
            defaultDelay: 300 // 300ms delay between commands for smooth transitions
        });
        
        // Initialize or update NaturalLanguageProcessor
        if (!naturalLanguageProcessor) {
            naturalLanguageProcessor = new NaturalLanguageProcessor({
                apiKey: openaiApiKey,
                model: openaiModel,
                temperature: openaiTemperature
            }, commandDispatcher);
            console.log('Natural Language Processor initialized with model:', naturalLanguageProcessor.model);
        } else {
            naturalLanguageProcessor.updateConfig({
                apiKey: openaiApiKey,
                model: openaiModel,
                temperature: openaiTemperature
            });
            console.log('Natural Language Processor updated with new configuration');
        }

        console.log('Managers initialized successfully');
    } catch (error) {
        console.error('Error setting up managers:', error);
    }
}

// Create lights for the scene
function createLights() {
    try {
        // Add ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xccccff, 0.4);
        scene.add(ambientLight);
        
        // Add sun with directional light using SkyManager
        skyManager.addSun({
            position: { x: 50, y: 100, z: 50 },
            size: 5,
            color: 0xffffcc
        });
        
        console.log('Lights created successfully');
    } catch (error) {
        console.error('Error creating lights:', error);
    }
}

// Create all environment elements
function createEnvironment() {
    try {
        // Add trees at various positions
        const treePositions = [
            { x: -20, z: -10 },
            { x: -15, z: 15 },
            { x: 10, z: -20 },
            { x: 25, z: 5 },
            { x: 0, z: -30 },
            { x: -30, z: 0 },
            { x: 15, z: 30 }
        ];
        
        treePositions.forEach(pos => {
            environmentManager.addTree(pos);
        });
        
        // Add rocks at various positions
        const rockPositions = [
            { x: -10, z: 5 },
            { x: 15, z: -8 },
            { x: 5, z: 20 },
            { x: -20, z: -15 },
            { x: 25, z: 15 }
        ];
        
        rockPositions.forEach(pos => {
            environmentManager.addRock(pos, { scale: 0.8 + Math.random() * 1.2 });
        });
        
        // Add floating islands
        const islandPositions = [
            { x: -50, y: 30, z: -100 },
            { x: 30, y: 40, z: -120 },
            { x: -20, y: 50, z: -150 },
            { x: 70, y: 35, z: -130 }
        ];
        
        islandPositions.forEach(pos => {
            environmentManager.addFloatingIsland(pos, { size: 15 + Math.random() * 10 });
        });
        
        // Add clouds
        const cloudPositions = [
            { x: -50, y: 50, z: -80 },
            { x: 30, y: 60, z: -100 },
            { x: -20, y: 70, z: -90 },
            { x: 60, y: 55, z: -110 },
            { x: 0, y: 65, z: -120 }
        ];
        
        cloudPositions.forEach(pos => {
            environmentManager.addCloud(pos);
        });
        
        // Add platforms
        const platformPositions = [
            { x: 0, y: 10, z: 0 },
            { x: 10, y: 15, z: 5 },
            { x: -10, y: 12, z: 10 },
            { x: 5, y: 18, z: 15 },
            { x: -5, y: 20, z: -5 }
        ];
        
        platformPositions.forEach(pos => {
            environmentManager.addPlatform(pos);
        });
        
        console.log('Environment created successfully');
    } catch (error) {
        console.error('Error creating environment:', error);
    }
}

// Create rolling hills terrain
function createTerrain() {
    // Create a large ground plane with hills
    const terrainSize = 500;
    const terrainSegments = 128;
    
    // Create geometry with heightmap
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    geometry.rotateX(-Math.PI / 2); // Rotate to be horizontal
    
    // Create height variations for rolling hills
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Create rolling hills using sine waves
        vertices[i + 1] = 
            5 * Math.sin(x * 0.05) + 
            3 * Math.sin(z * 0.08) +
            2 * Math.sin(x * 0.02 + z * 0.03) +
            1 * Math.sin(x * 0.1 + z * 0.05);
    }
    
    // Create material with grass texture
    const material = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: false,
    });
    
    // Create mesh and add to scene
    environment.terrain = new THREE.Mesh(geometry, material);
    environment.terrain.receiveShadow = true;
    scene.add(environment.terrain);
    
    // Add a second layer with more vibrant green for visual interest
    const detailGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    detailGeometry.rotateX(-Math.PI / 2);
    
    // Apply the same height map but with slight variations
    const detailVertices = detailGeometry.attributes.position.array;
    for (let i = 0; i < detailVertices.length; i += 3) {
        const x = detailVertices[i];
        const z = detailVertices[i + 2];
        
        detailVertices[i + 1] = 
            5 * Math.sin(x * 0.05) + 
            3 * Math.sin(z * 0.08) +
            2 * Math.sin(x * 0.02 + z * 0.03) +
            1 * Math.sin(x * 0.1 + z * 0.05) + 0.2; // Slightly higher
    }
    
    // Create material with different grass shade
    const detailMaterial = new THREE.MeshStandardMaterial({
        color: 0x66BB6A,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.7,
    });
    
    // Create mesh and add to scene
    environment.detailTerrain = new THREE.Mesh(detailGeometry, detailMaterial);
    environment.detailTerrain.receiveShadow = true;
    scene.add(environment.detailTerrain);
}

// Create magical trees with colorful leaves
function createTrees() {
    environment.trees = [];
    
    // Create several trees at different positions
    const treePositions = [
        { x: -20, z: -10 },
        { x: -15, z: 15 },
        { x: 10, z: -20 },
        { x: 25, z: 5 },
        { x: 0, z: -30 },
        { x: -30, z: 0 },
        { x: 15, z: 30 }
    ];
    
    treePositions.forEach(pos => {
        // Create tree trunk (cylinder)
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 10, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(pos.x, 5, pos.z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);
        
        // Create magical leaves (several spheres with different colors)
        const leafColors = [
            0xFF9800, // Orange
            0xE91E63, // Pink
            0x9C27B0, // Purple
            0x3F51B5, // Indigo
            0x2196F3  // Blue
        ];
        
        for (let i = 0; i < 5; i++) {
            const leafSize = 3 + Math.random() * 2;
            const leafGeometry = new THREE.SphereGeometry(leafSize, 8, 8);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: leafColors[i % leafColors.length],
                roughness: 0.7,
                metalness: 0.3,
                emissive: leafColors[i % leafColors.length],
                emissiveIntensity: 0.2
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position leaves on top of trunk with some variation
            const angle = (i / 5) * Math.PI * 2;
            const radius = 2 + Math.random();
            leaf.position.set(
                pos.x + Math.cos(angle) * radius,
                10 + Math.random() * 3,
                pos.z + Math.sin(angle) * radius
            );
            
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            scene.add(leaf);
            
            environment.trees.push({ trunk, leaf });
        }
    });
}

// Create floating islands in the background
function createFloatingIslands() {
    environment.floatingIslands = [];
    
    // Create several floating islands at different positions
    const islandPositions = [
        { x: -50, y: 30, z: -100, size: 15 },
        { x: 30, y: 40, z: -120, size: 20 },
        { x: -20, y: 50, z: -150, size: 25 },
        { x: 70, y: 35, z: -130, size: 18 }
    ];
    
    islandPositions.forEach(pos => {
        // Create island base (sphere with noise)
        const islandGeometry = new THREE.SphereGeometry(pos.size, 16, 16);
        
        // Add some noise to make it look more natural
        const vertices = islandGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const noise = (Math.random() - 0.5) * 2;
            vertices[i] += noise;
            vertices[i + 1] += noise;
            vertices[i + 2] += noise;
        }
        
        // Create material with grass and rock textures
        const islandMaterial = new THREE.MeshStandardMaterial({
            color: 0x8BC34A,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        island.position.set(pos.x, pos.y, pos.z);
        island.castShadow = true;
        island.receiveShadow = true;
        scene.add(island);
        
        // Add some vegetation to the island
        const treeCount = Math.floor(pos.size / 5);
        for (let i = 0; i < treeCount; i++) {
            // Create small tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 6);
            const trunkMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.9
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Position on top of island with some variation
            const angle = (i / treeCount) * Math.PI * 2;
            const radius = pos.size * 0.7;
            trunk.position.set(
                pos.x + Math.cos(angle) * radius,
                pos.y + pos.size * 0.5,
                pos.z + Math.sin(angle) * radius
            );
            trunk.lookAt(pos.x, pos.y, pos.z); // Orient trunk to point away from center
            trunk.castShadow = true;
            scene.add(trunk);
            
            // Create magical leaves
            const leafGeometry = new THREE.SphereGeometry(2, 6, 6);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: 0x00BCD4, // Cyan for floating island trees
                emissive: 0x00BCD4,
                emissiveIntensity: 0.3,
                roughness: 0.7
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.copy(trunk.position);
            leaf.position.y += 3;
            leaf.castShadow = true;
            scene.add(leaf);
        }
        
        environment.floatingIslands.push(island);
    });
}

// Create scattered stones and ruins
function createStonesAndRuins() {
    environment.stones = [];
    environment.ruins = [];
    
    // Create scattered stones
    const stonePositions = [
        { x: -10, z: 5, scale: 1.5 },
        { x: 15, z: -8, scale: 1 },
        { x: 5, z: 20, scale: 2 },
        { x: -20, z: -15, scale: 1.2 },
        { x: 25, z: 15, scale: 0.8 }
    ];
    
    stonePositions.forEach(pos => {
        // Create stone with random shape
        const stoneGeometry = new THREE.DodecahedronGeometry(pos.scale * 2, 0);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.2
        });
        
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        
        // Get height at this position from terrain
        const x = pos.x;
        const z = pos.z;
        const height = 5 * Math.sin(x * 0.05) + 
                      3 * Math.sin(z * 0.08) +
                      2 * Math.sin(x * 0.02 + z * 0.03) +
                      1 * Math.sin(x * 0.1 + z * 0.05);
        
        stone.position.set(pos.x, height + pos.scale, pos.z);
        stone.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        stone.castShadow = true;
        stone.receiveShadow = true;
        scene.add(stone);
        
        environment.stones.push(stone);
    });
    
    // Create ruins (columns and broken walls)
    const ruinPositions = [
        { x: -25, z: -25 },
        { x: -22, z: -22 },
        { x: -25, z: -19 }
    ];
    
    ruinPositions.forEach(pos => {
        // Create column
        const columnGeometry = new THREE.CylinderGeometry(1, 1, 8, 8, 1, true);
        const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C, // Tan/sandstone color
            roughness: 0.9,
            metalness: 0.1
        });
        
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        
        // Get height at this position
        const x = pos.x;
        const z = pos.z;
        const height = 5 * Math.sin(x * 0.05) + 
                      3 * Math.sin(z * 0.08) +
                      2 * Math.sin(x * 0.02 + z * 0.03) +
                      1 * Math.sin(x * 0.1 + z * 0.05);
        
        column.position.set(pos.x, height + 4, pos.z);
        column.castShadow = true;
        column.receiveShadow = true;
        scene.add(column);
        
        // Add broken top to some columns
        if (Math.random() > 0.5) {
            const topGeometry = new THREE.CylinderGeometry(1.5, 1, 1, 8);
            const top = new THREE.Mesh(topGeometry, columnMaterial);
            top.position.set(pos.x, height + 8, pos.z);
            top.castShadow = true;
            top.receiveShadow = true;
            scene.add(top);
            environment.ruins.push(top);
        }
        
        environment.ruins.push(column);
    });
    
    // Add a broken wall
    const wallGeometry = new THREE.BoxGeometry(10, 6, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xD2B48C,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    
    // Position wall near columns
    const wallX = -20;
    const wallZ = -20;
    const wallHeight = 5 * Math.sin(wallX * 0.05) + 
                      3 * Math.sin(wallZ * 0.08) +
                      2 * Math.sin(wallX * 0.02 + wallZ * 0.03) +
                      1 * Math.sin(wallX * 0.1 + wallZ * 0.05);
    
    wall.position.set(wallX, wallHeight + 3, wallZ);
    wall.rotation.y = Math.PI / 4; // Angle the wall
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    
    environment.ruins.push(wall);
}

// Create fluffy clouds
function createClouds() {
    environment.clouds = [];
    
    // Create several clouds at different positions
    const cloudPositions = [
        { x: -50, y: 50, z: -80 },
        { x: 30, y: 60, z: -100 },
        { x: -20, y: 70, z: -90 },
        { x: 60, y: 55, z: -110 },
        { x: 0, y: 65, z: -120 }
    ];
    
    cloudPositions.forEach(pos => {
        // Create cloud group
        const cloud = new THREE.Group();
        cloud.position.set(pos.x, pos.y, pos.z);
        
        // Create cloud puffs (several spheres grouped together)
        const puffCount = 5 + Math.floor(Math.random() * 5);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        
        for (let i = 0; i < puffCount; i++) {
            const puffSize = 3 + Math.random() * 3;
            const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
            const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
            
            // Position puffs with some variation
            puff.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 10
            );
            
            cloud.add(puff);
        }
        
        scene.add(cloud);
        environment.clouds.push(cloud);
    });
}

// Create jumping platforms
function createPlatforms() {
    environment.platforms = [];
    
    // Create several platforms at different positions
    const platformPositions = [
        { x: 0, y: 10, z: 0 },
        { x: 10, y: 15, z: 5 },
        { x: -10, y: 12, z: 10 },
        { x: 5, y: 18, z: 15 },
        { x: -5, y: 20, z: -5 }
    ];
    
    platformPositions.forEach(pos => {
        // Create platform base
        const platformGeometry = new THREE.BoxGeometry(5, 1, 5);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x795548, // Brown
            roughness: 0.8,
            metalness: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(pos.x, pos.y, pos.z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        scene.add(platform);
        
        // Add some magical glow effect
        const glowGeometry = new THREE.BoxGeometry(5.2, 0.2, 5.2);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: 0x00BCD4, // Cyan
            emissive: 0x00BCD4,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(pos.x, pos.y - 0.6, pos.z);
        scene.add(glow);
        
        environment.platforms.push({ platform, glow });
    });
}

// Add stats for performance monitoring
function createStats() {
    try {
        stats = new Stats();
        document.body.appendChild(stats.dom);
        console.log('Stats added to DOM');
    } catch (error) {
        console.error('Error creating stats:', error);
        // Continue without stats if there's an error
        stats = { update: function() {} }; // Create dummy stats object
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    try {
        // Update stats
        if (stats) stats.update();
        
        // Get elapsed time
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Update environment animations using the manager
        if (environmentManager) {
            environmentManager.update(elapsedTime);
        }
        
        // Update player physics and movement
        if (playerManager) {
            playerManager.update(delta);
            
            // Make camera follow player with smooth lerping
            if (camera && playerManager.playerMesh) {
                // Get player position
                const playerPos = playerManager.position;
                
                // Set camera target position (following slightly behind and above player)
                const targetX = playerPos.x - 5; // Slightly behind
                const targetY = playerPos.y + 3; // Slightly above
                const targetZ = playerPos.z + 10; // Offset to side
                
                // Smoothly interpolate camera position
                camera.position.x += (targetX - camera.position.x) * 0.05;
                camera.position.y += (targetY - camera.position.y) * 0.05;
                camera.position.z += (targetZ - camera.position.z) * 0.05;
                
                // Look at player
                camera.lookAt(playerPos);
            }
        }
        
        // Render scene
        if (scene && camera && renderer) {
            renderer.render(scene, camera);
        } else {
            console.error('Cannot render: missing scene, camera, or renderer');
        }
    } catch (error) {
        console.error('Error in animation loop:', error);
    }
}

// Setup UI controls for testing managers
function setupUIControls() {
    try {
        console.log('Setting up UI controls...');
        
        // Control panel buttons have been removed from the UI
        // All environment changes now happen through AI commands
        
        // Tree and sequence buttons have been removed from the UI
        // All environment changes now happen through AI commands
        
        // Parameterized command controls
        
        // We've removed the parameterized command buttons and replaced them with the text command input
        
        // Player color control
        const changePlayerColorBtn = document.getElementById('change-player-color-btn');
        if (changePlayerColorBtn) {
            changePlayerColorBtn.addEventListener('click', () => {
                const colorValue = document.getElementById('player-color-input').value;
                console.log('Changing player color to:', colorValue);
                commandDispatcher.executeCommand(`change_player_color:${colorValue}`);
            });
        }

        // Building Image Upload Section
        let currentBuildingTexture = null;

        // File input change handler
        const buildingImageUpload = document.getElementById('building-image-upload');
        const spawnBuildingBtn = document.getElementById('spawn-building-btn');
        const uploadPreview = document.getElementById('upload-preview');
        const buildingPreviewImg = document.getElementById('building-preview-img');

        if (buildingImageUpload && spawnBuildingBtn) {
            buildingImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];

                if (file) {
                    // Check if file is an image
                    if (!file.type.match('image.*')) {
                        alert('Please select an image file (JPEG or PNG)');
                        return;
                    }

                    // Create a preview of the image
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        // Show the preview
                        buildingPreviewImg.src = e.target.result;
                        uploadPreview.classList.remove('hidden');

                        // Enable the spawn button
                        spawnBuildingBtn.disabled = false;
                    };

                    reader.onerror = () => {
                        console.error('Error reading file');
                        alert('Error reading file. Please try again.');
                    };

                    // Read the file as a data URL
                    reader.readAsDataURL(file);
                } else {
                    // Disable the spawn button if no file is selected
                    spawnBuildingBtn.disabled = true;
                    uploadPreview.classList.add('hidden');
                }
            });

            // Spawn building button click handler
            spawnBuildingBtn.addEventListener('click', () => {
                const file = buildingImageUpload.files[0];

                if (file) {
                    // Get the number of trees to replace
                    const treesToReplace = parseInt(document.getElementById('trees-to-replace').value) || 3;

                    // Load the image as a texture
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        // Create an image element to get dimensions
                        const img = new Image();

                        img.onload = () => {
                            try {
                                // Show processing message
                                console.log('Processing and stylizing image...');

                                // Stylize the image to match the fantasy aesthetic
                                const stylizedCanvas = ImageStyler.stylizeImage(img, {
                                    saturationReduction: 0.15,  // Reduce saturation by 15%
                                    blurAmount: 1.5,           // Apply slight blur
                                    posterizeLevels: 10,        // Reduce to 10 color levels
                                    bloomStrength: 0.2          // Add slight bloom effect
                                });

                                // Create a texture from the stylized canvas
                                const texture = new THREE.CanvasTexture(stylizedCanvas);
                                texture.needsUpdate = true;

                                // Clean up previous texture if exists
                                if (currentBuildingTexture) {
                                    currentBuildingTexture.dispose();
                                }

                                // Store the current texture
                                currentBuildingTexture = texture;

                                // Update the preview with the stylized image
                                buildingPreviewImg.src = stylizedCanvas.toDataURL();

                                // Spawn building from stylized image
                                environmentManager.spawnBuildingFromImage(texture, treesToReplace);

                                // Show success message
                                console.log(`Building spawned successfully, replacing ${treesToReplace} trees`);
                            } catch (error) {
                                console.error('Error processing or spawning building:', error);
                                alert('Error processing or spawning building: ' + error.message);
                            }
                        };

                        img.onerror = () => {
                            console.error('Error loading image');
                            alert('Error loading image. Please try again.');
                        };

                        // Set the image source to the file data
                        img.src = e.target.result;
                    };

                    reader.onerror = () => {
                        console.error('Error reading file');
                        alert('Error reading file. Please try again.');
                    };

                    // Read the file as a data URL
                    reader.readAsDataURL(file);
                }
            });
        }

        // Reset player position
        const resetPlayerBtn = document.getElementById('reset-player-btn');
        if (resetPlayerBtn) {
            resetPlayerBtn.addEventListener('click', () => {
                console.log('Resetting player position');
                playerManager.resetPosition();
            });
        }
        
        // Text Command Input has been removed from the UI
        // All environment changes now happen through AI commands
        
        // AI Command Input handling
        const aiCommandInput = document.getElementById('ai-command-input');
        const executeAiCommandBtn = document.getElementById('execute-ai-command-btn');
        const aiProcessingIndicator = document.getElementById('ai-processing-indicator');
        const aiResponseDisplay = document.getElementById('ai-response-display');
        const aiResponseJson = document.getElementById('ai-response-json');
        const openaiApiKeyInput = document.getElementById('openai-api-key');
        const saveApiKeyBtn = document.getElementById('save-api-key-btn');
        const openaiModelSelect = document.getElementById('openai-model');
        const openaiTemperatureInput = document.getElementById('openai-temperature');
        const temperatureValueDisplay = document.getElementById('temperature-value');
        
        // Initialize UI with saved values
        if (openaiApiKeyInput) {
            openaiApiKeyInput.value = openaiApiKey ? '********' : '';
        }
        
        if (openaiModelSelect) {
            openaiModelSelect.value = openaiModel;
        }
        
        if (openaiTemperatureInput) {
            openaiTemperatureInput.value = openaiTemperature;
            temperatureValueDisplay.textContent = openaiTemperature;
        }
        
        // Save API key button
        if (saveApiKeyBtn && openaiApiKeyInput) {
            saveApiKeyBtn.addEventListener('click', () => {
                const newApiKey = openaiApiKeyInput.value.trim();
                
                if (newApiKey && newApiKey !== '********') {
                    // Save API key to localStorage
                    localStorage.setItem('openai_api_key', newApiKey);
                    openaiApiKey = newApiKey;
                    
                    // Initialize or update NaturalLanguageProcessor
                    if (!naturalLanguageProcessor) {
                        naturalLanguageProcessor = new NaturalLanguageProcessor({
                            apiKey: openaiApiKey,
                            model: openaiModel,
                            temperature: openaiTemperature
                        }, commandDispatcher);
                    } else {
                        naturalLanguageProcessor.updateConfig({
                            apiKey: openaiApiKey
                        });
                    }
                    
                    // Show success message
                    alert('API key saved successfully!');
                    console.log('OpenAI API key saved and NLP initialized');
                } else if (newApiKey === '') {
                    // Clear API key
                    localStorage.removeItem('openai_api_key');
                    openaiApiKey = '';
                    naturalLanguageProcessor = null;
                    alert('API key cleared');
                }
            });
        }
        
        // Model selection change
        if (openaiModelSelect) {
            openaiModelSelect.addEventListener('change', () => {
                const newModel = openaiModelSelect.value;
                localStorage.setItem('openai_model', newModel);
                openaiModel = newModel;
                
                if (naturalLanguageProcessor) {
                    naturalLanguageProcessor.updateConfig({
                        model: newModel
                    });
                }
                
                console.log('OpenAI model updated to:', newModel);
            });
        }
        
        // Temperature slider change
        if (openaiTemperatureInput && temperatureValueDisplay) {
            openaiTemperatureInput.addEventListener('input', () => {
                const newTemperature = parseFloat(openaiTemperatureInput.value);
                temperatureValueDisplay.textContent = newTemperature.toFixed(1);
                localStorage.setItem('openai_temperature', newTemperature.toString());
                openaiTemperature = newTemperature;
                
                if (naturalLanguageProcessor) {
                    naturalLanguageProcessor.updateConfig({
                        temperature: newTemperature
                    });
                }
            });
        }
        
        // Speech-to-Text-Translate feature is initialized in SpeechToTextTranslator.js
        console.log('Speech-to-Text-Translate feature will be initialized via DOMContentLoaded event');
        
        // Execute AI command
        if (executeAiCommandBtn && aiCommandInput) {
            executeAiCommandBtn.addEventListener('click', () => {
                executeAiCommand();
            });
            
            // Execute on Enter key press
            aiCommandInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    executeAiCommand();
                }
            });
            
            // Function to execute the AI command
            function executeAiCommand() {
                const inputText = aiCommandInput.value.trim();
                
                if (!inputText) {
                    console.warn('Please enter a description');
                    return;
                }
                
                if (!naturalLanguageProcessor) {
                    alert('Please enter an OpenAI API key first');
                    return;
                }
                
                // Show processing indicator
                aiProcessingIndicator.classList.remove('hidden');
                aiResponseDisplay.classList.add('hidden');
                
                // Set up a manual spinner timeout as a fallback
                const spinnerTimeoutId = setTimeout(() => {
                    console.error('Manual spinner timeout triggered after 20 seconds');
                    aiProcessingIndicator.classList.add('hidden');
                    aiResponseDisplay.classList.remove('hidden');
                    aiResponseJson.textContent = 'Sorry, something went wrong. The request took too long to process. Please try again.';
                }, 20000); // 20 second timeout
                
                console.log('AI command execution started for input:', inputText);
                
                // Check if this is a skyscraper transformation request
                const isSkyscraperRequest = inputText.toLowerCase().includes('tree') && 
                                          (inputText.toLowerCase().includes('skyscraper') || 
                                           inputText.toLowerCase().includes('building') || 
                                           inputText.toLowerCase().includes('castle'));
                
                if (isSkyscraperRequest) {
                    console.log('Detected potential complex transformation request:', inputText);
                    
                    // Process the input using the standard processor
                    naturalLanguageProcessor.processInput(
                        inputText,
                        // Success callback
                        (result) => {
                            console.log('AI processing succeeded with result:', result);
                            clearTimeout(spinnerTimeoutId);
                            
                            // Display the result
                            aiResponseJson.textContent = JSON.stringify(result, null, 2);
                            aiResponseDisplay.classList.remove('hidden');
                            
                            // Clear input on success
                            aiCommandInput.value = '';
                        },
                        // Error callback
                        (error) => {
                            console.error('AI processing error:', error);
                            clearTimeout(spinnerTimeoutId);
                            
                            // Display user-friendly error
                            aiResponseJson.textContent = `Error: ${error}`;
                            aiResponseDisplay.classList.remove('hidden');
                        },
                        // Start callback
                        () => {
                            console.log('AI processing started for input:', inputText);
                        },
                        // Complete callback
                        () => {
                            console.log('AI processing completed for input:', inputText);
                            clearTimeout(spinnerTimeoutId);
                            aiProcessingIndicator.classList.add('hidden');
                        }
                    );
                } else {
                    // Process regular natural language input
                    console.log('Processing regular natural language input:', inputText);
                    naturalLanguageProcessor.processInput(
                        inputText,
                        // Success callback
                        (result) => {
                            console.log('AI processing succeeded with result type:', typeof result);
                            clearTimeout(spinnerTimeoutId);
                            
                            // Display the result
                            aiResponseJson.textContent = JSON.stringify(result, null, 2);
                            aiResponseDisplay.classList.remove('hidden');
                            
                            // Clear input on success
                            aiCommandInput.value = '';
                        },
                        // Error callback
                        (error) => {
                            console.error('AI processing error:', error);
                            clearTimeout(spinnerTimeoutId);
                            
                            // Display user-friendly error with suggestions
                            let errorMessage = `Error: ${error}`;
                            if (error.includes('API key')) {
                                errorMessage += '\n\nPlease check that your OpenAI API key is valid and has sufficient credits.';
                            } else if (error.includes('timeout')) {
                                errorMessage += '\n\nThe request took too long to complete. Please try again or use a simpler request.';
                            }
                            
                            aiResponseJson.textContent = errorMessage;
                            aiResponseDisplay.classList.remove('hidden');
                        },
                        // Start callback
                        () => {
                            console.log('AI processing started for input:', inputText);
                        },
                        // Complete callback
                        () => {
                            console.log('AI processing completed for input:', inputText);
                            clearTimeout(spinnerTimeoutId);
                            aiProcessingIndicator.classList.add('hidden');
                        }
                    );
                }
            }
        }
        
        // Log available commands for debugging
        console.log('Available commands:', commandDispatcher.getAvailableCommands());
        console.log('UI controls setup complete');
    } catch (error) {
        console.error('Error setting up UI controls:', error);
    }
}

// Start the game when the page loads
window.addEventListener('load', init);
