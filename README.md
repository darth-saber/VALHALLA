# VALHALLA - Enhanced AI Assistant Interface

A sophisticated AI assistant interface inspired by JARVIS from the Marvel universe, featuring voice recognition, file processing, weather integration, web search capabilities, and weather jokes!

## 🌟 Features

### Core Functionality
- **Voice Recognition**: Advanced speech-to-text with confidence detection
- **Text-to-Speech**: Multiple voice options with customizable settings
- **File Upload**: Support for PDF, TXT, PNG, JPG, and GIF files
- **Real-time Chat**: Interactive AI conversations with history

### Weather Integration
- **Current Weather**: Real-time weather data for any city
- **5-Day Forecast**: Extended weather predictions
- **Weather Jokes**: Fun weather-related jokes and observations
- **Enhanced Weather Data**: Humidity, wind speed, pressure information

### Web Search
- **Smart Search**: Intelligent search with contextual responses
- **Search History**: Track and revisit previous searches
- **Search Integration**: Seamlessly integrated into AI responses

### Enhanced User Experience
- **Keyboard Shortcuts**: Power user shortcuts for quick access
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: High contrast mode and reduced motion support
- **Error Handling**: Comprehensive error management and user feedback

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser with JavaScript enabled

### Installation

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd VALHALLA
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API keys
   nano .env
   ```

4. **Configure API Keys**
   
   **OpenAI API Key** (Required for AI functionality):
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file:
     ```
     OPENAI_API_KEY=sk-your-actual-api-key-here
     ```
   
   **OpenWeather API Key** (Required for weather functionality):
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key
   - Add it to your `.env` file:
     ```
     OPENWEATHER_API_KEY=your-openweather-api-key-here
     ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access VALHALLA**
   - Open your browser and navigate to `http://localhost:5000`
   - VALHALLA will greet you with a welcome message!

## 🎯 Commands

### Voice Commands
- **Weather**: "weather in [city]", "weather forecast for [city]"
- **Jokes**: "tell me a weather joke", "give me a joke"
- **Search**: "search for [query]"
- **Time/Date**: "what time is it", "what's today's date"
- **Reminders**: "remind me to [task]"

### Keyboard Shortcuts
- **Ctrl/Cmd + Enter**: Send command
- **Ctrl/Cmd + L**: Clear input
- **Ctrl/Cmd + J**: Get weather joke
- **Ctrl/Cmd + S**: Focus search input

### File Upload
- Click "📂 Upload File" or drag and drop files
- Supported formats: PDF, TXT, PNG, JPG, GIF
- Maximum file size: 10MB

## 🛠️ Technical Details

### Architecture
- **Backend**: Flask (Python)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: OpenAI GPT-4, OpenWeatherMap
- **File Processing**: PyPDF2 for PDFs, native file APIs for images

### File Structure
```
VALHALLA/
├── app.py              # Main Flask application
├── utils.py            # Utility functions and API integrations
├── index.html          # Main interface
├── script.js           # Frontend JavaScript
├── style.css           # Styling and animations
├── requirements.txt    # Python dependencies
├── .env.example        # Environment configuration template
├── README.md          # This file
├── TODO.md            # Development roadmap
└── uploads/           # Upload directory (auto-created)
```

### Security Features
- Input validation and sanitization
- File type and size restrictions
- Error handling and logging
- Secure file handling with filename sanitization

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_key
OPENWEATHER_API_KEY=your_weather_key

# Optional
FLASK_ENV=development
MAX_FILE_SIZE=10485760  # 10MB
LOG_LEVEL=INFO
```

### Voice Settings
- **Rate**: Speech speed (0.1-10.0, default: 1.0)
- **Pitch**: Voice pitch (0.0-2.0, default: 1.0)
- **Volume**: Speech volume (0.0-1.0, default: 1.0)

## 🎨 Customization

### Themes
- Modify `style.css` for custom colors and animations
- The interface uses CSS custom properties for easy theming
- Supports high contrast and reduced motion preferences

### Voice Options
- Edit voice selection logic in `script.js`
- Add new voice profiles in the voice selection dropdown
- Customize speech synthesis settings

### Weather Jokes
- Add new jokes to the `WEATHER_JOKES` array in `utils.py`
- Customize joke delivery and context awareness

## 🐛 Troubleshooting

### Common Issues

**"AI service not configured" error:**
- Check that your OpenAI API key is correctly set in `.env`
- Verify the API key is valid and has sufficient credits

**Weather data not loading:**
- Confirm your OpenWeather API key is set correctly
- Check internet connection and API service status

**Voice recognition not working:**
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome, Edge recommended)
- Verify microphone is not being used by other applications

**File upload failures:**
- Check file size (must be under 10MB)
- Verify file type is supported
- Ensure `uploads/` directory has write permissions

### Debug Mode
Run with debug mode enabled for detailed error messages:
```bash
python app.py
# Debug mode is enabled by default
```

### Logs
Check application logs for detailed error information:
```bash
# View logs in the terminal where app.py is running
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Python: Follow PEP 8
- JavaScript: Use modern ES6+ features
- CSS: Use meaningful class names and comments

## 📝 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 🙏 Acknowledgments

- Inspired by JARVIS from Marvel's Iron Man
- Weather data provided by OpenWeatherMap
- AI capabilities powered by OpenAI
- Built with Flask and modern web technologies

## 📞 Support

For issues, questions, or contributions:
1. Check the troubleshooting section above
2. Review the TODO.md for planned features
3. Open an issue on the project repository

---

**VALHALLA is ready to assist you! Type "hello" or use the voice button to begin your conversation.**
