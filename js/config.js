/**
 * Configuration settings for the application
 * IMPORTANT: API keys should be loaded from environment variables
 * or a secure backend service, not stored in client-side code.
 */
const CONFIG = {
    // OpenAI API configuration
    openai: {
        apiKey: "", // API key should be entered by the user in the UI
        defaultModel: "gpt-4o",
        defaultTemperature: 0.7
    }
};
