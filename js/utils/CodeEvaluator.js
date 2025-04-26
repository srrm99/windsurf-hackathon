/**
 * CodeEvaluator.js
 * Utility for safely evaluating JavaScript code snippets
 */

class CodeEvaluator {
    /**
     * Safely evaluate a JavaScript code snippet in a controlled context
     * @param {string} codeSnippet - JavaScript code to evaluate
     * @param {Object} context - Context object with available variables and functions
     * @returns {any} - Result of the evaluated code
     */
    static evaluateSnippet(codeSnippet, context = {}) {
        try {
            // Create a function with the provided context variables as parameters
            const contextKeys = Object.keys(context);
            const contextValues = Object.values(context);
            
            // Add THREE to the context if not already present
            if (!contextKeys.includes('THREE') && typeof THREE !== 'undefined') {
                contextKeys.push('THREE');
                contextValues.push(THREE);
            }
            
            // Create a function that wraps the code snippet
            const evaluator = new Function(...contextKeys, `
                try {
                    ${codeSnippet}
                } catch (error) {
                    console.error('Error in evaluated code:', error);
                    throw error;
                }
            `);
            
            // Execute the function with the context values
            return evaluator(...contextValues);
        } catch (error) {
            console.error('Failed to evaluate code snippet:', error);
            throw new Error(`Code evaluation failed: ${error.message}`);
        }
    }
    
    /**
     * Safely create a Three.js mesh from a code snippet
     * @param {string} codeSnippet - JavaScript code that creates and returns a Three.js mesh
     * @param {Object} context - Additional context variables
     * @returns {THREE.Object3D} - The created mesh or a default mesh if creation fails
     */
    static createMeshFromSnippet(codeSnippet, context = {}) {
        try {
            // Create a function that returns the mesh
            const meshCreator = new Function(...Object.keys(context), `
                try {
                    ${codeSnippet}
                } catch (error) {
                    console.error('Error creating mesh:', error);
                    // Return a default mesh as fallback
                    const geometry = new THREE.BoxGeometry(3, 30, 3);
                    const material = new THREE.MeshStandardMaterial({ color: 0x8ecae6 });
                    const defaultMesh = new THREE.Mesh(geometry, material);
                    defaultMesh.position.y = 15;
                    return defaultMesh;
                }
            `);
            
            // Execute the function with the context values
            const result = meshCreator(...Object.values(context));
            
            // Verify that the result is a valid Three.js Object3D
            if (result instanceof THREE.Object3D) {
                return result;
            } else {
                console.error('Code snippet did not return a valid Three.js Object3D');
                // Return a default mesh as fallback
                const geometry = new THREE.BoxGeometry(3, 30, 3);
                const material = new THREE.MeshStandardMaterial({ color: 0x8ecae6 });
                const defaultMesh = new THREE.Mesh(geometry, material);
                defaultMesh.position.y = 15;
                return defaultMesh;
            }
        } catch (error) {
            console.error('Failed to create mesh from code snippet:', error);
            // Return a default mesh as fallback
            const geometry = new THREE.BoxGeometry(3, 30, 3);
            const material = new THREE.MeshStandardMaterial({ color: 0x8ecae6 });
            const defaultMesh = new THREE.Mesh(geometry, material);
            defaultMesh.position.y = 15;
            return defaultMesh;
        }
    }
}

// Export the CodeEvaluator class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CodeEvaluator };
}
