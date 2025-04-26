/**
 * EnvironmentManager.js
 * Responsible for managing environment objects in the 3D scene.
 * Controls trees, rocks, platforms, and other props.
 */

class EnvironmentManager {
    /**
     * Create an environment manager
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {GroundManager} groundManager - The ground manager for height queries
     */
    constructor(scene, groundManager) {
        this.scene = scene;
        this.groundManager = groundManager;
        
        // Collections to track environment objects
        this.trees = [];
        this.rocks = [];
        this.platforms = [];
        this.floatingIslands = [];
        this.clouds = [];
        this.buildings = [];
        
        // Counters for generating unique IDs
        this.treeIdCounter = 0;
        this.rockIdCounter = 0;
        this.platformIdCounter = 0;
        this.islandIdCounter = 0;
        this.cloudIdCounter = 0;
        this.buildingIdCounter = 0;
        
        // Materials and colors
        this.treeTrunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        this.leafColors = [
            0xFF9800, // Orange
            0xE91E63, // Pink
            0x9C27B0, // Purple
            0x3F51B5, // Indigo
            0x2196F3  // Blue
        ];
    }
    
    /**
     * Spawn trees of a specific type
     * @param {string} treeType - Type of tree to spawn (cherry_blossom, pine, oak, willow, palm, magical)
     * @param {number} count - Number of trees to spawn
     */
    spawnTreeType(treeType, count = 3) {
        console.log(`Spawning ${count} trees of type: ${treeType}`);
        
        // Remove existing trees to replace with new type
        this.clearTrees();
        
        // Spawn new trees of the specified type
        for (let i = 0; i < count; i++) {
            // Generate random position within reasonable bounds
            const randomX = (Math.random() - 0.5) * 100;
            const randomZ = (Math.random() - 0.5) * 100;
            const position = { x: randomX, z: randomZ };
            
            // Set options based on tree type
            const options = this.getTreeOptionsForType(treeType);
            
            // Add the tree
            this.addTree(position, options);
        }
    }
    
    /**
     * Get tree customization options based on tree type
     * @param {string} treeType - Type of tree
     * @returns {Object} - Options for tree customization
     */
    getTreeOptionsForType(treeType) {
        const options = {};
        
        switch(treeType) {
            case 'cherry_blossom':
                options.leafColor = 0xFFB7C5; // Light pink
                options.scale = 0.9 + Math.random() * 0.3;
                break;
                
            case 'pine':
                options.leafColor = 0x2E8B57; // Dark green
                options.scale = 1.2 + Math.random() * 0.5;
                // TODO: Modify geometry for pine shape
                break;
                
            case 'oak':
                options.leafColor = 0x228B22; // Forest green
                options.scale = 1.0 + Math.random() * 0.4;
                break;
                
            case 'willow':
                options.leafColor = 0x98FB98; // Pale green
                options.scale = 1.1 + Math.random() * 0.3;
                // TODO: Add drooping effect for willow
                break;
                
            case 'palm':
                options.leafColor = 0x32CD32; // Lime green
                options.scale = 1.0 + Math.random() * 0.3;
                // TODO: Modify geometry for palm shape
                break;
                
            case 'magical':
                // Random magical color
                const magicalColors = [0xFF00FF, 0x00FFFF, 0xFFFF00, 0xFF00AA, 0x00FFAA];
                options.leafColor = magicalColors[Math.floor(Math.random() * magicalColors.length)];
                options.scale = 0.8 + Math.random() * 0.5;
                break;
                
            default:
                // Default to random color from the leaf colors array
                options.leafColor = this.leafColors[Math.floor(Math.random() * this.leafColors.length)];
                options.scale = 0.8 + Math.random() * 0.5;
        }
        
        return options;
    }
    
    /**
     * Clear all trees from the scene
     */
    clearTrees() {
        // Remove all trees from the scene
        for (const tree of this.trees) {
            this.scene.remove(tree.group);
        }
        
        // Clear the trees array
        this.trees = [];
        console.log('Cleared all trees from the scene');
    }
    
    /**
     * Spawn a building of a specific type
     * @param {string} buildingType - Type of building to spawn (shrine, castle, cottage, tower, ruins, temple, pagoda)
     */
    spawnBuildingType(buildingType) {
        console.log(`Spawning building of type: ${buildingType}`);
        
        // Remove existing buildings
        this.clearBuildings();
        
        // Generate position for the building
        const position = { 
            x: (Math.random() - 0.5) * 80, 
            z: (Math.random() - 0.5) * 80 
        };
        
        // Create a placeholder building for now
        this.addPlaceholderBuilding(position, buildingType);
    }
    
    /**
     * Add a placeholder building to the scene
     * @param {Object} position - Position {x, y, z} to place the building
     * @param {string} buildingType - Type of building
     * @returns {Object} - The created building object with ID
     */
    addPlaceholderBuilding(position, buildingType) {
        const id = `building_${this.buildingIdCounter++}`;
        
        // Get ground height if y is not specified
        if (position.y === undefined && this.groundManager) {
            position.y = this.groundManager.getHeightAt(position.x, position.z);
        }
        
        // Create building group
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(position.x, position.y, position.z);
        
        // Set building properties based on type
        let color, width, height, depth;
        
        switch(buildingType) {
            case 'shrine':
            case 'pagoda':
                color = 0xFF5555; // Red
                width = 10;
                height = 15;
                depth = 10;
                break;
                
            case 'castle':
                color = 0xCCCCCC; // Light gray
                width = 20;
                height = 25;
                depth = 20;
                break;
                
            case 'cottage':
                color = 0xA0522D; // Brown
                width = 8;
                height = 6;
                depth = 8;
                break;
                
            case 'tower':
                color = 0x888888; // Gray
                width = 6;
                height = 20;
                depth = 6;
                break;
                
            case 'ruins':
                color = 0x808080; // Gray
                width = 12;
                height = 4;
                depth = 12;
                break;
                
            case 'temple':
                color = 0xF5DEB3; // Wheat
                width = 15;
                height = 12;
                depth = 15;
                break;
                
            default:
                color = 0xAAAAAA; // Default gray
                width = 10;
                height = 10;
                depth = 10;
        }
        
        // Create a simple box as a placeholder
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.y = height / 2; // Position at ground level
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;
        
        buildingGroup.add(buildingMesh);
        
        // Add to scene
        this.scene.add(buildingGroup);
        
        // Store building data
        const buildingData = {
            id,
            group: buildingGroup,
            mesh: buildingMesh,
            type: buildingType,
            position: { ...position }
        };
        
        this.buildings.push(buildingData);
        return buildingData;
    }
    
    /**
     * Clear all buildings from the scene
     */
    clearBuildings() {
        // Remove all buildings from the scene
        for (const building of this.buildings) {
            // Dispose of textures to free memory
            if (building.texture) {
                building.texture.dispose();
            }
            
            // Dispose of materials to free memory
            if (building.mesh && building.mesh.material) {
                if (Array.isArray(building.mesh.material)) {
                    building.mesh.material.forEach(material => material.dispose());
                } else {
                    building.mesh.material.dispose();
                }
            }
            
            // Dispose of geometries to free memory
            if (building.mesh && building.mesh.geometry) {
                building.mesh.geometry.dispose();
            }
            
            // Remove from scene
            this.scene.remove(building.group);
        }
        
        // Clear the buildings array
        this.buildings = [];
        console.log('Cleared all buildings from the scene');
    }
    
    /**
     * Spawn a building from an uploaded image
     * @param {THREE.Texture} imageTexture - The texture created from the uploaded image
     * @param {number} treeCount - Number of trees to replace with building billboards (default: 3)
     * @returns {Array} - Array of created building objects
     */
    spawnBuildingFromImage(imageTexture, treeCount = 3) {
        console.log(`Spawning building from image, replacing ${treeCount} trees`);
        
        // Store the original texture for reference
        this.currentBuildingTexture = imageTexture;
        
        // Get tree positions to replace
        const treePositions = this.getRandomTreePositions(treeCount);
        
        // If no trees to replace, create a new position
        if (treePositions.length === 0) {
            console.log('No trees to replace, creating new position');
            treePositions.push({
                x: (Math.random() - 0.5) * 80,
                y: 0,
                z: (Math.random() - 0.5) * 80
            });
        }
        
        // Create building billboards at tree positions
        const createdBuildings = [];
        
        for (const position of treePositions) {
            // Create a building billboard
            const building = this.createBuildingBillboard(imageTexture, position);
            createdBuildings.push(building);
        }
        
        return createdBuildings;
    }
    
    /**
     * Get random tree positions and remove those trees
     * @param {number} count - Number of trees to select
     * @returns {Array} - Array of positions {x, y, z}
     */
    getRandomTreePositions(count) {
        const positions = [];
        
        // If no trees, return empty array
        if (this.trees.length === 0) {
            return positions;
        }
        
        // Limit count to available trees
        count = Math.min(count, this.trees.length);
        
        // Create a copy of the trees array to avoid modifying during iteration
        const treesCopy = [...this.trees];
        
        // Randomly select trees and get their positions
        for (let i = 0; i < count; i++) {
            if (treesCopy.length === 0) break;
            
            // Get a random index
            const randomIndex = Math.floor(Math.random() * treesCopy.length);
            
            // Get the tree and its position
            const tree = treesCopy[randomIndex];
            const position = { ...tree.position };
            
            // Add position to result
            positions.push(position);
            
            // Remove the tree from the scene
            this.removeTree(tree.id);
            
            // Remove the tree from the copy array
            treesCopy.splice(randomIndex, 1);
        }
        
        return positions;
    }
    
    /**
     * Create a building billboard from an image texture
     * @param {THREE.Texture} texture - The texture for the building
     * @param {Object} position - Position {x, y, z} to place the building
     * @returns {Object} - The created building object with ID
     */
    createBuildingBillboard(texture, position) {
        const id = `building_${this.buildingIdCounter++}`;
        
        // Get ground height if y is not specified
        if (position.y === undefined && this.groundManager) {
            position.y = this.groundManager.getHeightAt(position.x, position.z);
        }
        
        // Ensure position is slightly above ground to avoid z-fighting
        position.y += 0.1;
        
        // Create building group
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(position.x, position.y, position.z);
        
        // Calculate aspect ratio to maintain image proportions
        const aspectRatio = texture.image.width / texture.image.height;
        
        // Set billboard dimensions based on aspect ratio
        const height = 20 + Math.random() * 10; // Random height between 20-30
        const width = height * aspectRatio;
        
        // Create a plane geometry for the billboard
        const geometry = new THREE.PlaneGeometry(width, height);
        
        // Create material with the image texture - using StandardMaterial for better lighting
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 0.7,  // Slightly rough surface for fantasy look
            metalness: 0.2,  // Slight metalness for better light reflection
            emissive: new THREE.Color(0x222222), // Slight emissive for glow
            emissiveMap: texture, // Use same texture for emissive
            emissiveIntensity: 0.1 // Subtle glow
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        
        // Slightly randomize rotation for variety (1-5 degrees)
        mesh.rotation.y = (Math.random() * 5 + 1) * (Math.PI / 180) * (Math.random() > 0.5 ? 1 : -1);
        
        // Position at ground level
        mesh.position.y = height / 2;
        
        // Start with small scale and opacity for animation
        mesh.scale.set(0.01, 0.01, 0.01);
        material.opacity = 0;
        
        // Add to group
        buildingGroup.add(mesh);
        
        // Add to scene
        this.scene.add(buildingGroup);
        
        // Store animation start time
        const startTime = Date.now();
        const animationDuration = 800; // 0.8 seconds
        
        // Create animation function
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            
            // Ease-out cubic function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Add slight bounce at the end
            const scale = progress === 1 ? 1 : easeOut * (1 + Math.sin(progress * Math.PI) * 0.1);
            
            // Update scale and opacity
            mesh.scale.set(scale, scale, scale);
            material.opacity = easeOut;
            
            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation
        animate();
        
        // Store building data
        const buildingData = {
            id,
            group: buildingGroup,
            mesh,
            texture,
            type: 'billboard',
            position: { ...position }
        };
        
        this.buildings.push(buildingData);
        return buildingData;
    }
    
    /**
     * Start a weather effect
     * @param {string} weatherEffect - Type of weather effect (rain, snow, clear, fog, storm)
     */
    startWeatherEffect(weatherEffect) {
        console.log(`Starting weather effect: ${weatherEffect}`);
        
        // Clear any existing weather effects
        this.clearWeatherEffects();
        
        switch(weatherEffect) {
            case 'rain':
                this.createRainEffect();
                break;
                
            case 'snow':
                this.createSnowEffect();
                break;
                
            case 'fog':
                this.createFogEffect();
                break;
                
            case 'storm':
                this.createStormEffect();
                break;
                
            case 'clear':
            default:
                // Clear weather, no effect needed
                console.log('Clear weather, no effect applied');
        }
    }
    
    /**
     * Clear all weather effects
     */
    clearWeatherEffects() {
        // TODO: Implement clearing of weather effects
        console.log('Cleared all weather effects');
    }
    
    /**
     * Create rain effect
     */
    createRainEffect() {
        // TODO: Implement rain particle effect
        console.log('Rain effect not fully implemented yet');
    }
    
    /**
     * Create snow effect
     */
    createSnowEffect() {
        // TODO: Implement snow particle effect
        console.log('Snow effect not fully implemented yet');
    }
    
    /**
     * Create fog effect
     */
    createFogEffect() {
        // TODO: Implement fog effect
        console.log('Fog effect not fully implemented yet');
    }
    
    /**
     * Create storm effect
     */
    createStormEffect() {
        // TODO: Implement storm effect
        console.log('Storm effect not fully implemented yet');
    }
    
    /**
     * Start a particle effect
     * @param {string} particleEffect - Type of particle effect (petals, snowflakes, raindrops, leaves, sparkles)
     */
    startParticleEffect(particleEffect) {
        console.log(`Starting particle effect: ${particleEffect}`);
        
        // Clear any existing particle effects
        this.clearParticleEffects();
        
        switch(particleEffect) {
            case 'petals':
                this.createPetalEffect();
                break;
                
            case 'snowflakes':
                this.createSnowflakeEffect();
                break;
                
            case 'raindrops':
                this.createRaindropEffect();
                break;
                
            case 'leaves':
                this.createLeafEffect();
                break;
                
            case 'sparkles':
                this.createSparkleEffect();
                break;
                
            default:
                console.log(`Unknown particle effect: ${particleEffect}`);
        }
    }
    
    /**
     * Clear all particle effects
     */
    clearParticleEffects() {
        // TODO: Implement clearing of particle effects
        console.log('Cleared all particle effects');
    }
    
    /**
     * Create petal effect (falling cherry blossoms)
     */
    createPetalEffect() {
        // TODO: Implement petal particle effect
        console.log('Petal effect not fully implemented yet');
    }
    
    /**
     * Create snowflake effect
     */
    createSnowflakeEffect() {
        // TODO: Implement snowflake particle effect
        console.log('Snowflake effect not fully implemented yet');
    }
    
    /**
     * Create raindrop effect
     */
    createRaindropEffect() {
        // TODO: Implement raindrop particle effect
        console.log('Raindrop effect not fully implemented yet');
    }
    
    /**
     * Create leaf effect (falling leaves)
     */
    createLeafEffect() {
        // TODO: Implement leaf particle effect
        console.log('Leaf effect not fully implemented yet');
    }
    
    /**
     * Create sparkle effect
     */
    createSparkleEffect() {
        // TODO: Implement sparkle particle effect
        console.log('Sparkle effect not fully implemented yet');
    }
    
    /**
     * Transform trees into skyscrapers using a JavaScript code snippet
     * @param {string} javascriptCodeSnippet - JavaScript code that creates and returns a Three.js mesh
     * @returns {Array} - Array of created skyscraper objects
     */
    /**
     * Transform trees into fantasy skyscrapers using code snippet
     * @param {string} javascriptCodeSnippet - JavaScript code that creates a Three.js mesh
     * @returns {Array} - Array of created skyscraper objects
     */
    transformTreesToSkyscrapers(javascriptCodeSnippet) {
        console.log('Transforming trees to fantasy skyscrapers with code snippet');
        
        // If no trees, return empty array
        if (this.trees.length === 0) {
            console.log('No trees to transform');
            return [];
        }
        
        // Import CodeEvaluator if not already available
        if (typeof CodeEvaluator === 'undefined') {
            console.error('CodeEvaluator not available. Make sure it\'s imported.');
            return [];
        }
        
        // Get all tree positions
        const treePositions = this.trees.map(tree => ({ ...tree.position }));
        
        // Store trees to remove after transformation
        const treesToRemove = [...this.trees];
        
        // Create skyscrapers at tree positions
        const createdSkyscrapers = [];
        
        for (const position of treePositions) {
            try {
                // Create a skyscraper mesh using the code snippet
                const skyscraperMesh = CodeEvaluator.createMeshFromSnippet(javascriptCodeSnippet);
                
                // Create a unique ID for the skyscraper
                const id = `skyscraper_${this.buildingIdCounter++}`;
                
                // Create a group for the skyscraper
                const skyscraperGroup = new THREE.Group();
                
                // Position the group at the tree position
                skyscraperGroup.position.set(position.x, position.y, position.z);
                
                // Apply size constraints to ensure buildings fit environment scale
                // Calculate the current dimensions of the mesh
                const boundingBox = new THREE.Box3().setFromObject(skyscraperMesh);
                const size = new THREE.Vector3();
                boundingBox.getSize(size);
                
                // Calculate scaling factors to fit within our constraints
                // Max height: 20-30 units, width/depth: 5-8 units
                const targetHeight = 20 + Math.random() * 10; // 20-30 units
                const targetWidth = 5 + Math.random() * 3;   // 5-8 units
                const targetDepth = 5 + Math.random() * 3;   // 5-8 units
                
                // Calculate scale factors
                const heightScale = targetHeight / size.y;
                const widthScale = targetWidth / size.x;
                const depthScale = targetDepth / size.z;
                
                // Apply the smallest scale factor to maintain proportions
                // but ensure it fits within our constraints
                const uniformScale = Math.min(heightScale, widthScale, depthScale);
                
                // Apply scaling to the mesh
                skyscraperMesh.scale.set(uniformScale, uniformScale, uniformScale);
                
                // Add slight random height variation for organic skyline
                const heightVariation = 0.9 + Math.random() * 0.2; // +/- 10%
                skyscraperMesh.scale.y *= heightVariation;
                
                // Add the mesh to the group
                skyscraperGroup.add(skyscraperMesh);
                
                // Add to scene
                this.scene.add(skyscraperGroup);
                
                // Apply a smooth grow-up animation
                this.animateSkyscraperGrowth(skyscraperGroup);
                
                // Store skyscraper data
                const skyscraperData = {
                    id,
                    group: skyscraperGroup,
                    mesh: skyscraperMesh,
                    type: 'fantasy_skyscraper',
                    position: { ...position }
                };
                
                // Add to buildings array
                this.buildings.push(skyscraperData);
                createdSkyscrapers.push(skyscraperData);
                
                console.log(`Created fantasy skyscraper at position (${position.x}, ${position.y}, ${position.z})`);
            } catch (error) {
                console.error('Error creating skyscraper:', error);
                
                // Create a fallback skyscraper
                const fallbackSkyscraper = this.createFallbackSkyscraper(position);
                createdSkyscrapers.push(fallbackSkyscraper);
            }
        }
        
        // Remove all trees with animation
        this.fadeOutAndRemoveTrees(treesToRemove);
        
        return createdSkyscrapers;
    }
    
    /**
     * Create a fallback skyscraper if code evaluation fails
     * @param {Object} position - Position {x, y, z} to place the skyscraper
     * @returns {Object} - The created skyscraper object with ID
     */
    createFallbackSkyscraper(position) {
        const id = `skyscraper_${this.buildingIdCounter++}`;
        
        // Create a fantasy skyscraper with appropriate dimensions
        // Following the new size constraints (height: 20-30, width/depth: 5-8)
        const height = 20 + Math.random() * 10; // 20-30 units tall
        const width = 5 + Math.random() * 3;   // 5-8 units wide
        const depth = 5 + Math.random() * 3;   // 5-8 units deep
        
        // Add slight random height variation for organic skyline
        const heightVariation = height * (0.9 + Math.random() * 0.2); // +/- 10% variation
        
        // Create a more interesting building shape - a base with a tapered top
        const buildingGroup = new THREE.Group();
        
        // Base of the building (80% of height)
        const baseHeight = heightVariation * 0.8;
        const baseGeometry = new THREE.BoxGeometry(width, baseHeight, depth);
        
        // Top of the building (20% of height, slightly smaller footprint)
        const topHeight = heightVariation * 0.2;
        const topWidth = width * 0.7;
        const topDepth = depth * 0.7;
        const topGeometry = new THREE.BoxGeometry(topWidth, topHeight, topDepth);
        
        // Use fantasy pastel colors
        const colors = [
            0x8ecae6, // pastel blue
            0xb5e48c, // pastel green
            0xf9c74f, // pastel yellow
            0xffafcc, // pastel pink
            0xcdb4db, // pastel purple
            0xa2d2ff  // light blue
        ];
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        const topColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Create materials with slight emissive glow for magical effect
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.7,
            metalness: 0.2,
            emissive: baseColor,
            emissiveIntensity: 0.1
        });
        
        const topMaterial = new THREE.MeshStandardMaterial({
            color: topColor,
            roughness: 0.5,
            metalness: 0.3,
            emissive: topColor,
            emissiveIntensity: 0.15
        });
        
        // Create meshes
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        
        // Position base and top
        baseMesh.position.y = baseHeight / 2;
        topMesh.position.y = baseHeight + (topHeight / 2);
        
        // Add windows using a simple texture approach
        const windowsGeometry = new THREE.PlaneGeometry(width * 0.9, baseHeight * 0.9);
        const windowsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0xffffcc,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Create window panels for each side
        for (let i = 0; i < 4; i++) {
            const windowPanel = new THREE.Mesh(windowsGeometry, windowsMaterial);
            windowPanel.rotation.y = Math.PI / 2 * i;
            
            // Position slightly in front of the building face
            const offset = (i % 2 === 0) ? depth / 2 + 0.05 : width / 2 + 0.05;
            if (i === 0) windowPanel.position.set(0, baseHeight / 2, offset);
            else if (i === 1) windowPanel.position.set(offset, baseHeight / 2, 0);
            else if (i === 2) windowPanel.position.set(0, baseHeight / 2, -offset);
            else windowPanel.position.set(-offset, baseHeight / 2, 0);
            
            buildingGroup.add(windowPanel);
        }
        
        // Add meshes to group
        buildingGroup.add(baseMesh);
        buildingGroup.add(topMesh);
        
        // Create a group for the skyscraper
        const skyscraperGroup = new THREE.Group();
        skyscraperGroup.position.set(position.x, position.y, position.z);
        skyscraperGroup.add(buildingGroup);
        
        // Add to scene
        this.scene.add(skyscraperGroup);
        
        // Apply a smooth grow-up animation
        this.animateSkyscraperGrowth(skyscraperGroup);
        
        // Store skyscraper data
        const skyscraperData = {
            id,
            group: skyscraperGroup,
            mesh: buildingGroup,
            type: 'fantasy_skyscraper',
            position: { ...position }
        };
        
        // Add to buildings array
        this.buildings.push(skyscraperData);
        
        console.log(`Created fantasy skyscraper at position (${position.x}, ${position.y}, ${position.z})`);
        
        return skyscraperData;
    }
    
    /**
     * Animate a skyscraper growing up from the ground with a smooth animation
     * @param {THREE.Group} skyscraperGroup - The skyscraper group to animate
     */
    animateSkyscraperGrowth(skyscraperGroup) {
        // Store original scale and position
        const originalScale = skyscraperGroup.scale.clone();
        const originalY = skyscraperGroup.position.y;
        
        // Start with very small scale (0.1 → 1.0)
        skyscraperGroup.scale.set(originalScale.x * 0.1, 0.01, originalScale.z * 0.1);
        
        // Store animation start time
        const startTime = Date.now();
        const animationDuration = 2000; // 2 seconds for smoother effect
        
        // Create animation function
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            
            // Elastic ease-out function for a more dynamic, bouncy growth
            // This creates a slight overshoot and settle effect
            const elasticEaseOut = (t) => {
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3);
            };
            
            // Apply elastic easing to the progress
            const easedProgress = elasticEaseOut(progress);
            
            // Scale up in all dimensions with emphasis on vertical growth
            skyscraperGroup.scale.set(
                originalScale.x * (0.1 + 0.9 * easedProgress), // Horizontal X (10% → 100%)
                originalScale.y * easedProgress,               // Vertical (0% → 100%)
                originalScale.z * (0.1 + 0.9 * easedProgress)  // Horizontal Z (10% → 100%)
            );
            
            // Add a slight rotation during growth for more visual interest
            if (progress < 0.7) {
                skyscraperGroup.rotation.y = Math.sin(progress * Math.PI) * 0.05;
            } else {
                // Settle back to straight position
                skyscraperGroup.rotation.y *= 0.9;
            }
            
            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final state is exactly as intended
                skyscraperGroup.scale.copy(originalScale);
                skyscraperGroup.rotation.set(0, 0, 0);
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Transform trees into stylized buildings based on transformation data
     * @param {Object} transformData - Data describing how to transform trees into buildings
     * @param {string} transformData.new_object_type - Type of building to create (e.g., 'simple_building', 'fantasy_tower')
     * @param {number} transformData.scale_up_factor - Factor to scale up the building compared to trees
     * @param {string} transformData.color_scheme - Color scheme to apply (e.g., 'pastel_city', 'soft_neon')
     * @param {string} transformData.transition_animation - Type of animation for the transition
     * @returns {Array} - Array of created building objects
     */
    transformTreesToBuildings(transformData) {
        console.log('Transforming trees to buildings with data:', transformData);
        
        // If no trees, return empty array
        if (this.trees.length === 0) {
            console.log('No trees to transform');
            return [];
        }
        
        // Get all tree positions
        const treePositions = this.trees.map(tree => ({ ...tree.position }));
        
        // Store trees to remove after transformation
        const treesToRemove = [...this.trees];
        
        // Create buildings at tree positions
        const createdBuildings = [];
        
        for (const position of treePositions) {
            // Create a stylized building
            const building = this.createStylizedBuilding(position, transformData);
            createdBuildings.push(building);
        }
        
        // Remove all trees with animation
        this.fadeOutAndRemoveTrees(treesToRemove);
        
        return createdBuildings;
    }
    
    /**
     * Fade out and remove trees with animation
     * @param {Array} trees - Array of tree objects to remove
     */
    fadeOutAndRemoveTrees(trees) {
        // Store animation start time
        const startTime = Date.now();
        const animationDuration = 800; // 0.8 seconds
        
        // Create animation function
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            
            // Ease-in cubic function for smooth fade out
            const easeIn = Math.pow(progress, 3);
            
            // Update scale and opacity for each tree
            for (const tree of trees) {
                if (tree.group) {
                    // Shrink the tree
                    const scale = 1 - easeIn;
                    tree.group.scale.set(scale, scale, scale);
                    
                    // Move it slightly into the ground
                    tree.group.position.y = tree.position.y - (easeIn * 2);
                    
                    // Make it transparent
                    if (tree.trunk && tree.trunk.material) {
                        tree.trunk.material.transparent = true;
                        tree.trunk.material.opacity = 1 - easeIn;
                    }
                    
                    if (tree.leaves && tree.leaves.material) {
                        tree.leaves.material.transparent = true;
                        tree.leaves.material.opacity = 1 - easeIn;
                    }
                }
            }
            
            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove all trees from the scene
                for (const tree of trees) {
                    this.scene.remove(tree.group);
                }
                
                // Clear the trees array
                this.trees = [];
                console.log('All trees removed after fade-out animation');
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Create a stylized building based on transformation data
     * @param {Object} position - Position {x, y, z} to place the building
     * @param {Object} transformData - Data describing how to transform trees into buildings
     * @returns {Object} - The created building object with ID
     */
    createStylizedBuilding(position, transformData) {
        const id = `building_${this.buildingIdCounter++}`;
        
        // Get ground height if y is not specified
        if (position.y === undefined && this.groundManager) {
            position.y = this.groundManager.getHeightAt(position.x, position.z);
        }
        
        // Create building group
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(position.x, position.y, position.z);
        
        // Get building properties based on transformation data
        const buildingProps = this.getBuildingPropertiesFromTransform(transformData);
        
        // Create the building mesh based on the object type
        let buildingMesh;
        
        switch(transformData.new_object_type) {
            case 'fantasy_tower':
                buildingMesh = this.createFantasyTower(buildingProps);
                break;
                
            case 'simple_building':
                buildingMesh = this.createSimpleBuilding(buildingProps);
                break;
                
            case 'magical_structure':
                buildingMesh = this.createMagicalStructure(buildingProps);
                break;
                
            default:
                // Default to simple building
                buildingMesh = this.createSimpleBuilding(buildingProps);
        }
        
        // Add to group
        buildingGroup.add(buildingMesh);
        
        // Add to scene
        this.scene.add(buildingGroup);
        
        // Apply animation based on transition type
        this.animateBuildingTransition(buildingMesh, transformData.transition_animation);
        
        // Add particle effect if specified
        if (transformData.particle_effect) {
            this.addBuildingParticleEffect(buildingGroup, transformData.particle_effect);
        }
        
        // Store building data
        const buildingData = {
            id,
            group: buildingGroup,
            mesh: buildingMesh,
            type: transformData.new_object_type,
            position: { ...position }
        };
        
        this.buildings.push(buildingData);
        return buildingData;
    }
    
    /**
     * Get building properties based on transformation data
     * @param {Object} transformData - Data describing how to transform trees into buildings
     * @returns {Object} - Properties for building creation
     */
    getBuildingPropertiesFromTransform(transformData) {
        // Default properties
        const props = {
            width: 5,
            height: 15,
            depth: 5,
            color: 0xAAAAAA,
            scale: 1.0,
            emissive: false,
            roughness: 0.7,
            metalness: 0.2
        };
        
        // Apply scale factor
        if (transformData.scale_up_factor) {
            props.scale = transformData.scale_up_factor;
            props.width *= props.scale;
            props.height *= props.scale;
            props.depth *= props.scale;
        }
        
        // Apply color scheme
        if (transformData.color_scheme) {
            props.color = this.getColorFromScheme(transformData.color_scheme);
            
            // Add emissive for neon schemes
            if (transformData.color_scheme.includes('neon')) {
                props.emissive = true;
                props.roughness = 0.4;
                props.metalness = 0.5;
            }
        }
        
        return props;
    }
    
    /**
     * Get a color from a color scheme
     * @param {string} scheme - Color scheme name
     * @returns {number} - THREE.js color value
     */
    getColorFromScheme(scheme) {
        // Color palettes for different schemes
        const colorSchemes = {
            'pastel_city': [
                0xFFB6C1, // Light pink
                0xADD8E6, // Light blue
                0x98FB98, // Pale green
                0xFFDAB9, // Peach
                0xE6E6FA  // Lavender
            ],
            'soft_neon': [
                0xFF00FF, // Magenta
                0x00FFFF, // Cyan
                0xFFFF00, // Yellow
                0x00FF00, // Green
                0xFF00AA  // Pink
            ],
            'fairytale': [
                0xE0BBE4, // Lavender
                0x957DAD, // Purple
                0xD291BC, // Pink
                0xFEC8D8, // Light pink
                0xFADFAC  // Peach
            ],
            'medieval': [
                0x8B4513, // Brown
                0x708090, // Slate gray
                0xCD853F, // Peru
                0xBC8F8F, // Rosy brown
                0x4B3621  // Dark brown
            ]
        };
        
        // Get the color array for the scheme, or default to pastel_city
        const colorArray = colorSchemes[scheme] || colorSchemes.pastel_city;
        
        // Return a random color from the array
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    }
    
    /**
     * Create a simple building mesh
     * @param {Object} props - Building properties
     * @returns {THREE.Mesh} - Building mesh
     */
    createSimpleBuilding(props) {
        // Create a simple box
        const geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: props.color,
            roughness: props.roughness,
            metalness: props.metalness,
            emissive: props.emissive ? props.color : 0x000000,
            emissiveIntensity: props.emissive ? 0.3 : 0
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = props.height / 2; // Position at ground level
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Start with scale 0 for animation
        mesh.scale.set(0.01, 0.01, 0.01);
        
        return mesh;
    }
    
    /**
     * Create a fantasy tower mesh
     * @param {Object} props - Building properties
     * @returns {THREE.Group} - Tower group
     */
    createFantasyTower(props) {
        // Create a group for the tower parts
        const towerGroup = new THREE.Group();
        
        // Create the main tower body
        const bodyGeometry = new THREE.CylinderGeometry(props.width/2, props.width/1.5, props.height, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: props.color,
            roughness: props.roughness,
            metalness: props.metalness,
            emissive: props.emissive ? props.color : 0x000000,
            emissiveIntensity: props.emissive ? 0.3 : 0
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = props.height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        
        // Create the tower roof (cone)
        const roofGeometry = new THREE.ConeGeometry(props.width/1.8, props.height/3, 8);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: props.color * 0.8, // Slightly darker than the body
            roughness: props.roughness,
            metalness: props.metalness + 0.1,
            emissive: props.emissive ? props.color : 0x000000,
            emissiveIntensity: props.emissive ? 0.4 : 0
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = props.height + props.height/6;
        roof.castShadow = true;
        
        // Add parts to the group
        towerGroup.add(body);
        towerGroup.add(roof);
        
        // Start with scale 0 for animation
        towerGroup.scale.set(0.01, 0.01, 0.01);
        
        return towerGroup;
    }
    
    /**
     * Create a magical structure mesh
     * @param {Object} props - Building properties
     * @returns {THREE.Group} - Structure group
     */
    createMagicalStructure(props) {
        // Create a group for the structure parts
        const structureGroup = new THREE.Group();
        
        // Create the base (box)
        const baseGeometry = new THREE.BoxGeometry(props.width, props.height/4, props.depth);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: props.color,
            roughness: props.roughness,
            metalness: props.metalness,
            emissive: props.emissive ? props.color : 0x000000,
            emissiveIntensity: props.emissive ? 0.3 : 0
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = props.height/8;
        base.castShadow = true;
        base.receiveShadow = true;
        
        // Create the crystal (octahedron)
        const crystalGeometry = new THREE.OctahedronGeometry(props.width/1.5, 0);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: props.color,
            roughness: 0.2, // More shiny
            metalness: 0.8, // More metallic
            transparent: true,
            opacity: 0.8,
            emissive: props.color,
            emissiveIntensity: 0.5
        });
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = props.height/2 + props.height/4;
        crystal.castShadow = true;
        
        // Add parts to the group
        structureGroup.add(base);
        structureGroup.add(crystal);
        
        // Start with scale 0 for animation
        structureGroup.scale.set(0.01, 0.01, 0.01);
        
        return structureGroup;
    }
    
    /**
     * Animate building transition
     * @param {THREE.Object3D} object - Object to animate
     * @param {string} animationType - Type of animation
     */
    animateBuildingTransition(object, animationType) {
        // Store animation start time
        const startTime = Date.now();
        const animationDuration = 1000; // 1 second
        
        // Create animation function
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            
            // Different animation types
            switch(animationType) {
                case 'grow_taller':
                    // Grow from bottom to top
                    object.scale.set(
                        progress,
                        progress,
                        progress
                    );
                    break;
                    
                case 'grow_taller_and_squarer':
                    // Grow with slight bounce
                    const bounceScale = progress === 1 ? 1 : progress * (1 + Math.sin(progress * Math.PI) * 0.1);
                    object.scale.set(
                        bounceScale,
                        bounceScale,
                        bounceScale
                    );
                    break;
                    
                case 'spiral_up':
                    // Grow while rotating
                    object.scale.set(
                        progress,
                        progress,
                        progress
                    );
                    object.rotation.y = progress * Math.PI * 2; // Full rotation
                    break;
                    
                default:
                    // Default simple scale up
                    object.scale.set(
                        progress,
                        progress,
                        progress
                    );
            }
            
            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Add particle effect to a building
     * @param {THREE.Group} buildingGroup - Building group to add particles to
     * @param {string} effectType - Type of particle effect
     */
    addBuildingParticleEffect(buildingGroup, effectType) {
        // Create a simple sparkle effect using points
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        // Create random positions around the building
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            particlePositions[i3] = (Math.random() - 0.5) * 10; // x
            particlePositions[i3 + 1] = Math.random() * 20; // y
            particlePositions[i3 + 2] = (Math.random() - 0.5) * 10; // z
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        // Create material based on effect type
        let particleMaterial;
        
        switch(effectType) {
            case 'sparkles':
                particleMaterial = new THREE.PointsMaterial({
                    color: 0xFFFFFF,
                    size: 0.5,
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending
                });
                break;
                
            case 'magic':
                particleMaterial = new THREE.PointsMaterial({
                    color: 0xFF00FF, // Magenta
                    size: 0.7,
                    transparent: true,
                    opacity: 0.6,
                    blending: THREE.AdditiveBlending
                });
                break;
                
            default:
                particleMaterial = new THREE.PointsMaterial({
                    color: 0xFFFFFF,
                    size: 0.5,
                    transparent: true,
                    opacity: 0.5
                });
        }
        
        // Create particle system
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        buildingGroup.add(particles);
        
        // Animate particles
        const startTime = Date.now();
        
        const animateParticles = () => {
            const positions = particleGeometry.attributes.position.array;
            const time = Date.now() - startTime;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] = Math.sin((time + i * 100) * 0.003) * 2 + positions[i3 + 1]; // y
            }
            
            particleGeometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
    
    /**
     * Add a tree to the scene
     * @param {Object} position - Position {x, y, z} to place the tree
     * @param {Object} options - Optional parameters for customization
     * @returns {Object} - The created tree object with ID
     */
    addTree(position, options = {}) {
        const id = `tree_${this.treeIdCounter++}`;
        const scale = options.scale || 1.0;
        const leafColor = options.leafColor || this.leafColors[Math.floor(Math.random() * this.leafColors.length)];
        
        // Get ground height if y is not specified
        if (position.y === undefined && this.groundManager) {
            position.y = this.groundManager.getHeightAt(position.x, position.z);
        }
        
        // Create tree group
        const treeGroup = new THREE.Group();
        treeGroup.position.set(position.x, position.y, position.z);
        
        // Create tree trunk (cylinder)
        const trunkGeometry = new THREE.CylinderGeometry(1 * scale, 1.5 * scale, 10 * scale, 8);
        const trunk = new THREE.Mesh(trunkGeometry, this.treeTrunkMaterial);
        trunk.position.y = 5 * scale; // Half the height of the trunk
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Create leaves (several spheres with different colors)
        const leaves = [];
        for (let i = 0; i < 5; i++) {
            const leafSize = (3 + Math.random() * 2) * scale;
            const leafGeometry = new THREE.SphereGeometry(leafSize, 8, 8);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: options.leafColor || this.leafColors[i % this.leafColors.length],
                roughness: 0.7,
                metalness: 0.3,
                emissive: options.leafColor || this.leafColors[i % this.leafColors.length],
                emissiveIntensity: 0.2
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position leaves on top of trunk with some variation
            const angle = (i / 5) * Math.PI * 2;
            const radius = (2 + Math.random()) * scale;
            leaf.position.set(
                Math.cos(angle) * radius,
                10 * scale + Math.random() * 3 * scale,
                Math.sin(angle) * radius
            );
            
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            treeGroup.add(leaf);
            leaves.push(leaf);
        }
        
        // Add to scene
        this.scene.add(treeGroup);
        
        // Store tree data
        const treeData = {
            id,
            group: treeGroup,
            trunk,
            leaves,
            position: { ...position }
        };
        
        this.trees.push(treeData);
        return treeData;
    }
    
    /**
     * Remove a tree from the scene
     * @param {string} treeId - ID of the tree to remove
     * @returns {boolean} - True if tree was found and removed
     */
    removeTree(treeId) {
        const index = this.trees.findIndex(tree => tree.id === treeId);
        if (index !== -1) {
            const tree = this.trees[index];
            this.scene.remove(tree.group);
            this.trees.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Add a rock to the scene
     * @param {Object} position - Position {x, y, z} to place the rock
     * @param {Object} options - Optional parameters for customization
     * @returns {Object} - The created rock object with ID
     */
    addRock(position, options = {}) {
        const id = `rock_${this.rockIdCounter++}`;
        const scale = options.scale || (0.8 + Math.random() * 1.2);
        const color = options.color || 0x808080;
        
        // Get ground height if y is not specified
        if (position.y === undefined && this.groundManager) {
            position.y = this.groundManager.getHeightAt(position.x, position.z);
        }
        
        // Create rock geometry with random shape
        const rockGeometry = new THREE.DodecahedronGeometry(scale * 2, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.9,
            metalness: 0.2
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(position.x, position.y + scale, position.z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        // Add to scene
        this.scene.add(rock);
        
        // Store rock data
        const rockData = {
            id,
            mesh: rock,
            position: { ...position },
            scale
        };
        
        this.rocks.push(rockData);
        return rockData;
    }
    
    /**
     * Remove a rock from the scene
     * @param {string} rockId - ID of the rock to remove
     * @returns {boolean} - True if rock was found and removed
     */
    removeRock(rockId) {
        const index = this.rocks.findIndex(rock => rock.id === rockId);
        if (index !== -1) {
            const rock = this.rocks[index];
            this.scene.remove(rock.mesh);
            this.rocks.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Add a platform to the scene
     * @param {Object} position - Position {x, y, z} to place the platform
     * @param {Object} options - Optional parameters for customization
     * @returns {Object} - The created platform object with ID
     */
    addPlatform(position, options = {}) {
        const id = `platform_${this.platformIdCounter++}`;
        const size = options.size || { width: 5, height: 1, depth: 5 };
        const color = options.color || 0x795548; // Brown
        const glowColor = options.glowColor || 0x00BCD4; // Cyan
        
        // Create platform group
        const platformGroup = new THREE.Group();
        platformGroup.position.set(position.x, position.y, position.z);
        
        // Create platform base
        const platformGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.castShadow = true;
        platform.receiveShadow = true;
        platformGroup.add(platform);
        
        // Add some magical glow effect
        const glowGeometry = new THREE.BoxGeometry(size.width * 1.04, size.height * 0.2, size.depth * 1.04);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: glowColor,
            emissive: glowColor,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = -0.6;
        platformGroup.add(glow);
        
        // Add to scene
        this.scene.add(platformGroup);
        
        // Store platform data
        const platformData = {
            id,
            group: platformGroup,
            platform,
            glow,
            position: { ...position },
            size
        };
        
        this.platforms.push(platformData);
        return platformData;
    }
    
    /**
     * Remove a platform from the scene
     * @param {string} platformId - ID of the platform to remove
     * @returns {boolean} - True if platform was found and removed
     */
    removePlatform(platformId) {
        const index = this.platforms.findIndex(platform => platform.id === platformId);
        if (index !== -1) {
            const platform = this.platforms[index];
            this.scene.remove(platform.group);
            this.platforms.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Add a floating island to the scene
     * @param {Object} position - Position {x, y, z} to place the island
     * @param {Object} options - Optional parameters for customization
     * @returns {Object} - The created island object with ID
     */
    addFloatingIsland(position, options = {}) {
        const id = `island_${this.islandIdCounter++}`;
        const size = options.size || 15 + Math.random() * 10;
        const color = options.color || 0x8BC34A; // Light green
        
        // Create island group
        const islandGroup = new THREE.Group();
        islandGroup.position.set(position.x, position.y, position.z);
        
        // Create island base (sphere with noise)
        const islandGeometry = new THREE.SphereGeometry(size, 16, 16);
        
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
            color: color,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        island.castShadow = true;
        island.receiveShadow = true;
        islandGroup.add(island);
        
        // Add some vegetation to the island
        if (options.addVegetation !== false) {
            const treeCount = Math.floor(size / 5);
            for (let i = 0; i < treeCount; i++) {
                // Create small tree trunk
                const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 6);
                const trunk = new THREE.Mesh(trunkGeometry, this.treeTrunkMaterial);
                
                // Position on top of island with some variation
                const angle = (i / treeCount) * Math.PI * 2;
                const radius = size * 0.7;
                trunk.position.set(
                    Math.cos(angle) * radius,
                    size * 0.5,
                    Math.sin(angle) * radius
                );
                trunk.lookAt(0, 0, 0); // Orient trunk to point away from center
                trunk.castShadow = true;
                islandGroup.add(trunk);
                
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
                islandGroup.add(leaf);
            }
        }
        
        // Add to scene
        this.scene.add(islandGroup);
        
        // Store island data
        const islandData = {
            id,
            group: islandGroup,
            island,
            position: { ...position },
            size
        };
        
        this.floatingIslands.push(islandData);
        return islandData;
    }
    
    /**
     * Remove a floating island from the scene
     * @param {string} islandId - ID of the island to remove
     * @returns {boolean} - True if island was found and removed
     */
    removeFloatingIsland(islandId) {
        const index = this.floatingIslands.findIndex(island => island.id === islandId);
        if (index !== -1) {
            const island = this.floatingIslands[index];
            this.scene.remove(island.group);
            this.floatingIslands.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Add a cloud to the scene
     * @param {Object} position - Position {x, y, z} to place the cloud
     * @param {Object} options - Optional parameters for customization
     * @returns {Object} - The created cloud object with ID
     */
    addCloud(position, options = {}) {
        const id = `cloud_${this.cloudIdCounter++}`;
        const scale = options.scale || 1.0;
        const color = options.color || 0xFFFFFF;
        
        // Create cloud group
        const cloudGroup = new THREE.Group();
        cloudGroup.position.set(position.x, position.y, position.z);
        
        // Create cloud puffs (several spheres grouped together)
        const puffCount = 5 + Math.floor(Math.random() * 5);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        
        for (let i = 0; i < puffCount; i++) {
            const puffSize = (3 + Math.random() * 3) * scale;
            const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
            const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
            
            // Position puffs with some variation
            puff.position.set(
                (Math.random() - 0.5) * 10 * scale,
                (Math.random() - 0.5) * 5 * scale,
                (Math.random() - 0.5) * 10 * scale
            );
            
            cloudGroup.add(puff);
        }
        
        // Add to scene
        this.scene.add(cloudGroup);
        
        // Store cloud data
        const cloudData = {
            id,
            group: cloudGroup,
            position: { ...position },
            scale
        };
        
        this.clouds.push(cloudData);
        return cloudData;
    }
    
    /**
     * Remove a cloud from the scene
     * @param {string} cloudId - ID of the cloud to remove
     * @returns {boolean} - True if cloud was found and removed
     */
    removeCloud(cloudId) {
        const index = this.clouds.findIndex(cloud => cloud.id === cloudId);
        if (index !== -1) {
            const cloud = this.clouds[index];
            this.scene.remove(cloud.group);
            this.clouds.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Add a building to the scene
     * @param {string} modelUrl - URL of the 3D model
     * @param {Object} position - Position {x, y, z} to place the building
     * @param {Object} options - Optional parameters for customization
     * @returns {Object} - The created building object with ID
     */
    addBuilding(modelUrl, position, options = {}) {
        const id = `building_${this.buildingIdCounter++}`;
        const scale = options.scale || 1.0;
        
        // Get ground height if y is not specified
        if (position.y === undefined && this.groundManager) {
            position.y = this.groundManager.getHeightAt(position.x, position.z);
        }
        
        // Create building group
        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(position.x, position.y, position.z);
        
        // Load 3D model
        const loader = new THREE.GLTFLoader();
        
        // Create placeholder while loading
        const placeholderGeometry = new THREE.BoxGeometry(5 * scale, 10 * scale, 5 * scale);
        const placeholderMaterial = new THREE.MeshBasicMaterial({
            color: 0xCCCCCC,
            wireframe: true
        });
        const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
        buildingGroup.add(placeholder);
        
        // Add to scene immediately with placeholder
        this.scene.add(buildingGroup);
        
        // Store building data with placeholder
        const buildingData = {
            id,
            group: buildingGroup,
            position: { ...position },
            scale,
            loaded: false
        };
        
        this.buildings.push(buildingData);
        
        // Load the actual model
        loader.load(
            modelUrl,
            (gltf) => {
                // Remove placeholder
                buildingGroup.remove(placeholder);
                
                // Add model to group
                const model = gltf.scene;
                model.scale.set(scale, scale, scale);
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                buildingGroup.add(model);
                buildingData.model = model;
                buildingData.loaded = true;
            },
            (xhr) => {
                // Loading progress
                console.log(`${modelUrl}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
                // Error handling
                console.error('Error loading building model:', error);
            }
        );
        
        return buildingData;
    }
    
    /**
     * Remove a building from the scene
     * @param {string} buildingId - ID of the building to remove
     * @returns {boolean} - True if building was found and removed
     */
    removeBuilding(buildingId) {
        const index = this.buildings.findIndex(building => building.id === buildingId);
        if (index !== -1) {
            const building = this.buildings[index];
            this.scene.remove(building.group);
            this.buildings.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Update animations for all environment objects
     * @param {number} elapsedTime - Elapsed time in seconds
     */
    update(elapsedTime) {
        // Animate clouds
        this.clouds.forEach((cloud, index) => {
            cloud.group.position.x += Math.sin(elapsedTime * 0.1 + index) * 0.05;
            cloud.group.position.y += Math.cos(elapsedTime * 0.1 + index) * 0.02;
        });
        
        // Animate floating islands
        this.floatingIslands.forEach((island, index) => {
            island.group.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.02;
            island.group.rotation.y += 0.001;
        });
        
        // Animate platform glow
        this.platforms.forEach((platform, index) => {
            platform.glow.position.y = -0.6 + Math.sin(elapsedTime * 2 + index) * 0.1;
            platform.glow.material.emissiveIntensity = 0.3 + Math.sin(elapsedTime * 3 + index) * 0.2;
        });
    }
    
    /**
     * Clear all environment objects from the scene
     */
    clearAll() {
        // Remove all trees
        this.trees.forEach(tree => this.scene.remove(tree.group));
        this.trees = [];
        
        // Remove all rocks
        this.rocks.forEach(rock => this.scene.remove(rock.mesh));
        this.rocks = [];
        
        // Remove all platforms
        this.platforms.forEach(platform => this.scene.remove(platform.group));
        this.platforms = [];
        
        // Remove all floating islands
        this.floatingIslands.forEach(island => this.scene.remove(island.group));
        this.floatingIslands = [];
        
        // Remove all clouds
        this.clouds.forEach(cloud => this.scene.remove(cloud.group));
        this.clouds = [];
        
        // Remove all buildings
        this.buildings.forEach(building => this.scene.remove(building.group));
        this.buildings = [];
    }
}

// Export the EnvironmentManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnvironmentManager };
}
