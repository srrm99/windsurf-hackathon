# Fantasy 3D Side-Scroller with Hindi Speech Recognition

## Windsurf Hackathon Submission

A vibrant 3D side-scrolling fantasy game built with Three.js, featuring natural language AI commands, Hindi speech-to-text translation, and a teletubby-style player character.

<!-- Add a screenshot of your game here if available -->

## 🌟 Key Features

- **Hindi Speech Recognition**: Speak commands in Hindi, which are automatically translated to English using Sarvam.ai's Speech-to-Text-Translate API
- **AI-Powered Environment**: Use natural language to transform the environment (e.g., "Turn trees into fantasy castles")
- **Teletubby-Style Character**: Cute, low-poly character with simple animations
- **Fantasy Landscape**: Rolling hills, magical trees, floating islands, and more
- **Dynamic Building Generation**: AI-generated fantasy buildings with proper scaling and animations

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge)
- An OpenAI API key (for the AI command features)
- A Sarvam.ai API key (for Hindi speech recognition)
- Microphone access (for speech recognition)

### Running the Game

1. Clone this repository
   ```bash
   git clone https://github.com/srrm99/windsurf-hackathon.git
   cd windsurf-hackathon/game
   ```

2. Start a local web server in the game directory
   ```bash
   # Using Python's built-in HTTP server
   python -m http.server 9000
   
   # Or using Python 3
   python3 -m http.server 9000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:9000
   ```

4. When prompted, enter your OpenAI API key and Sarvam.ai API key

## 🎮 Controls

- **Movement**: Arrow keys or A/D keys to move left/right
- **Jump**: Space bar
- **Reset Position**: Click the "Reset Player Position" button
- **AI Commands**: Type English text in the command input or use the speech button
- **Hindi Speech**: Click the "🎤 Speak" button and speak in Hindi

## 🔍 Technical Implementation

### Hindi Speech-to-Text Translation
- Uses the MediaRecorder API to capture audio
- Sends the audio to Sarvam.ai's Speech-to-Text-Translate API
- Automatically translates Hindi speech to English text
- Inserts the translated text into the AI command input field

### AI-Powered Environment
- Uses OpenAI's GPT-4o model to interpret natural language commands
- Transforms environment elements based on user instructions
- Generates code snippets that are executed in real-time

### 3D Graphics
- Built with Three.js for WebGL rendering
- Custom low-poly character with modular body parts
- Procedurally generated terrain and buildings
- Dynamic lighting and shadows

## 📋 API Keys (IMPORTANT FOR HACKATHON ORGANIZERS)

### OpenAI API Key
- **REQUIRED**: Hackathon organizers/judges must provide their own OpenAI API key
- Enter it in the UI input field labeled "OpenAI API Key" and click "Save API Key"
- Used to process natural language commands
- Without this key, the AI command functionality will not work

### Sarvam.ai API Key
- **REQUIRED**: Hackathon organizers/judges must provide their own Sarvam.ai API key
- Enter it when prompted after clicking the "🎤 Speak" button
- Used to convert Hindi speech to English text
- Without this key, the Hindi speech recognition will not work

> **Note for Hackathon Organizers**: Both API keys are required to fully evaluate this submission. The keys are not stored in the repository for security reasons and must be entered by the user.

## 🔧 Troubleshooting

- **Microphone Access**: Make sure to allow microphone access when prompted by the browser
- **API Keys**: If commands aren't working, check that you've entered valid API keys
- **Speech Recognition**: Speak clearly and ensure your microphone is working properly
- **Browser Compatibility**: Use the latest version of Chrome, Firefox, or Edge

## 💻 Development

This project was built using:
- Three.js for 3D rendering
- OpenAI API for natural language processing
- Sarvam.ai API for Hindi speech-to-text translation
- Vanilla JavaScript for game logic

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Windsurf AI for hosting this hackathon
- Sarvam.ai for their excellent speech-to-text translation API
- OpenAI for their powerful language models

