/**
 * CommandDispatcher.js
 * Responsible for mapping command strings to manager functions.
 * Acts as a mediator between input sources (UI, voice, AI) and scene managers.
 */

class CommandDispatcher {
    /**
     * Create a command dispatcher
     * @param {Object} managers - Object containing all manager instances
     */
    constructor(managers) {
        this.managers = managers;
        this.commandMap = {};
        
        // Initialize with default commands
        this.initializeCommands();
    }
    
    /**
     * Initialize the command map with default commands
     */
    initializeCommands() {
        // Sky commands
        this.registerCommand('day_sky', () => {
            console.log('Executing command: day_sky');
            this.managers.skyManager.setDaytime();
        });
        
        this.registerCommand('sunset_sky', () => {
            console.log('Executing command: sunset_sky');
            this.managers.skyManager.setSunset();
        });
        
        this.registerCommand('night_sky', () => {
            console.log('Executing command: night_sky');
            this.managers.skyManager.setNighttime();
        });
        
        // Parameterized sky commands
        this.registerCommand('change_sky_color', (params) => {
            const colorHex = params.parameter || '#87CEEB'; // Default to light blue if no parameter
            console.log(`Executing command: change_sky_color with color ${colorHex}`);
            this.managers.skyManager.changeSkyColor(colorHex);
        });
        
        // Ground commands
        this.registerCommand('grassy_ground', () => {
            console.log('Executing command: grassy_ground');
            this.managers.groundManager.changeGroundColor(0x4CAF50);
            
            // Reset material properties
            if (this.managers.groundManager.groundMesh) {
                this.managers.groundManager.groundMesh.material.roughness = 0.8;
                this.managers.groundManager.groundMesh.material.metalness = 0.1;
            }
            
            if (this.managers.groundManager.detailMesh) {
                this.managers.groundManager.detailMesh.material.color.set(0x66BB6A);
                this.managers.groundManager.detailMesh.material.opacity = 0.7;
            }
        });
        
        this.registerCommand('snowy_ground', () => {
            console.log('Executing command: snowy_ground');
            this.managers.groundManager.makeGroundSnowy();
        });
        
        this.registerCommand('desert_ground', () => {
            console.log('Executing command: desert_ground');
            this.managers.groundManager.makeGroundDesert();
        });
        
        // Parameterized ground commands
        this.registerCommand('change_ground_color', (params) => {
            const colorHex = params.parameter || '#4CAF50'; // Default to green if no parameter
            console.log(`Executing command: change_ground_color with color ${colorHex}`);
            this.managers.groundManager.changeGroundColor(colorHex);
        });
        
        // Environment commands
        this.registerCommand('add_tree', () => {
            console.log('Executing command: add_tree');
            // Generate random position within reasonable bounds
            const randomX = (Math.random() - 0.5) * 100;
            const randomZ = (Math.random() - 0.5) * 100;
            const position = { x: randomX, z: randomZ };
            
            console.log(`Adding tree at position: x=${randomX.toFixed(2)}, z=${randomZ.toFixed(2)}`);
            this.managers.environmentManager.addTree(position);
        });
        
        // Parameterized tree commands
        this.registerCommand('spawn_trees', (params) => {
            const count = parseInt(params.parameter) || 1; // Default to 1 if no parameter or invalid number
            console.log(`Executing command: spawn_trees with count ${count}`);
            
            for (let i = 0; i < count; i++) {
                // Generate random position within reasonable bounds
                const randomX = (Math.random() - 0.5) * 100;
                const randomZ = (Math.random() - 0.5) * 100;
                const position = { x: randomX, z: randomZ };
                
                console.log(`Adding tree ${i+1}/${count} at position: x=${randomX.toFixed(2)}, z=${randomZ.toFixed(2)}`);
                this.managers.environmentManager.addTree(position);
            }
        });
        
        // Tree type commands
        this.registerCommand('spawn_tree_type', (params) => {
            const treeType = params.parameter || 'oak'; // Default to oak if no parameter
            console.log(`Executing command: spawn_tree_type with type ${treeType}`);
            this.managers.environmentManager.spawnTreeType(treeType, 3);
        });
        
        // Building commands
        this.registerCommand('spawn_building', (params) => {
            const buildingType = params.parameter || 'cottage'; // Default to cottage if no parameter
            console.log(`Executing command: spawn_building with type ${buildingType}`);
            this.managers.environmentManager.spawnBuildingType(buildingType);
        });
        
        // Weather effect commands
        this.registerCommand('set_weather', (params) => {
            const weatherEffect = params.parameter || 'clear'; // Default to clear if no parameter
            console.log(`Executing command: set_weather with effect ${weatherEffect}`);
            this.managers.environmentManager.startWeatherEffect(weatherEffect);
        });
        
        // Ambient light commands
        this.registerCommand('change_ambient_light', (params) => {
            const colorHex = params.parameter || '#FFFFFF'; // Default to white if no parameter
            console.log(`Executing command: change_ambient_light with color ${colorHex}`);
            this.managers.skyManager.changeAmbientLightColor(colorHex);
        });
        
        // Particle effect commands
        this.registerCommand('start_particles', (params) => {
            const particleEffect = params.parameter || 'leaves'; // Default to leaves if no parameter
            console.log(`Executing command: start_particles with effect ${particleEffect}`);
            this.managers.environmentManager.startParticleEffect(particleEffect);
        });
        
        this.registerCommand('remove_tree', () => {
            console.log('Executing command: remove_tree');
            // Get the last added tree
            if (this.managers.environmentManager.trees.length > 0) {
                const lastTree = this.managers.environmentManager.trees[this.managers.environmentManager.trees.length - 1];
                console.log(`Removing tree with ID: ${lastTree.id}`);
                this.managers.environmentManager.removeTree(lastTree.id);
            } else {
                console.log('No trees to remove');
            }
        });
        
        this.registerCommand('add_rock', () => {
            console.log('Executing command: add_rock');
            // Generate random position within reasonable bounds
            const randomX = (Math.random() - 0.5) * 100;
            const randomZ = (Math.random() - 0.5) * 100;
            const position = { x: randomX, z: randomZ };
            
            console.log(`Adding rock at position: x=${randomX.toFixed(2)}, z=${randomZ.toFixed(2)}`);
            this.managers.environmentManager.addRock(position);
        });
        
        this.registerCommand('add_platform', () => {
            console.log('Executing command: add_platform');
            // Generate random position within reasonable bounds
            const randomX = (Math.random() - 0.5) * 100;
            const randomZ = (Math.random() - 0.5) * 100;
            const randomY = 5 + Math.random() * 15; // Random height between 5 and 20
            const position = { x: randomX, y: randomY, z: randomZ };
            
            console.log(`Adding platform at position: x=${randomX.toFixed(2)}, y=${randomY.toFixed(2)}, z=${randomZ.toFixed(2)}`);
            this.managers.environmentManager.addPlatform(position);
        });
        
        this.registerCommand('add_cloud', () => {
            console.log('Executing command: add_cloud');
            // Generate random position within reasonable bounds
            const randomX = (Math.random() - 0.5) * 200;
            const randomZ = (Math.random() - 0.5) * 200;
            const randomY = 50 + Math.random() * 30; // Random height between 50 and 80
            const position = { x: randomX, y: randomY, z: randomZ };
            
            console.log(`Adding cloud at position: x=${randomX.toFixed(2)}, y=${randomY.toFixed(2)}, z=${randomZ.toFixed(2)}`);
            this.managers.environmentManager.addCloud(position);
        });
        
        // Player commands
        this.registerCommand('reset_player', () => {
            console.log('Executing command: reset_player');
            this.managers.playerManager.resetPosition();
        });
        
        this.registerCommand('change_player_color', (params) => {
            const colorHex = params.parameter || '#1E88E5'; // Default to blue if no parameter
            console.log(`Executing command: change_player_color with color ${colorHex}`);
            this.managers.playerManager.changePlayerColor(colorHex);
        });
    }
    
    /**
     * Register a new command
     * @param {string} commandName - The name of the command
     * @param {Function} commandFunction - The function to execute when the command is called
     */
    registerCommand(commandName, commandFunction) {
        this.commandMap[commandName] = commandFunction;
    }
    
    /**
     * Execute a command by name
     * @param {string} commandInput - The command to execute, can be simple name or 'name:parameter'
     * @param {Object} additionalParams - Optional additional parameters to pass to the command
     * @returns {boolean} - True if the command was found and executed, false otherwise
     */
    executeCommand(commandInput, additionalParams = {}) {
        // Parse the command input to extract command name and parameter
        const { commandName, parameter } = this.parseCommandInput(commandInput);
        
        // Merge the parameter from the command input with any additional params
        const params = { ...additionalParams };
        if (parameter !== null) {
            params.parameter = parameter;
        }
        
        if (this.commandMap[commandName]) {
            try {
                console.log(`Executing command '${commandName}'${parameter !== null ? ` with parameter '${parameter}'` : ''}`);
                this.commandMap[commandName](params);
                return true;
            } catch (error) {
                console.error(`Error executing command '${commandName}':`, error);
                return false;
            }
        } else {
            console.warn(`Command '${commandName}' not found`);
            return false;
        }
    }
    
    /**
     * Parse a command input string into command name and parameter
     * @param {string} commandInput - The command input string (e.g., 'commandName:parameter')
     * @returns {Object} - Object with commandName and parameter properties
     * @private
     */
    parseCommandInput(commandInput) {
        if (typeof commandInput !== 'string') {
            return { commandName: commandInput, parameter: null };
        }
        
        const parts = commandInput.split(':');
        const commandName = parts[0].trim();
        const parameter = parts.length > 1 ? parts[1].trim() : null;
        
        return { commandName, parameter };
    }
    
    /**
     * Get a list of all available commands
     * @returns {Array} - Array of command names
     */
    getAvailableCommands() {
        return Object.keys(this.commandMap);
    }
}

// Export the CommandDispatcher class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommandDispatcher };
}
