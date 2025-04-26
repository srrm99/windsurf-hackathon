/**
 * PlayerManager.js
 * Responsible for managing the player character in the 3D scene.
 * Handles player mesh, physics, movement, and controls.
 * Now uses the improved PlayerCharacter class for a more human-like appearance.
 */

class PlayerManager {
    /**
     * Create a player manager
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {GroundManager} groundManager - Reference to the ground manager for collision detection
     */
    constructor(scene, groundManager) {
        this.scene = scene;
        this.groundManager = groundManager;
        
        // Physics properties
        this.position = new THREE.Vector3(0, 10, 0); // Start position (x, y, z)
        this.velocity = new THREE.Vector3(0, 0, 0); // Velocity vector
        this.acceleration = new THREE.Vector3(0, 0, 0); // Acceleration vector
        this.gravity = -20; // Gravity strength
        this.jumpForce = 10; // Jump strength
        this.moveSpeed = 10; // Movement speed
        this.friction = 0.9; // Friction for smooth deceleration (0-1)
        this.isGrounded = false; // Whether player is on ground
        
        // Control state
        this.keys = {
            left: false,
            right: false,
            jump: false
        };
        
        // Initialize player character
        this.playerCharacter = null;
        this.playerMesh = null;
        this.createPlayer();
        this.setupControls();
        
        console.log('PlayerManager initialized');
    }
    
    /**
     * Create the player character
     */
    createPlayer() {
        // Remove existing player if any
        if (this.playerMesh) {
            this.scene.remove(this.playerMesh);
        }
        
        // Create a new player character with teletubby-style proportions
        this.playerCharacter = new PlayerCharacter({
            // Character dimensions (teletubby-style)
            height: 2,                // Total character height
            headSize: 0.5,            // Head radius (slightly larger for cartoon look)
            bodyHeight: 0.8,          // Torso height
            bodyWidth: 0.5,           // Torso width (wider for teletubby look)
            bodyDepth: 0.4,           // Torso depth (rounder for teletubby look)
            legHeight: 0.5,           // Leg height (shorter, stubby legs)
            legWidth: 0.18,           // Leg width (thicker legs)
            legDepth: 0.18,           // Leg depth
            armHeight: 0.5,           // Arm height (shorter arms)
            armWidth: 0.15,           // Arm width
            armDepth: 0.15,           // Arm depth
            backpackSize: 0.3,        // Backpack size
            eyeSize: 0.06,            // Eye size
            
            // Character colors
            headColor: 0xE91E63,      // Pink head (teletubby-like)
            bodyColor: 0xE91E63,      // Pink body (matching head)
            legColor: 0x9C27B0,       // Purple legs
            armColor: 0xE91E63,       // Pink arms (matching body)
            backpackColor: 0x4CAF50,  // Green backpack
            eyeColor: 0x000000,       // Black eyes
            
            // Physics settings
            jumpHeight: this.jumpForce,
            moveSpeed: this.moveSpeed
        });
        
        // Get the mesh from the character
        this.playerMesh = this.playerCharacter.getMesh();
        
        // Set initial position
        this.playerMesh.position.copy(this.position);
        
        // Add to scene
        this.scene.add(this.playerMesh);
        
        console.log('Player character created at position:', this.position);
    }
    
    /**
     * Setup keyboard controls
     */
    setupControls() {
        // Keydown event
        window.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.jump = true;
                    break;
            }
        });
        
        // Keyup event
        window.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.jump = false;
                    break;
            }
        });
        
        console.log('Player controls initialized');
    }
    
    /**
     * Check if player is on ground
     * @returns {boolean} - Whether player is on ground
     */
    checkGroundCollision() {
        if (!this.groundManager || !this.groundManager.groundMesh) {
            return false;
        }
        
        // Get ground height at player position
        const groundHeight = this.getGroundHeightAt(this.position.x, this.position.z);
        
        // Check if player is on or below ground level (with small buffer for stability)
        const playerBottom = this.position.y - 1; // Adjust for character height
        const isOnGround = playerBottom <= groundHeight + 0.1;
        
        return isOnGround;
    }
    
    /**
     * Get ground height at a specific x,z position
     * @param {number} x - X position
     * @param {number} z - Z position
     * @returns {number} - Height of ground at position
     */
    getGroundHeightAt(x, z) {
        if (!this.groundManager || !this.groundManager.groundMesh) {
            return 0;
        }
        
        // Get the ground mesh
        const groundMesh = this.groundManager.groundMesh;
        
        // Create a raycaster pointing down
        const raycaster = new THREE.Raycaster(
            new THREE.Vector3(x, 100, z), // Start high above the ground
            new THREE.Vector3(0, -1, 0), // Point downward
            0,
            200
        );
        
        // Check for intersection with ground
        const intersects = raycaster.intersectObject(groundMesh);
        
        if (intersects.length > 0) {
            return intersects[0].point.y;
        }
        
        // Fallback to 0 if no intersection found
        return 0;
    }
    
    /**
     * Apply jump force if grounded
     */
    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            console.log('Player jumped');
        }
    }
    
    /**
     * Update player physics and movement
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Cap delta time to avoid huge jumps after pauses
        const dt = Math.min(deltaTime, 0.1);
        
        // Apply gravity
        this.acceleration.y = this.gravity;
        
        // Handle movement input with smooth acceleration
        this.acceleration.x = 0;
        
        if (this.keys.left) {
            this.acceleration.x = -this.moveSpeed * 4;
            
            // Use the PlayerCharacter's moveLeft method for animation
            if (this.playerCharacter) {
                this.playerCharacter.moveLeft(dt);
            }
        }
        if (this.keys.right) {
            this.acceleration.x = this.moveSpeed * 4;
            
            // Use the PlayerCharacter's moveRight method for animation
            if (this.playerCharacter) {
                this.playerCharacter.moveRight(dt);
            }
        }
        
        // Handle jump input
        if (this.keys.jump && this.isGrounded) {
            this.jump();
            
            // Use the PlayerCharacter's jump method for animation
            if (this.playerCharacter) {
                this.playerCharacter.jump();
            }
        }
        
        // Update velocity with acceleration
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;
        
        // Apply friction to horizontal movement
        this.velocity.x *= this.friction;
        
        // Update position with velocity
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        
        // Check ground collision
        this.isGrounded = this.checkGroundCollision();
        
        // If on ground, stop falling and place on ground
        if (this.isGrounded) {
            const groundHeight = this.getGroundHeightAt(this.position.x, this.position.z);
            this.position.y = groundHeight + 1; // Adjust for character height
            this.velocity.y = 0;
        }
        
        // Update player mesh position
        if (this.playerMesh) {
            this.playerMesh.position.copy(this.position);
            
            // Update the PlayerCharacter's animation
            if (this.playerCharacter && !this.keys.left && !this.keys.right) {
                this.playerCharacter.update(dt);
            }
        }
    }
    
    /**
     * Apply jump force if grounded
     */
    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            console.log('Player jumped');
        }
    }
    
    /**
     * Change player color
     * @param {string|number} colorHex - Color in hex format
     */
    changePlayerColor(colorHex) {
        // Convert string hex to number if needed
        if (typeof colorHex === 'string') {
            colorHex = colorHex.replace('#', '0x');
            colorHex = parseInt(colorHex, 16);
        }
        
        // Use the PlayerCharacter's changeColors method
        if (this.playerCharacter) {
            this.playerCharacter.changeColors({
                bodyColor: colorHex
            });
        }
    }
}

// Export the PlayerManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerManager };
}
