/**
 * CommandQueue.js
 * Responsible for queuing and sequentially executing commands.
 * Allows for multiple commands to be executed in sequence with optional delays.
 */

class CommandQueue {
    /**
     * Create a command queue
     * @param {CommandDispatcher} commandDispatcher - The command dispatcher to use for executing commands
     * @param {Object} options - Queue options
     * @param {number} options.defaultDelay - Default delay between commands in milliseconds
     */
    constructor(commandDispatcher, options = {}) {
        this.commandDispatcher = commandDispatcher;
        this.queue = [];
        this.isExecuting = false;
        this.defaultDelay = options.defaultDelay || 150; // Default delay between commands (ms)
        this.onQueueEmptyCallbacks = [];
    }
    
    /**
     * Add a command to the queue
     * @param {string} commandName - The name of the command to add
     * @param {Object} params - Optional parameters for the command
     * @param {number} delay - Optional delay before executing this command (overrides default)
     * @returns {CommandQueue} - Returns this for method chaining
     */
    addCommand(commandName, params = {}, delay = null) {
        this.queue.push({
            commandName,
            params,
            delay: delay !== null ? delay : this.defaultDelay
        });
        
        return this; // Allow method chaining
    }
    
    /**
     * Add multiple commands to the queue
     * @param {Array} commands - Array of command objects {commandName, params, delay}
     * @returns {CommandQueue} - Returns this for method chaining
     */
    addCommands(commands) {
        commands.forEach(cmd => {
            this.addCommand(
                cmd.commandName, 
                cmd.params || {}, 
                cmd.delay !== undefined ? cmd.delay : this.defaultDelay
            );
        });
        
        return this; // Allow method chaining
    }
    
    /**
     * Clear all commands from the queue
     * @returns {CommandQueue} - Returns this for method chaining
     */
    clearQueue() {
        if (!this.isExecuting) {
            this.queue = [];
        } else {
            console.warn('Cannot clear queue while it is executing');
        }
        
        return this; // Allow method chaining
    }
    
    /**
     * Execute the next command in the queue
     * @returns {Promise} - Promise that resolves when the command is executed
     */
    async executeNext() {
        if (this.queue.length === 0) {
            console.log('Command queue is empty');
            return false;
        }
        
        const command = this.queue.shift();
        
        try {
            console.log(`Executing command: ${command.commandName}`);
            const result = this.commandDispatcher.executeCommand(command.commandName, command.params);
            
            // If this was the last command, notify listeners
            if (this.queue.length === 0) {
                this._notifyQueueEmpty();
            }
            
            return result;
        } catch (error) {
            console.error(`Error executing command ${command.commandName}:`, error);
            return false;
        }
    }
    
    /**
     * Execute all commands in the queue sequentially
     * @returns {Promise} - Promise that resolves when all commands are executed
     */
    async executeAll() {
        if (this.isExecuting) {
            console.warn('Queue is already executing');
            return false;
        }
        
        if (this.queue.length === 0) {
            console.log('Command queue is empty');
            return false;
        }
        
        this.isExecuting = true;
        console.log(`Executing all ${this.queue.length} commands in queue`);
        
        try {
            while (this.queue.length > 0) {
                const command = this.queue.shift();
                
                // Execute the command
                console.log(`Executing command: ${command.commandName}`);
                this.commandDispatcher.executeCommand(command.commandName, command.params);
                
                // Wait for the specified delay if there are more commands
                if (this.queue.length > 0 && command.delay > 0) {
                    await this._delay(command.delay);
                }
            }
            
            // Notify listeners that the queue is empty
            this._notifyQueueEmpty();
            
            this.isExecuting = false;
            return true;
        } catch (error) {
            console.error('Error executing command queue:', error);
            this.isExecuting = false;
            return false;
        }
    }
    
    /**
     * Register a callback to be called when the queue becomes empty
     * @param {Function} callback - The callback function
     */
    onQueueEmpty(callback) {
        if (typeof callback === 'function') {
            this.onQueueEmptyCallbacks.push(callback);
        }
    }
    
    /**
     * Get the number of commands in the queue
     * @returns {number} - The number of commands in the queue
     */
    get length() {
        return this.queue.length;
    }
    
    /**
     * Check if the queue is currently executing
     * @returns {boolean} - True if the queue is executing
     */
    get executing() {
        return this.isExecuting;
    }
    
    /**
     * Create a delay using a promise
     * @param {number} ms - The delay in milliseconds
     * @returns {Promise} - Promise that resolves after the delay
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Notify all registered callbacks that the queue is empty
     * @private
     */
    _notifyQueueEmpty() {
        this.onQueueEmptyCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in queue empty callback:', error);
            }
        });
    }
}

// Export the CommandQueue class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommandQueue };
}
