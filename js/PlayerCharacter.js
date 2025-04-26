/**
 * PlayerCharacter.js
 * 
 * A simple, low-poly teletubby-style character for the fantasy game.
 * Features a cute, cartoon-like appearance with simple shapes.
 */

class PlayerCharacter {
    /**
     * Create a new player character
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Default options
        this.options = Object.assign({
            // Character dimensions
            height: 2,                // Total character height
            headSize: 0.5,            // Head radius
            bodyHeight: 0.8,          // Torso height
            bodyWidth: 0.5,           // Torso width (slightly wider for teletubby look)
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
            
            // Animation settings
            idleAnimationSpeed: 0.5,
            idleAnimationHeight: 0.05,
            
            // Physics settings
            jumpHeight: 5,
            moveSpeed: 5
        }, options);
        
        // Create the character mesh
        this.mesh = new THREE.Group();
        this.createCharacter();
        
        // Animation state
        this.animationTime = 0;
        this.isJumping = false;
        this.isFalling = false;
        this.jumpVelocity = 0;
        this.gravity = 0.2;
        
        console.log('Teletubby-style PlayerCharacter created');
    }
    
    /**
     * Create the character mesh with all body parts
     */
    createCharacter() {
        // Create body (torso) using CapsuleGeometry for a rounder teletubby look
        const bodyGeometry = new THREE.CapsuleGeometry(
            this.options.bodyWidth / 2,    // radius
            this.options.bodyHeight,       // height
            8,                             // radial segments
            8                              // height segments
        );
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.options.bodyColor });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = this.options.bodyHeight / 2;
        this.mesh.add(this.body);
        
        // Create head (sphere for teletubby-like appearance)
        const headGeometry = new THREE.SphereGeometry(this.options.headSize, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: this.options.headColor });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = this.options.bodyHeight + this.options.headSize * 0.8;
        this.mesh.add(this.head);
        
        // Create eyes (two small black spheres)
        const eyeGeometry = new THREE.SphereGeometry(this.options.eyeSize, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: this.options.eyeColor });
        
        // Left eye
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(
            -this.options.headSize * 0.3,
            this.options.bodyHeight + this.options.headSize * 0.9,
            this.options.headSize * 0.8
        );
        this.mesh.add(this.leftEye);
        
        // Right eye
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(
            this.options.headSize * 0.3,
            this.options.bodyHeight + this.options.headSize * 0.9,
            this.options.headSize * 0.8
        );
        this.mesh.add(this.rightEye);
        
        // Create a cute backpack
        const backpackGeometry = new THREE.BoxGeometry(
            this.options.backpackSize,
            this.options.backpackSize * 1.2,
            this.options.backpackSize * 0.6
        );
        const backpackMaterial = new THREE.MeshLambertMaterial({ color: this.options.backpackColor });
        this.backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
        this.backpack.position.set(
            0,
            this.options.bodyHeight * 0.5,
            this.options.bodyDepth * 0.6
        );
        this.mesh.add(this.backpack);
        
        // Create legs (cylinders for stubby teletubby legs)
        const legGeometry = new THREE.CylinderGeometry(
            this.options.legWidth / 2,     // top radius
            this.options.legWidth / 2,     // bottom radius
            this.options.legHeight,        // height
            8                              // segments
        );
        const legMaterial = new THREE.MeshLambertMaterial({ color: this.options.legColor });
        
        // Left leg - position wider for teletubby stance
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(
            -this.options.bodyWidth * 0.4,  // Wider stance
            -this.options.legHeight / 2,
            0
        );
        this.mesh.add(this.leftLeg);
        
        // Right leg - position wider for teletubby stance
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(
            this.options.bodyWidth * 0.4,   // Wider stance
            -this.options.legHeight / 2,
            0
        );
        this.mesh.add(this.rightLeg);
        
        // Create arms (cylinders for rounder teletubby arms)
        const armGeometry = new THREE.CylinderGeometry(
            this.options.armWidth / 2,     // top radius
            this.options.armWidth / 2,     // bottom radius
            this.options.armHeight,        // height
            8                              // segments
        );
        const armMaterial = new THREE.MeshLambertMaterial({ color: this.options.armColor });
        
        // Left arm - position slightly forward and rotated
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.rotation.z = Math.PI / 2 * 0.7;  // Angle outward
        this.leftArm.position.set(
            -this.options.bodyWidth / 2 - this.options.armHeight * 0.3,
            this.options.bodyHeight * 0.6,
            0
        );
        this.mesh.add(this.leftArm);
        
        // Right arm - position slightly forward and rotated
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.rotation.z = -Math.PI / 2 * 0.7;  // Angle outward
        this.rightArm.position.set(
            this.options.bodyWidth / 2 + this.options.armHeight * 0.3,
            this.options.bodyHeight * 0.6,
            0
        );
        this.mesh.add(this.rightArm);
        
        // Add shadow casting for all parts
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Center the mesh at the origin
        this.mesh.position.y = this.options.legHeight / 2;
    }
    
    /**
     * Update character animation
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update animation time
        this.animationTime += deltaTime * this.options.idleAnimationSpeed;
        
        // Apply idle animation (gentle bouncing up/down for teletubby feel)
        if (!this.isJumping && !this.isFalling) {
            const breathingOffset = Math.sin(this.animationTime) * this.options.idleAnimationHeight;
            
            // Body bounce
            this.body.position.y = this.options.bodyHeight / 2 + breathingOffset;
            
            // Head and face elements follow body
            this.head.position.y = this.options.bodyHeight + this.options.headSize * 0.8 + breathingOffset;
            this.leftEye.position.y = this.options.bodyHeight + this.options.headSize * 0.9 + breathingOffset;
            this.rightEye.position.y = this.options.bodyHeight + this.options.headSize * 0.9 + breathingOffset;
            
            // Backpack follows body
            this.backpack.position.y = this.options.bodyHeight * 0.5 + breathingOffset;
            
            // Subtle arm wiggle (more pronounced for teletubby style)
            const armWiggle = Math.sin(this.animationTime) * 0.15;
            this.leftArm.rotation.x = armWiggle;
            this.rightArm.rotation.x = -armWiggle;
        }
        
        // Handle jumping and falling
        if (this.isJumping || this.isFalling) {
            // Apply gravity to jump velocity
            this.jumpVelocity -= this.gravity;
            
            // Move character based on velocity
            this.mesh.position.y += this.jumpVelocity * deltaTime * 60;
            
            // Check if we've reached the peak of the jump
            if (this.isJumping && this.jumpVelocity <= 0) {
                this.isJumping = false;
                this.isFalling = true;
            }
            
            // Check if we've landed
            if (this.isFalling && this.mesh.position.y <= this.options.legHeight / 2) {
                this.mesh.position.y = this.options.legHeight / 2;
                this.isFalling = false;
                this.jumpVelocity = 0;
            }
        }
    }
    
    /**
     * Make the character jump
     */
    jump() {
        if (!this.isJumping && !this.isFalling) {
            this.isJumping = true;
            this.jumpVelocity = this.options.jumpHeight;
            
            // Set jump pose
            this.leftLeg.rotation.x = -Math.PI / 6;
            this.rightLeg.rotation.x = -Math.PI / 6;
            this.leftArm.rotation.x = -Math.PI / 4;
            this.rightArm.rotation.x = -Math.PI / 4;
        }
    }
    
    /**
     * Move the character left
     * @param {number} deltaTime - Time since last frame in seconds
     */
    moveLeft(deltaTime) {
        this.mesh.position.x -= this.options.moveSpeed * deltaTime;
        
        // Set running pose with alternating legs
        const legSwing = Math.sin(this.animationTime * 5) * 0.3;
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;
        
        // Arm swing opposite to legs
        this.leftArm.rotation.x = -legSwing;
        this.rightArm.rotation.x = legSwing;
        
        // Face left
        this.mesh.rotation.y = Math.PI / 2;
    }
    
    /**
     * Move the character right
     * @param {number} deltaTime - Time since last frame in seconds
     */
    moveRight(deltaTime) {
        this.mesh.position.x += this.options.moveSpeed * deltaTime;
        
        // Set running pose with alternating legs
        const legSwing = Math.sin(this.animationTime * 5) * 0.3;
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;
        
        // Arm swing opposite to legs
        this.leftArm.rotation.x = -legSwing;
        this.rightArm.rotation.x = legSwing;
        
        // Face right
        this.mesh.rotation.y = -Math.PI / 2;
    }
    
    /**
     * Reset character position
     */
    resetPosition() {
        this.mesh.position.set(0, this.options.legHeight / 2, 0);
        this.isJumping = false;
        this.isFalling = false;
        this.jumpVelocity = 0;
        
        // Reset all rotations
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.leftArm.rotation.set(0, 0, 0);
        this.rightArm.rotation.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
    }
    
    /**
     * Change character colors
     * @param {Object} colors - New colors for character parts
     */
    changeColors(colors = {}) {
        if (colors.headColor) {
            this.head.material.color.set(colors.headColor);
        }
        
        if (colors.bodyColor) {
            this.body.material.color.set(colors.bodyColor);
            // Match arms to body by default for teletubby style
            if (!colors.armColor) {
                this.leftArm.material.color.set(colors.bodyColor);
                this.rightArm.material.color.set(colors.bodyColor);
            }
        }
        
        if (colors.legColor) {
            this.leftLeg.material.color.set(colors.legColor);
            this.rightLeg.material.color.set(colors.legColor);
        }
        
        if (colors.armColor) {
            this.leftArm.material.color.set(colors.armColor);
            this.rightArm.material.color.set(colors.armColor);
        }
        
        if (colors.backpackColor) {
            this.backpack.material.color.set(colors.backpackColor);
        }
        
        if (colors.eyeColor) {
            this.leftEye.material.color.set(colors.eyeColor);
            this.rightEye.material.color.set(colors.eyeColor);
        }
    }
    
    /**
     * Get the character mesh
     * @returns {THREE.Group} The character mesh
     */
    getMesh() {
        return this.mesh;
    }
}

// Export the PlayerCharacter class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerCharacter };
}
