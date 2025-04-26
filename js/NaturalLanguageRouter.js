/**
 * NaturalLanguageRouter.js
 * 
 * A centralized router that decides which LLM call (and which prompt) to trigger
 * based on the user request. This router intelligently routes between:
 * 1. Simple Parameter LLM - for basic environment changes (sky color, ground color, etc.)
 * 2. Code Generator LLM - for complex object transformations (skyscrapers, etc.)
 */

class NaturalLanguageRouter {
    /**
     * Initialize the NaturalLanguageRouter
     * @param {Object} options - Configuration options
     * @param {string} options.apiKey - OpenAI API key (optional, will try to load from config or localStorage)
     * @param {string} options.model - OpenAI model to use (optional)
     * @param {number} options.temperature - Temperature for OpenAI calls (optional)
     * @param {Object} commandDispatcher - Command dispatcher for executing commands
     */
    constructor(options = {}, commandDispatcher = null) {
        // Initialize with options or defaults
        this.apiKey = options.apiKey || this.loadApiKey();
        this.model = options.model || this.loadModel();
        this.temperature = options.temperature !== undefined ? options.temperature : this.loadTemperature();
        this.topP = options.topP !== undefined ? options.topP : 1.0;
        
        // Store command dispatcher for executing commands
        this.commandDispatcher = commandDispatcher;
        
        // Track processing state
        this.isProcessing = false;
        
        console.log('NaturalLanguageRouter initialized with model:', this.model);
    }
    
    /**
     * Load API key from config or localStorage
     * @returns {string} - OpenAI API key
     * @private
     */
    loadApiKey() {
        // Try to load from config
        if (typeof CONFIG !== 'undefined' && CONFIG.openai && CONFIG.openai.apiKey) {
            return CONFIG.openai.apiKey;
        }
        
        // Try to load from localStorage
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
            return storedKey;
        }
        
        // Return empty string if not found
        return '';
    }
    
    /**
     * Load model from config or localStorage
     * @returns {string} - OpenAI model
     * @private
     */
    loadModel() {
        // Try to load from config
        if (typeof CONFIG !== 'undefined' && CONFIG.openai && CONFIG.openai.defaultModel) {
            return CONFIG.openai.defaultModel;
        }
        
        // Try to load from localStorage
        const storedModel = localStorage.getItem('openai_model');
        if (storedModel) {
            return storedModel;
        }
        
        // Return default model if not found
        return 'gpt-4o';
    }
    
    /**
     * Load temperature from config or localStorage
     * @returns {number} - OpenAI temperature
     * @private
     */
    loadTemperature() {
        // Try to load from config
        if (typeof CONFIG !== 'undefined' && CONFIG.openai && CONFIG.openai.defaultTemperature !== undefined) {
            return CONFIG.openai.defaultTemperature;
        }
        
        // Try to load from localStorage
        const storedTemperature = localStorage.getItem('openai_temperature');
        if (storedTemperature !== null) {
            return parseFloat(storedTemperature);
        }
        
        // Return default temperature if not found
        return 0.7;
    }
    
    /**
     * Route a user command to the appropriate LLM call
     * @param {string} userInput - User input text
     * @param {Function} onSuccess - Callback for successful processing
     * @param {Function} onError - Callback for error
     * @param {Function} onStart - Callback for when processing starts
     * @param {Function} onComplete - Callback for when processing completes (success or error)
     */
    async routeCommand(userInput, onSuccess, onError, onStart, onComplete) {
        // Validate API key - try to reload it if it's not set
        if (!this.apiKey) {
            this.apiKey = this.loadApiKey();
            
            // If still no API key after trying to reload
            if (!this.apiKey) {
                const errorMsg = 'OpenAI API key is required. Please enter your API key in the settings.';
                console.error(errorMsg);
                if (onError) onError(errorMsg);
                if (onComplete) onComplete();
                return;
            }
        }
        
        // Prevent multiple simultaneous requests
        if (this.isProcessing) {
            const errorMsg = 'Already processing a request, please wait.';
            console.warn(errorMsg);
            if (onError) onError(errorMsg);
            if (onComplete) onComplete();
            return;
        }
        
        this.isProcessing = true;
        if (onStart) onStart();
        
        try {
            // Determine the type of request
            const requestType = this.determineRequestType(userInput);
            console.log(`Request type determined: ${requestType.type}`);
            
            let result;
            
            // Route to the appropriate handler based on request type
            switch (requestType.type) {
                case 'code_generator':
                    result = await this.handleCodeGeneratorRequest(userInput, requestType.subtype);
                    break;
                    
                case 'simple_parameter':
                default:
                    result = await this.handleSimpleParameterRequest(userInput);
                    break;
            }
            
            // Call success callback with result
            if (onSuccess) onSuccess(result);
            
            return result;
        } catch (error) {
            console.error('Error routing command:', error);
            if (onError) onError(error.message || 'Error processing your request');
        } finally {
            this.isProcessing = false;
            if (onComplete) onComplete();
        }
    }
    
    /**
     * Determine the type of request based on user input
     * @param {string} userInput - User input text
     * @returns {Object} - Request type information { type, subtype }
     * @private
     */
    determineRequestType(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        // Check for code generator requests
        if (this.isSkyscraperRequest(lowerInput)) {
            return { type: 'code_generator', subtype: 'skyscraper' };
        }
        
        // Add more code generator request types here as needed
        // if (this.isCastleRequest(lowerInput)) {
        //     return { type: 'code_generator', subtype: 'castle' };
        // }
        
        // Default to simple parameter request
        return { type: 'simple_parameter', subtype: 'environment' };
    }
    
    /**
     * Check if the input is a request to generate skyscrapers
     * @param {string} lowerInput - Lowercase user input
     * @returns {boolean} - True if this is a skyscraper request
     * @private
     */
    isSkyscraperRequest(lowerInput) {
        return (
            (lowerInput.includes('skyscraper') || lowerInput.includes('skyscrapers')) &&
            (lowerInput.includes('tree') || lowerInput.includes('trees')) &&
            (lowerInput.includes('replace') || lowerInput.includes('transform') || 
             lowerInput.includes('change') || lowerInput.includes('turn'))
        );
    }
    
    /**
     * Handle a simple parameter request
     * @param {string} userInput - User input text
     * @returns {Object} - Parsed environment update parameters
     * @private
     */
    async handleSimpleParameterRequest(userInput) {
        console.log('Handling simple parameter request:', userInput);
        
        // Use the environment update system prompt
        const systemPrompt = this.getSimpleParameterSystemPrompt();
        
        // Call OpenAI API
        const response = await this.callOpenAI(userInput, systemPrompt);
        
        // Parse the response
        const parsedResponse = this.parseSimpleParameterResponse(response);
        
        return {
            type: 'simple_parameter',
            data: parsedResponse
        };
    }
    
    /**
     * Handle a code generator request
     * @param {string} userInput - User input text
     * @param {string} subtype - Subtype of code generator request (e.g., 'skyscraper')
     * @returns {Object} - Parsed code generator response
     * @private
     */
    async handleCodeGeneratorRequest(userInput, subtype) {
        console.log(`Handling code generator request (${subtype}):`, userInput);
        
        // Get the appropriate system prompt based on subtype
        const systemPrompt = this.getCodeGeneratorSystemPrompt(subtype);
        
        // Call OpenAI API
        const response = await this.callOpenAI(userInput, systemPrompt);
        
        // Parse the response based on subtype
        const parsedResponse = this.parseCodeGeneratorResponse(response, subtype);
        
        return {
            type: 'code_generator',
            subtype: subtype,
            data: parsedResponse
        };
    }
    
    /**
     * Get the system prompt for simple parameter requests
     * @returns {string} - System prompt
     * @private
     */
    getSimpleParameterSystemPrompt() {
        // Use the environment update system prompt
        // This could be loaded from a separate file in the future
        return `
        You are a 3D environment assistant for a fantasy game built with Three.js.
        
        When the player describes a scene or environment change, output ONLY a pure JSON object.
        
        The JSON must contain relevant environment parameters from this list (only include what's relevant):
        
        {
          "sky_color": "hex color code for sky",
          "ground_color": "hex color code for ground",
          "tree_type": "cherry_blossom, pine, oak, willow, palm, magical",
          "tree_count": number of trees to spawn (1-10),
          "weather_effect": "rain, snow, clear, fog, storm",
          "ambient_light_color": "hex color code for ambient light",
          "particle_effect": "petals, snowflakes, raindrops, leaves, sparkles",
          "building_type": "shrine, castle, cottage, tower, ruins, temple, pagoda",
          "player_color": "hex color code for player character",
          "transform_trees_to_buildings": {
            "new_object_type": "simple_building, fantasy_tower, magical_structure",
            "scale_up_factor": scale factor (1.0-3.0),
            "color_scheme": "pastel_city, soft_neon, fairytale, medieval",
            "transition_animation": "grow_taller, grow_taller_and_squarer, spiral_up",
            "particle_effect": "sparkles, magic_dust, energy_field, none"
          }
        }
        
        Rules:
        - ONLY return JSON, no explanation.
        - Only include parameters that are explicitly or implicitly mentioned.
        - Use appropriate hex color codes for colors.
        - For tree_type, only use the predefined types.
        - For weather_effect, only use the predefined effects.
        
        Examples:
        "Make it a sunny day with green grass" → {"sky_color":"#87CEEB","ground_color":"#4CAF50"}
        "Create a spooky forest at night" → {"sky_color":"#0D1321","ambient_light_color":"#2E4057","tree_type":"oak","tree_count":8}
        "I want cherry blossom trees with falling petals" → {"tree_type":"cherry_blossom","particle_effect":"petals"}
        `;
    }
    
    /**
     * Get the system prompt for code generator requests
     * @param {string} subtype - Subtype of code generator request
     * @returns {string} - System prompt
     * @private
     */
    getCodeGeneratorSystemPrompt(subtype) {
        // Get the appropriate system prompt based on subtype
        switch (subtype) {
            case 'skyscraper':
                // Use the skyscraper system prompt if available
                if (typeof SKYSCRAPER_SYSTEM_PROMPT !== 'undefined') {
                    return SKYSCRAPER_SYSTEM_PROMPT;
                }
                
                // Fallback to default skyscraper prompt
                return `
                You are a 3D environment assistant for a fantasy game built with Three.js (JavaScript based).
                
                When the player asks to replace trees with skyscrapers,  
                output ONLY a pure JSON object.
                
                The JSON must contain:
                
                {
                  "javascript_code_snippet": "JS code string that creates and returns a Three.js Mesh or Group for a stylized fantasy skyscraper",
                  "comments": "Optional inline comments explaining what the code does"
                }
                
                Code Requirements:
                - Use Three.js syntax to create fantasy skyscraper meshes.
                - Go beyond simple BoxGeometry when possible - consider using combinations of geometries for more interesting shapes.
                - Apply MeshStandardMaterial or MeshLambertMaterial with magical pastel colors (e.g., light blue, soft lavender, mint green).
                - Target skyscraper dimensions:
                   - Height: 25–50 units
                   - Width: 2–5 units
                   - Depth: 2–5 units
                - Keep proportions suitable for a fantasy cityscape (tall and elegant).
                - Add slight randomness (5–10%) to height and width if possible.
                - Consider adding magical elements like:
                   - Tapered tops or spires
                   - Geometric patterns or textures using multiple materials
                   - Slight curves or organic shapes
                   - Floating sections or disconnected parts
                
                Rules:
                - ONLY return JSON, no extra explanation outside JSON.
                - Keep the JS code snippet clean, safe, and lightweight.
                - No external assets, no HTML DOM changes, no CSS classes.
                - Only Three.js compatible object creation.
                - Your code MUST return a valid Three.js Object3D (Mesh, Group, etc.)
                
                Focus:
                - Directly usable code snippets.
                - Skyscrapers should look fantasy, magical, stylized - not realistic modern buildings.
                - Use soft, magical, or pastel colors appropriate for a fantasy world.
                - Lightweight for real-time rendering.
                - Creative and varied designs that would look good in a magical cityscape.
                `;
                
            // Add more subtypes here as needed
            
            default:
                // Return a generic code generator prompt for unknown subtypes
                return `
                You are a 3D environment assistant for a fantasy game built with Three.js (JavaScript based).
                
                When the player asks for a 3D object transformation, output ONLY a pure JSON object.
                
                The JSON must contain:
                
                {
                  "javascript_code_snippet": "JS code string that creates and returns a Three.js Mesh or Group",
                  "comments": "Optional inline comments explaining what the code does"
                }
                
                Code Requirements:
                - Use Three.js syntax to create fantasy 3D objects.
                - Apply MeshStandardMaterial or MeshLambertMaterial with magical pastel colors.
                - Keep proportions suitable for a fantasy world.
                
                Rules:
                - ONLY return JSON, no extra explanation outside JSON.
                - Keep the JS code snippet clean, safe, and lightweight.
                - No external assets, no HTML DOM changes, no CSS classes.
                - Only Three.js compatible object creation.
                - Your code MUST return a valid Three.js Object3D (Mesh, Group, etc.)
                `;
        }
    }
    
    /**
     * Call OpenAI API with a system prompt
     * @param {string} userInput - User input text
     * @param {string} systemPrompt - System prompt
     * @returns {string} - OpenAI API response
     * @private
     */
    async callOpenAI(userInput, systemPrompt) {
        try {
            console.log('Making OpenAI API request with model:', this.model);
            console.log('Request payload preparation started');
            
            // Prepare the request payload
            const payload = {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                temperature: this.temperature,
                top_p: this.topP,
                response_format: { type: "json_object" } // Ensure JSON response
            };
            
            console.log('Request payload prepared, initiating fetch to OpenAI API');
            
            // Create an AbortController for timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            try {
                // Make direct fetch request to OpenAI API with timeout
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                
                // Clear the timeout since the request completed
                clearTimeout(timeoutId);
                
                console.log('OpenAI API response received with status:', response.status);
                
                // Check if the response is OK
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || response.statusText;
                    console.error(`OpenAI API error (${response.status}):`, errorMessage);
                    throw new Error(`OpenAI API returned ${response.status}: ${errorMessage}`);
                }
                
                console.log('Parsing OpenAI API response JSON');
                // Parse the response
                const data = await response.json();
                
                // Validate the response structure
                if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                    console.error('Invalid response format from OpenAI API:', data);
                    throw new Error('Invalid response format from OpenAI API');
                }
                
                console.log('OpenAI API response successfully parsed');
                // Extract and return the content
                return data.choices[0].message.content;
            } catch (fetchError) {
                // Clear the timeout if there was an error
                clearTimeout(timeoutId);
                
                // Handle AbortController timeout
                if (fetchError.name === 'AbortError') {
                    console.error('OpenAI API request timed out after 15 seconds');
                    throw new Error('Request to OpenAI timed out. Please try again.');
                }
                
                // Re-throw other errors
                throw fetchError;
            }
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Failed to communicate with OpenAI: ' + (error.message || 'Unknown error'));
        }
    }
    
    /**
     * Parse a simple parameter response
     * @param {string} response - OpenAI API response
     * @returns {Object} - Parsed environment update parameters
     * @private
     */
    parseSimpleParameterResponse(response) {
        try {
            // Ensure we have a response
            if (!response) {
                throw new Error('Empty response received from OpenAI');
            }
            
            // Log the raw response for debugging
            console.log('Raw OpenAI simple parameter response:', response);
            
            // Parse JSON response
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(response);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                // Try to extract JSON if the response contains additional text
                const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
                if (jsonMatch) {
                    try {
                        parsedResponse = JSON.parse(jsonMatch[0]);
                        console.log('Extracted JSON from response:', parsedResponse);
                    } catch (extractError) {
                        throw new Error('Could not parse JSON from response: ' + extractError.message);
                    }
                } else {
                    throw new Error('Response is not valid JSON and could not extract JSON: ' + jsonError.message);
                }
            }
            
            // Validate response structure
            if (typeof parsedResponse !== 'object') {
                throw new Error('Invalid response format: not an object');
            }
            
            // Return the parsed response
            return parsedResponse;
        } catch (error) {
            console.error('Error parsing simple parameter response:', error);
            throw new Error('Failed to parse AI response: ' + (error.message || 'Invalid format'));
        }
    }
    
    /**
     * Parse a code generator response
     * @param {string} response - OpenAI API response
     * @param {string} subtype - Subtype of code generator request
     * @returns {Object} - Parsed code generator response
     * @private
     */
    parseCodeGeneratorResponse(response, subtype) {
        try {
            // Ensure we have a response
            if (!response) {
                throw new Error('Empty response received from OpenAI');
            }
            
            // Log the raw response for debugging
            console.log(`Raw OpenAI code generator response (${subtype}):`, response);
            
            // Parse JSON response
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(response);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                // Try to extract JSON if the response contains additional text
                const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
                if (jsonMatch) {
                    try {
                        parsedResponse = JSON.parse(jsonMatch[0]);
                        console.log('Extracted JSON from response:', parsedResponse);
                    } catch (extractError) {
                        throw new Error('Could not parse JSON from response: ' + extractError.message);
                    }
                } else {
                    throw new Error('Response is not valid JSON and could not extract JSON: ' + jsonError.message);
                }
            }
            
            // Validate response structure
            if (typeof parsedResponse !== 'object') {
                throw new Error('Invalid response format: not an object');
            }
            
            // Check for required fields based on subtype
            if (subtype === 'skyscraper') {
                if (!parsedResponse.javascript_code_snippet) {
                    throw new Error('Missing required field: javascript_code_snippet');
                }
                
                // Return skyscraper-specific response
                return {
                    javascriptCodeSnippet: parsedResponse.javascript_code_snippet,
                    comments: parsedResponse.comments || ''
                };
            }
            
            // Generic code generator response for other subtypes
            return parsedResponse;
        } catch (error) {
            console.error(`Error parsing code generator response (${subtype}):`, error);
            throw new Error('Failed to parse AI response: ' + (error.message || 'Invalid format'));
        }
    }
    
    /**
     * Update configuration options
     * @param {Object} options - New configuration options
     */
    updateConfig(options) {
        if (options.apiKey) this.apiKey = options.apiKey;
        if (options.model) this.model = options.model;
        if (options.temperature !== undefined) this.temperature = parseFloat(options.temperature);
        if (options.topP !== undefined) this.topP = parseFloat(options.topP);
        
        // Save to localStorage for persistence
        if (options.apiKey) localStorage.setItem('openai_api_key', options.apiKey);
        if (options.model) localStorage.setItem('openai_model', options.model);
        if (options.temperature !== undefined) localStorage.setItem('openai_temperature', options.temperature);
        
        console.log('Updated NaturalLanguageRouter configuration:', {
            model: this.model,
            temperature: this.temperature
        });
    }
}

// Export the NaturalLanguageRouter class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NaturalLanguageRouter };
}
