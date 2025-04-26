/**
 * NaturalLanguageProcessor.js
 * Responsible for processing natural language input and converting it to game commands.
 * Uses NaturalLanguageRouter to route requests to the appropriate LLM call type.
 */

class NaturalLanguageProcessor {
    /**
     * Create a natural language processor
     * @param {Object} options - Configuration options
     * @param {Object} commandDispatcher - Command dispatcher for executing commands
     */
    constructor(options = {}, commandDispatcher) {
        this.commandDispatcher = commandDispatcher;
        this.isProcessing = false;
        
        // Initialize the NaturalLanguageRouter
        this.router = new NaturalLanguageRouter(options, commandDispatcher);
        
        console.log('NaturalLanguageProcessor initialized');
    }
    
    /**
     * Process natural language input and convert to game commands
     * @param {string} input - Natural language input from user
     * @param {Function} onSuccess - Callback for successful processing
     * @param {Function} onError - Callback for error
     * @param {Function} onStart - Callback for when processing starts
     * @param {Function} onComplete - Callback for when processing completes (success or error)
     */
    async processInput(input, onSuccess, onError, onStart, onComplete) {
        // Validate input
        if (!input || typeof input !== 'string' || input.trim() === '') {
            const errorMsg = 'Please provide a valid input description.';
            console.error(errorMsg);
            if (onError) onError(errorMsg);
            if (onComplete) onComplete();
            return;
        }
        
        // Prevent multiple simultaneous requests
        if (this.isProcessing) {
            const errorMsg = 'Already processing a request, please wait.';
            console.warn(errorMsg);
            if (onError) onError(errorMsg);
            if (onComplete) onComplete();
            return;
        }
        
        // Set up timeout for spinner
        let spinnerTimeoutId = null;
        
        // Set processing state and call start callback
        this.isProcessing = true;
        console.log('NLP processing started for input:', input);
        if (onStart) onStart();
        
        // Set up a timeout to automatically stop the spinner after 20 seconds
        spinnerTimeoutId = setTimeout(() => {
            if (this.isProcessing) {
                console.error('NLP processing timeout after 20 seconds');
                this.isProcessing = false;
                if (onError) onError('Sorry, something went wrong. The request took too long to process. Please try again.');
                if (onComplete) onComplete();
            }
        }, 20000); // 20 second timeout
        
        try {
            console.log('Determining request type for input:', input);
            const requestType = this.router.determineRequestType(input);
            console.log(`Request type determined: ${requestType.type}, subtype: ${requestType.subtype || 'none'}`);
            
            console.log('Routing command to appropriate handler');
            // Use the router to route the command to the appropriate handler
            const routerResponse = await this.router.routeCommand(
                input,
                // Success callback for router
                (result) => {
                    console.log('Router command successful with result type:', result.type);
                },
                // Error callback for router
                (routerError) => {
                    console.error('Router error:', routerError);
                    throw new Error(routerError);
                },
                // Start callback for router
                () => {
                    console.log('Router command processing started');
                },
                // Complete callback for router
                () => {
                    console.log('Router command processing completed');
                }
            );
            
            console.log('Router response received:', routerResponse.type);
            
            // Handle the response based on its type
            if (routerResponse.type === 'simple_parameter') {
                console.log('Processing simple parameter response');
                // Apply environment updates for simple parameter responses
                const gameCommands = routerResponse.data;
                console.log('Applying environment updates with commands:', gameCommands);
                this.applyEnvironmentUpdates(gameCommands);
                
                if (onSuccess) {
                    console.log('Calling success callback with game commands');
                    onSuccess(gameCommands);
                }
            } else if (routerResponse.type === 'code_generator') {
                console.log(`Processing code generator response with subtype: ${routerResponse.subtype}`);
                // Handle code generator responses based on subtype
                if (routerResponse.subtype === 'skyscraper') {
                    console.log('Applying skyscraper transformation');
                    // Apply skyscraper transformation
                    this.applySkyscraperTransformation(routerResponse.data);
                    
                    if (onSuccess) {
                        console.log('Calling success callback with skyscraper transformation result');
                        onSuccess({
                            skyscraper_transformation: {
                                success: true,
                                code_snippet_length: routerResponse.data.javascriptCodeSnippet.length,
                                comments: routerResponse.data.comments
                            }
                        });
                    }
                } else {
                    // Handle other code generator subtypes here
                    console.warn(`Unhandled code generator subtype: ${routerResponse.subtype}`);
                    if (onSuccess) onSuccess(routerResponse.data);
                }
            } else {
                console.warn(`Unknown response type: ${routerResponse.type}`);
                if (onSuccess) onSuccess(routerResponse.data);
            }
        } catch (error) {
            console.error('Error processing natural language input:', error);
            if (onError) onError(error.message || 'Error processing your request. Please check your API key and try again.');
        } finally {
            // Clear the spinner timeout
            if (spinnerTimeoutId) {
                clearTimeout(spinnerTimeoutId);
            }
            
            console.log('NLP processing completed');
            this.isProcessing = false;
            if (onComplete) onComplete();
        }
    }
    
    /**
     * Apply skyscraper transformation using the JavaScript code snippet
     * @param {Object} skyscraperData - Parsed skyscraper data
     * @returns {boolean} - True if transformation was successful
     * @private
     */
    applySkyscraperTransformation(skyscraperData) {
        console.log('Applying skyscraper transformation:', skyscraperData);
        
        try {
            // Validate commandDispatcher
            if (!this.commandDispatcher || typeof this.commandDispatcher.executeCommand !== 'function') {
                console.error('CommandDispatcher is not properly initialized or missing executeCommand method');
                throw new Error('Command dispatcher not properly initialized');
            }
            
            // Access managers through the commandDispatcher
            const managers = this.commandDispatcher.managers;
            if (!managers) {
                console.error('Managers not available in commandDispatcher');
                throw new Error('Managers not available');
            }
            
            // Check if the environment manager is available
            if (!managers.environmentManager) {
                console.error('EnvironmentManager not available');
                throw new Error('EnvironmentManager not available');
            }
            
            // Transform trees to skyscrapers using the JavaScript code snippet
            managers.environmentManager.transformTreesToSkyscrapers(skyscraperData.javascriptCodeSnippet);
            
            return true;
        } catch (error) {
            console.error('Error applying skyscraper transformation:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }
    
    /**
     * Apply environment updates based on parsed game commands
     * @param {Object} commands - Parsed game commands
     * @returns {boolean} - True if any changes were applied
     * @private
     */
    applyEnvironmentUpdates(commands) {
        try {
            console.log('Applying environment updates:', commands);
            
            // Validate commandDispatcher
            if (!this.commandDispatcher || typeof this.commandDispatcher.executeCommand !== 'function') {
                console.error('CommandDispatcher is not properly initialized or missing executeCommand method');
                throw new Error('Command dispatcher not properly initialized');
            }
            
            // Access managers through the commandDispatcher
            const managers = this.commandDispatcher.managers;
            if (!managers) {
                console.error('Managers not available in commandDispatcher');
                throw new Error('Managers not available');
            }
            
            let changesApplied = false;
            
            // Apply sky color changes if provided
            if (commands.sky_color && managers.skyManager) {
                console.log('Applying sky color:', commands.sky_color);
                // Use the changeSkyColor method
                managers.skyManager.changeSkyColor(commands.sky_color);
                changesApplied = true;
            }
            
            // Apply ground color changes if provided
            if (commands.ground_color && managers.groundManager) {
                console.log('Applying ground color:', commands.ground_color);
                // Use the changeGroundColor method
                managers.groundManager.changeGroundColor(commands.ground_color);
                changesApplied = true;
            }
            
            // Apply tree type changes if provided
            if (commands.tree_type && managers.environmentManager) {
                console.log('Applying tree type:', commands.tree_type);
                // Use the spawnTreeType method
                const treeCount = commands.tree_count || 5; // Default to 5 trees if not specified
                managers.environmentManager.spawnTreeType(commands.tree_type, treeCount);
                changesApplied = true;
            }
            
            // Apply building type changes if provided
            if (commands.building_type && managers.environmentManager) {
                console.log('Applying building type:', commands.building_type);
                // Use the spawnBuildingType method
                managers.environmentManager.spawnBuildingType(commands.building_type);
                changesApplied = true;
            }
            
            // Apply weather effect changes if provided
            if (commands.weather_effect && managers.environmentManager) {
                console.log('Applying weather effect:', commands.weather_effect);
                // Use the startWeatherEffect method
                managers.environmentManager.startWeatherEffect(commands.weather_effect);
                changesApplied = true;
            }
            
            // Apply ambient light color changes if provided
            if (commands.ambient_light_color && managers.skyManager) {
                console.log('Applying ambient light color:', commands.ambient_light_color);
                // Use the changeAmbientLightColor method
                if (typeof managers.skyManager.changeAmbientLightColor === 'function') {
                    managers.skyManager.changeAmbientLightColor(commands.ambient_light_color);
                    changesApplied = true;
                } else {
                    console.log('changeAmbientLightColor method not available in skyManager');
                }
            }
            
            // Apply particle effect changes if provided
            if (commands.particle_effect && managers.environmentManager) {
                console.log('Applying particle effect:', commands.particle_effect);
                // Use the startParticleEffect method
                managers.environmentManager.startParticleEffect(commands.particle_effect);
                changesApplied = true;
            }
            
            // Apply player color changes if provided
            if (commands.player_color && managers.playerManager) {
                console.log('Applying player color:', commands.player_color);
                // Use the changePlayerColor method
                managers.playerManager.changePlayerColor(commands.player_color);
                changesApplied = true;
            }
            
            // Apply tree-to-building transformation if provided
            if (commands.transform_trees_to_buildings && managers.environmentManager) {
                console.log('Transforming trees to buildings:', commands.transform_trees_to_buildings);
                // Use the transformTreesToBuildings method
                managers.environmentManager.transformTreesToBuildings(commands.transform_trees_to_buildings);
                changesApplied = true;
            }
            
            // If no valid changes were applied, fall back to a default spring scene
            if (!changesApplied) {
                console.log('No valid changes detected, applying default spring scene');
                this.commandDispatcher.executeCommand('change_sky_color:#87CEEB');
                this.commandDispatcher.executeCommand('change_ground_color:#4CAF50');
                if (managers.environmentManager) {
                    managers.environmentManager.spawnTreeType('oak', 5);
                } else {
                    this.commandDispatcher.executeCommand('spawn_trees:5');
                }
            }
            
            return changesApplied;
        } catch (error) {
            console.error('Error applying environment updates:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }
    
    /**
     * Update configuration options
     * @param {Object} options - New configuration options
     */
    updateConfig(options) {
        // Update the router configuration
        this.router.updateConfig(options);
    }
}

// Export the NaturalLanguageProcessor class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NaturalLanguageProcessor };
}