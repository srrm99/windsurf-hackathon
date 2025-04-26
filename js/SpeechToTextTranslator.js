/**
 * SpeechToTextTranslator.js
 * 
 * Handles recording Hindi speech and translating it to English text
 * using the Sarvam.ai Speech-to-Text-Translate API.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize speech to text functionality once DOM is fully loaded
    initSpeechToText();
});

function initSpeechToText() {
    console.log('Initializing Speech-to-Text functionality...');
    
    // DOM elements
    const speakButton = document.getElementById('speak-button');
    const aiCommandInput = document.getElementById('ai-command-input');
    const recordingIndicator = document.getElementById('recording-indicator');
    
    // Check if elements exist
    if (!speakButton || !aiCommandInput || !recordingIndicator) {
        console.error('Required DOM elements not found:', {
            speakButton: !!speakButton,
            aiCommandInput: !!aiCommandInput,
            recordingIndicator: !!recordingIndicator
        });
        return;
    }
    
    console.log('All DOM elements found, setting up speech recording');
    
    // Configuration
    const config = {
        apiKey: '', // API key should be entered by the user or loaded securely
        apiEndpoint: 'https://api.sarvam.ai/speech-to-text-translate',
        model: 'saaras:v2',
        withDiarization: 'false', // String 'false' as per API docs
        maxRecordingTime: 10000 // 10 seconds
    };
    
    // For development/demo purposes only - in production, use a secure method
    // This should be provided by the user or loaded from a secure source
    const DEMO_API_KEY = prompt('Please enter your Sarvam.ai API key:', '');
    if (DEMO_API_KEY) {
        config.apiKey = DEMO_API_KEY;
    }
    
    // Recording state
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let recordingTimeout = null;
    
    // Add click event listener to speak button
    speakButton.addEventListener('click', () => {
        console.log('Speak button clicked');
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    // Start recording function
    async function startRecording() {
        console.log('Starting recording...');
        try {
            // Request microphone access with specific constraints for better audio quality
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000 // 16kHz as recommended by Sarvam.ai
                } 
            });
            
            // Reset audio chunks
            audioChunks = [];
            
            // Create media recorder with specific MIME type for better compatibility
            const options = { mimeType: 'audio/webm' };
            mediaRecorder = new MediaRecorder(stream, options);
            
            // Set up data available handler
            mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                    console.log(`Recorded chunk: ${event.data.size} bytes`);
                }
            });
            
            // Set up stop handler
            mediaRecorder.addEventListener('stop', () => {
                processAudio();
            });
            
            // Start recording with small time slices to get more frequent chunks
            mediaRecorder.start(100); // Get data every 100ms
            isRecording = true;
            
            // Update UI
            speakButton.classList.add('recording');
            speakButton.innerHTML = '⏹️ Stop';
            recordingIndicator.innerHTML = 'Listening...';
            recordingIndicator.classList.remove('hidden');
            
            // Set timeout to automatically stop recording
            recordingTimeout = setTimeout(() => {
                if (isRecording) {
                    stopRecording();
                }
            }, config.maxRecordingTime);
            
            console.log('Recording started successfully');
        } catch (error) {
            console.error('Error starting recording:', error);
            showError('Could not access microphone. Please check permissions.');
        }
    }
    
    // Stop recording function
    function stopRecording() {
        console.log('Stopping recording...');
        if (!mediaRecorder || !isRecording) {
            console.warn('No active recording to stop');
            return;
        }
        
        // Clear timeout
        if (recordingTimeout) {
            clearTimeout(recordingTimeout);
            recordingTimeout = null;
        }
        
        // Stop recording
        mediaRecorder.stop();
        isRecording = false;
        
        // Stop all tracks in the stream
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        // Update UI
        speakButton.classList.remove('recording');
        speakButton.innerHTML = '🎤 Speak';
        recordingIndicator.innerHTML = 'Processing...';
        
        console.log('Recording stopped successfully');
    }
    
    // Process audio and send to API
    async function processAudio() {
        console.log(`Processing ${audioChunks.length} audio chunks...`);
        
        if (audioChunks.length === 0) {
            showError('No audio recorded');
            return;
        }
        
        try {
            // Create audio blob
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            console.log(`Audio blob created: ${audioBlob.size} bytes`);
            
            // Create form data according to Sarvam.ai API documentation
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', config.model);
            formData.append('with_diarization', config.withDiarization);
            
            console.log('Form data prepared:', {
                model: config.model,
                with_diarization: config.withDiarization
            });
            
            console.log('Sending audio to Sarvam.ai API...');
            
            // Send to Sarvam.ai API with correct headers
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'api-subscription-key': config.apiKey
                },
                body: formData
            });
            
            // Log response status
            console.log('API response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API response data:', data);
            
            // Insert transcript into input field
            if (data && data.transcript) {
                aiCommandInput.value = data.transcript;
                console.log('Transcript inserted:', data.transcript);
                
                // Also log the detected language if available
                if (data.language_code) {
                    console.log('Detected language:', data.language_code);
                }
                
                // Trigger input event
                const event = new Event('input', { bubbles: true });
                aiCommandInput.dispatchEvent(event);
            } else {
                throw new Error('No transcript received from API');
            }
        } catch (error) {
            console.error('Error processing audio:', error);
            showError('Could not process speech, please try typing.');
        } finally {
            // Hide processing indicator
            recordingIndicator.classList.add('hidden');
        }
    }
    
    // Show error message
    function showError(message) {
        console.error(message);
        recordingIndicator.innerHTML = `Error: ${message}`;
        recordingIndicator.classList.add('error');
        recordingIndicator.classList.remove('hidden');
        
        // Hide error after 3 seconds
        setTimeout(() => {
            recordingIndicator.classList.add('hidden');
            recordingIndicator.classList.remove('error');
            recordingIndicator.innerHTML = 'Listening...';
        }, 3000);
    }
    
    console.log('Speech-to-Text initialization complete');
}
