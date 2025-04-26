/**
 * GroundManager.js
 * Responsible for managing the ground/terrain in the 3D scene.
 * Controls ground mesh, textures, colors, and terrain features.
 */

class GroundManager {
    /**
     * Create a ground manager
     * @param {THREE.Scene} scene - The Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        this.groundMesh = null;
        this.detailMesh = null;
        this.groundColor = 0x4CAF50; // Default ground color (green)
        this.groundSize = 500;
        this.groundSegments = 128;
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        
        // Initialize with default ground
        this.initDefaultGround();
    }
    
    /**
     * Initialize the default ground (rolling hills)
     */
    initDefaultGround() {
        this.createRollingHills();
    }
    
    /**
     * Create rolling hills terrain
     */
    createRollingHills() {
        // Remove existing ground if any
        this.removeGround();
        
        // Create a large ground plane with hills
        const geometry = new THREE.PlaneGeometry(this.groundSize, this.groundSize, this.groundSegments, this.groundSegments);
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
            color: this.groundColor,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: false,
        });
        
        // Create mesh and add to scene
        this.groundMesh = new THREE.Mesh(geometry, material);
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);
        
        // Add a second layer with more vibrant green for visual interest
        this.addDetailLayer();
    }
    
    /**
     * Add a detail layer on top of the ground for visual interest
     */
    addDetailLayer() {
        const detailGeometry = new THREE.PlaneGeometry(this.groundSize, this.groundSize, this.groundSegments, this.groundSegments);
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
            color: 0x66BB6A, // Slightly different green
            roughness: 0.7,
            metalness: 0.1,
            flatShading: true,
            transparent: true,
            opacity: 0.7,
        });
        
        // Create mesh and add to scene
        this.detailMesh = new THREE.Mesh(detailGeometry, detailMaterial);
        this.detailMesh.receiveShadow = true;
        this.scene.add(this.detailMesh);
    }
    
    /**
     * Remove the ground from the scene
     */
    removeGround() {
        if (this.groundMesh) {
            this.scene.remove(this.groundMesh);
            this.groundMesh = null;
        }
        
        if (this.detailMesh) {
            this.scene.remove(this.detailMesh);
            this.detailMesh = null;
        }
    }
    
    /**
     * Change the ground color
     * @param {string|number} colorHex - Color in hex format (e.g., '#4CAF50' or 0x4CAF50)
     */
    changeGroundColor(colorHex) {
        // Convert string hex to number if needed
        if (typeof colorHex === 'string') {
            colorHex = colorHex.replace('#', '0x');
            colorHex = parseInt(colorHex, 16);
        }
        
        this.groundColor = colorHex;
        
        // Update ground material
        if (this.groundMesh) {
            this.groundMesh.material.color.set(this.groundColor);
        }
    }
    
    /**
     * Change the ground texture
     * @param {string} textureUrl - URL of the texture
     */
    changeGroundTexture(textureUrl) {
        // Load texture if not already loaded
        if (!this.textures[textureUrl]) {
            this.textureLoader.load(textureUrl, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(this.groundSize / 20, this.groundSize / 20);
                
                this.textures[textureUrl] = texture;
                this.applyGroundTexture(texture);
            });
        } else {
            // Use already loaded texture
            this.applyGroundTexture(this.textures[textureUrl]);
        }
    }
    
    /**
     * Apply a texture to the ground
     * @param {THREE.Texture} texture - The texture to apply
     */
    applyGroundTexture(texture) {
        if (this.groundMesh) {
            this.groundMesh.material.map = texture;
            this.groundMesh.material.needsUpdate = true;
        }
    }
    
    /**
     * Make the ground more bumpy
     * @param {number} intensity - Intensity of the bumpiness (0-1)
     */
    makeGroundBumpy(intensity = 0.5) {
        if (!this.groundMesh) return;
        
        // Scale intensity to a reasonable range
        intensity = Math.max(0, Math.min(1, intensity)) * 2;
        
        // Update vertices for more pronounced hills
        const vertices = this.groundMesh.geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Create more pronounced hills using sine waves
            vertices[i + 1] = 
                5 * Math.sin(x * 0.05) * intensity + 
                3 * Math.sin(z * 0.08) * intensity +
                2 * Math.sin(x * 0.02 + z * 0.03) * intensity +
                1 * Math.sin(x * 0.1 + z * 0.05) * intensity;
        }
        
        // Update geometry
        this.groundMesh.geometry.attributes.position.needsUpdate = true;
        
        // Update detail layer if it exists
        if (this.detailMesh) {
            const detailVertices = this.detailMesh.geometry.attributes.position.array;
            for (let i = 0; i < detailVertices.length; i += 3) {
                const x = detailVertices[i];
                const z = detailVertices[i + 2];
                
                detailVertices[i + 1] = 
                    5 * Math.sin(x * 0.05) * intensity + 
                    3 * Math.sin(z * 0.08) * intensity +
                    2 * Math.sin(x * 0.02 + z * 0.03) * intensity +
                    1 * Math.sin(x * 0.1 + z * 0.05) * intensity + 0.2;
            }
            
            this.detailMesh.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    /**
     * Make the ground flatter
     */
    makeGroundFlat() {
        if (!this.groundMesh) return;
        
        // Update vertices for flat ground
        const vertices = this.groundMesh.geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 1] = 0; // Set height to 0
        }
        
        // Update geometry
        this.groundMesh.geometry.attributes.position.needsUpdate = true;
        
        // Update detail layer if it exists
        if (this.detailMesh) {
            const detailVertices = this.detailMesh.geometry.attributes.position.array;
            for (let i = 0; i < detailVertices.length; i += 3) {
                detailVertices[i + 1] = 0.2; // Set height to 0.2 (slightly above ground)
            }
            
            this.detailMesh.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    /**
     * Create a snowy ground
     */
    makeGroundSnowy() {
        this.changeGroundColor(0xFFFFFF);
        
        // Update material properties for snow
        if (this.groundMesh) {
            this.groundMesh.material.roughness = 0.6;
            this.groundMesh.material.metalness = 0.1;
        }
        
        if (this.detailMesh) {
            this.detailMesh.material.color.set(0xEEEEEE);
            this.detailMesh.material.opacity = 0.5;
        }
    }
    
    /**
     * Create a desert ground
     */
    makeGroundDesert() {
        this.changeGroundColor(0xD2B48C); // Tan/sand color
        
        // Update material properties for desert
        if (this.groundMesh) {
            this.groundMesh.material.roughness = 1.0;
            this.groundMesh.material.metalness = 0.0;
        }
        
        if (this.detailMesh) {
            this.detailMesh.material.color.set(0xE6C78C);
            this.detailMesh.material.opacity = 0.3;
        }
    }
    
    /**
     * Get the height at a specific position based on the terrain
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} - The height at the given position
     */
    getHeightAt(x, z) {
        return 5 * Math.sin(x * 0.05) + 
               3 * Math.sin(z * 0.08) +
               2 * Math.sin(x * 0.02 + z * 0.03) +
               1 * Math.sin(x * 0.1 + z * 0.05);
    }
}

// Export the GroundManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GroundManager };
}
