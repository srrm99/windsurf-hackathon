/**
 * SkyManager.js
 * Responsible for managing the sky appearance in the 3D scene.
 * Controls sky color, skybox texture, and related sky elements.
 */

class SkyManager {
    /**
     * Create a sky manager
     * @param {THREE.Scene} scene - The Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        this.skyColor = 0x87CEEB; // Default sky color (light blue)
        this.skyTexture = null;
        this.skyMesh = null;
        this.fog = null;
        
        // Initialize with default sky
        this.initDefaultSky();
    }
    
    /**
     * Initialize the default sky (color background)
     */
    initDefaultSky() {
        // Set the scene background color
        this.scene.background = new THREE.Color(this.skyColor);
        
        // Add fog for depth
        this.fog = new THREE.FogExp2(this.skyColor, 0.002);
        this.scene.fog = this.fog;
        
        // Add ambient light for overall scene illumination
        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6); // White light with medium intensity
        this.scene.add(this.ambientLight);
    }
    
    /**
     * Change the sky color
     * @param {string|number} colorHex - Color in hex format (e.g., '#87CEEB' or 0x87CEEB)
     */
    changeSkyColor(colorHex) {
        // Convert string hex to number if needed
        if (typeof colorHex === 'string') {
            colorHex = colorHex.replace('#', '0x');
            colorHex = parseInt(colorHex, 16);
        }
        
        this.skyColor = colorHex;
        
        // Update scene background
        this.scene.background = new THREE.Color(this.skyColor);
        
        // Update fog color if it exists
        if (this.fog) this.fog.color.set(this.skyColor);
    }
    
    /**
     * Change the ambient light color
     * @param {string|number} colorHex - Color in hex format (e.g., '#FFFFFF' or 0xFFFFFF)
     * @param {number} intensity - Light intensity (default: 0.6)
     */
    changeAmbientLightColor(colorHex, intensity = 0.6) {
        // Convert string hex to number if needed
        if (typeof colorHex === 'string') {
            colorHex = colorHex.replace('#', '0x');
            colorHex = parseInt(colorHex, 16);
        }
        
        // Update ambient light if it exists
        if (this.ambientLight) {
            this.ambientLight.color.set(colorHex);
            this.ambientLight.intensity = intensity;
            console.log(`Ambient light updated to color: ${colorHex.toString(16)} with intensity: ${intensity}`);
        } else {
            console.warn('Ambient light not initialized');
        }
    }
    
    /**
     * Change the sky to use a skybox texture
     * @param {string|Array} textureUrl - URL of the texture or array of URLs for cubemap
     */
    changeSkyTexture(textureUrl) {
        const textureLoader = new THREE.TextureLoader();
        
        if (Array.isArray(textureUrl) && textureUrl.length === 6) {
            // It's a cubemap (array of 6 textures)
            const loader = new THREE.CubeTextureLoader();
            const cubeTexture = loader.load(textureUrl);
            this.scene.background = cubeTexture;
            this.skyTexture = cubeTexture;
        } else {
            // It's a single texture (equirectangular)
            textureLoader.load(textureUrl, (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.background = texture;
                this.skyTexture = texture;
                
                // Update fog color to match average texture color if needed
                // This is a simplification - in a real app you might want to 
                // analyze the texture to get a good fog color
            });
        }
    }
    
    /**
     * Add a sun to the sky
     * @param {Object} options - Sun options (position, size, color)
     */
    addSun(options = {}) {
        const position = options.position || { x: 100, y: 100, z: 100 };
        const size = options.size || 5;
        const color = options.color || 0xffffcc;
        
        // Create sun geometry and material
        const sunGeometry = new THREE.SphereGeometry(size, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create sun mesh
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(position.x, position.y, position.z);
        
        // Add sun to scene
        this.scene.add(sun);
        this.sun = sun;
        
        // Add a directional light from the sun
        const sunLight = new THREE.DirectionalLight(color, 1);
        sunLight.position.copy(sun.position);
        sunLight.castShadow = true;
        
        // Configure shadow properties
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        
        this.scene.add(sunLight);
        this.sunLight = sunLight;
        
        return sun;
    }
    
    /**
     * Add a moon to the sky
     * @param {Object} options - Moon options (position, size, color)
     */
    addMoon(options = {}) {
        const position = options.position || { x: -100, y: 100, z: -100 };
        const size = options.size || 3;
        const color = options.color || 0xccccff;
        
        // Create moon geometry and material
        const moonGeometry = new THREE.SphereGeometry(size, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create moon mesh
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(position.x, position.y, position.z);
        
        // Add moon to scene
        this.scene.add(moon);
        this.moon = moon;
        
        // Add a soft light from the moon
        const moonLight = new THREE.DirectionalLight(color, 0.3);
        moonLight.position.copy(moon.position);
        moonLight.castShadow = true;
        
        this.scene.add(moonLight);
        this.moonLight = moonLight;
        
        return moon;
    }
    
    /**
     * Remove the sun from the scene
     */
    removeSun() {
        if (this.sun) {
            this.scene.remove(this.sun);
            this.sun = null;
        }
        
        if (this.sunLight) {
            this.scene.remove(this.sunLight);
            this.sunLight = null;
        }
    }
    
    /**
     * Remove the moon from the scene
     */
    removeMoon() {
        if (this.moon) {
            this.scene.remove(this.moon);
            this.moon = null;
        }
        
        if (this.moonLight) {
            this.scene.remove(this.moonLight);
            this.moonLight = null;
        }
    }
    
    /**
     * Set the sky to a day time appearance
     */
    setDaytime() {
        this.changeSkyColor(0x87CEEB); // Light blue
        this.removeMoon();
        this.addSun();
    }
    
    /**
     * Set the sky to a night time appearance
     */
    setNighttime() {
        this.changeSkyColor(0x0a0a2a); // Dark blue
        this.removeSun();
        this.addMoon();
    }
    
    /**
     * Set the sky to a sunset appearance
     */
    setSunset() {
        this.changeSkyColor(0xff7e47); // Orange-red
        
        // Position sun lower in the sky
        if (this.sun) {
            this.sun.position.y = 10;
        } else {
            this.addSun({ position: { x: 100, y: 10, z: 100 }, color: 0xff5500 });
        }
    }
}

// Export the SkyManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkyManager };
}
