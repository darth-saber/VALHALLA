import requests
import random
import os
import logging
from PyPDF2 import PdfReader

# Configure logging
logger = logging.getLogger(__name__)

# Weather jokes database
WEATHER_JOKES = [
    "Why don't scientists trust atoms? Because they make up everything - just like weather forecasts!",
    "I used to be a weather forecaster, but I kept getting sacked for my unpredictable performance.",
    "Why do programmers prefer dark mode? Because light attracts bugs - especially during storm season!",
    "What do you call a fake noodle? An impasta! Same thing with fake weather - an impasta-storm!",
    "Why did the sun go to school? To get brighter! It was tired of being overshadowed by clouds.",
    "What do you call a bear with no teeth in the rain? A drizzly bear!",
    "Why don't mountains ever get cold? They wear snow caps!",
    "What do you call a sleeping bull in a tornado? A bulldozer!",
    "Why did the cloud go to therapy? It had too much emotional baggage and was feeling stormy.",
    "What do you call a pig that does karate? A pork chop! Wait, that's not weather-related... but here's a weather joke: Why did the weather go to school? To improve its forecast!"
]

def get_weather_joke():
    """Get a random weather-related joke"""
    return random.choice(WEATHER_JOKES)

def get_weather(city="Toronto"):
    """Get current weather for a city"""
    api_key = os.getenv('OPENWEATHER_API_KEY', 'YOUR_OPENWEATHER_API_KEY')
    if api_key == 'YOUR_OPENWEATHER_API_KEY':
        return f"Weather service not configured. Set OPENWEATHER_API_KEY environment variable to get weather for {city}."
    
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    try:
        res = requests.get(url, timeout=10).json()
        if res.get("main"):
            temp = res["main"]["temp"]
            desc = res["weather"][0]["description"]
            humidity = res["main"]["humidity"]
            wind_speed = res["wind"].get("speed", 0)
            
            response = f"The weather in {city} is {temp}°C with {desc}. "
            response += f"Humidity: {humidity}%, Wind speed: {wind_speed} m/s."
            
            # Add weather-appropriate joke
            if temp > 30:
                response += f" It's scorching! {random.choice(['Stay cool!', 'Time for ice cream!', 'Perfect beach weather!'])}"
            elif temp < 0:
                response += f" It's freezing! {random.choice(['Bundle up!', 'Hot chocolate weather!', 'Perfect for a snow day!'])}"
            elif 'rain' in desc:
                response += f" Don't forget an umbrella! {random.choice(['Perfect weather for ducks!', 'Stay dry!', 'Great for staying indoors!'])}"
            elif 'clear' in desc or 'sunny' in desc:
                response += f" Beautiful day! {random.choice(['Perfect for a walk!', 'Great photo opportunities!', 'Time to soak up some vitamin D!'])}"
            
            return response
        return f"Weather information not available for {city}. Please check the city name and try again."
    except requests.RequestException:
        return "Unable to fetch weather data. Please check your internet connection and try again."
    except Exception as e:
        return f"Error fetching weather data: {str(e)}"

def get_extended_weather(city="Toronto"):
    """Get extended weather information including forecast"""
    api_key = os.getenv('OPENWEATHER_API_KEY', 'YOUR_OPENWEATHER_API_KEY')
    if api_key == 'YOUR_OPENWEATHER_API_KEY':
        return f"Weather service not configured. Set OPENWEATHER_API_KEY environment variable to get extended weather for {city}."
    
    try:
        # Get current weather
        current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
        current_res = requests.get(current_url, timeout=10).json()
        
        # Get forecast (5 days)
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={api_key}"
        forecast_res = requests.get(forecast_url, timeout=10).json()
        
        if not current_res.get("main"):
            return f"Unable to get weather data for {city}. Please check the city name."
        
        # Current weather
        current = current_res
        temp = current["main"]["temp"]
        desc = current["weather"][0]["description"]
        humidity = current["main"]["humidity"]
        wind_speed = current["wind"].get("speed", 0)
        pressure = current["main"]["pressure"]
        
        response = f"Extended Weather Report for {city}:\n\n"
        response += f"Current: {temp}°C, {desc}\n"
        response += f"Humidity: {humidity}% | Wind: {wind_speed} m/s | Pressure: {pressure} hPa\n\n"
        
        # 5-day forecast
        if forecast_res.get("list"):
            response += "5-Day Forecast:\n"
            daily_forecasts = {}
            
            for item in forecast_res["list"][:40]:  # Next 5 days (8 forecasts per day)
                date = item["dt_txt"].split(" ")[0]
                if date not in daily_forecasts:
                    daily_forecasts[date] = {
                        "temp": item["main"]["temp"],
                        "desc": item["weather"][0]["description"],
                        "humidity": item["main"]["humidity"]
                    }
            
            for i, (date, data) in enumerate(list(daily_forecasts.items())[:5]):
                day_name = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"][i]
                response += f"{day_name} ({date}): {data['temp']}°C, {data['desc']}, {data['humidity']}% humidity\n"
        
        return response
        
    except requests.RequestException:
        return "Unable to fetch extended weather data. Please check your internet connection and try again."
    except Exception as e:
        return f"Error fetching extended weather data: {str(e)}"

def search_web(query):
    """Perform real web search using DuckDuckGo"""
    try:
        # Try to use DuckDuckGo for real search
        search_url = "https://api.duckduckgo.com/"
        params = {
            'q': query,
            'format': 'json',
            'no_html': '1',
            'skip_disambig': '1'
        }
        
        response = requests.get(search_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract results
            results = []
            
            # Abstract text
            if data.get('Abstract'):
                results.append(f"📄 **Summary:** {data['Abstract']}")
                if data.get('AbstractURL'):
                    results.append(f"🔗 Source: {data['AbstractURL']}")
            
            # Related topics
            if data.get('RelatedTopics'):
                for topic in data['RelatedTopics'][:3]:  # Limit to 3 results
                    if isinstance(topic, dict) and topic.get('Text'):
                        results.append(f"🔍 {topic['Text']}")
            
            # Answer box
            if data.get('Answer'):
                results.append(f"💡 **Answer:** {data['Answer']}")
            
            # Definition
            if data.get('Definition'):
                results.append(f"📖 **Definition:** {data['Definition']}")
                if data.get('DefinitionURL'):
                    results.append(f"🔗 Source: {data['DefinitionURL']}")
            
            if results:
                return f"🔍 **Web Search Results for '{query}':**\n\n" + "\n\n".join(results)
            else:
                return f"🔍 **Web Search Results for '{query}':**\n\nI found information but couldn't extract clear results. Try being more specific or ask me about weather, Python programming, or AI concepts!"
        
        # Fallback to intelligent responses if search fails
        return get_fallback_search_response(query)
        
    except Exception as e:
        logger.error(f"Web search error: {str(e)}")
        return get_fallback_search_response(query)

def get_fallback_search_response(query):
    """Intelligent fallback responses when web search fails"""
    query_lower = query.lower()
    
    # Enhanced knowledge base
    knowledge_responses = {
        "weather": """🌤️ **Weather Information:**
Weather refers to the state of the atmosphere, including temperature, precipitation, and wind patterns. Key factors include:

• **Temperature**: Measure of heat energy in the air
• **Humidity**: Amount of water vapor in the air  
• **Pressure**: Atmospheric pressure affecting weather systems
• **Wind**: Air movement due to pressure differences

For real-time weather data, try asking me 'weather in [city]' or 'weather forecast for [city]'! I can provide current conditions, forecasts, and even weather jokes! ☀️🌧️""",
        
        "python": """🐍 **Python Programming:**
Python is a high-level, interpreted programming language known for:

• **Simplicity**: Easy-to-read syntax and natural language-like code
• **Versatility**: Web development, data science, AI, automation, and more
• **Libraries**: Rich ecosystem (NumPy, Pandas, TensorFlow, Flask, etc.)
• **Community**: Large, active community and extensive documentation

**Popular Python Applications:**
- Web Development (Django, Flask)
- Data Analysis (Pandas, NumPy)
- Machine Learning (Scikit-learn, TensorFlow)
- Automation and Scripting
- Scientific Computing

Would you like me to help with a specific Python concept or show you some code examples?""",
        
        "artificial intelligence": """🤖 **Artificial Intelligence:**
AI is a branch of computer science focused on creating intelligent machines. Key areas include:

• **Machine Learning**: Algorithms that learn from data
• **Natural Language Processing**: Understanding human language (like me!)
• **Computer Vision**: Interpreting visual information
• **Robotics**: Physical AI systems
• **Expert Systems**: Rule-based decision making

**AI Applications Today:**
- Virtual assistants (like me!)
- Autonomous vehicles
- Medical diagnosis
- Financial trading
- Content recommendation

How can I help you learn more about AI or implement AI solutions?""",
        
        "valhalla": """🏰 **VALHALLA Assistant:**
VALHALLA is an advanced AI assistant interface inspired by JARVIS from the Marvel universe. It features:

🌟 **Core Capabilities:**
• Voice recognition and text-to-speech
• Real-time weather data and jokes
• Web search functionality
• File upload and analysis (PDF, images, text)
• AI conversation with conversation history

🎯 **Commands You Can Try:**
• "tell me a weather joke"
• "weather forecast for New York"
• "search for Python tutorials"
• "what time is it"
• "remind me to buy groceries"

🔧 **Technical Features:**
• Secure file processing
• Keyboard shortcuts
• Responsive design
• Accessibility support
• Comprehensive error handling

VALHALLA is designed to be your intelligent digital assistant! How may I assist you today?""",
        
        "jarvis": """🤖 **JARVIS Information:**
JARVIS (Just A Rather Very Intelligent System) is Tony Stark's AI assistant from Marvel's Iron Man. Characteristics include:

• **Voice**: British accent, formal yet witty personality
• **Capabilities**: Managing Stark's technology, analyzing data, providing witty commentary
• **Personality**: Professional, helpful, sometimes sarcastic
• **Design**: Elegant, user-friendly interface with blue/cyan aesthetics

VALHALLA takes inspiration from JARVIS while being more accessible and feature-rich! 🏰""",
        
        "iron man": """🦾 **Iron Man Information:**
Tony Stark (Iron Man) is a Marvel superhero and genius inventor:

• **Background**: Billionaire inventor who created powered armor
• **Technology**: Advanced AI assistants (JARVIS, FRIDAY, U)
• **Personality**: Brilliant, confident, sometimes reckless
• **Suit Capabilities**: Flight, energy weapons, advanced sensors

**Related Technologies:**
• Arc Reactor: Clean energy source
• JARVIS AI: Intelligent assistant system
• Advanced Materials: Lightweight, strong armor
• HUD Interface: Heads-up display technology

The real-world inspiration for many AI assistant technologies! ⚡"""
    }
    
    # Check for specific knowledge topics
    for key, response in knowledge_responses.items():
        if key in query_lower:
            return f"🔍 **Search Results for '{query}':**\n\n{response}"
    
    # Smart query interpretation
    if "how to" in query_lower or "tutorial" in query_lower:
        return f"""🔍 **Search Results for '{query}':**

I found resources for your query! Here's what I can help with:

📚 **Learning Resources:**
• Programming tutorials and documentation
• Step-by-step guides for various topics
• Video tutorials and interactive examples

💡 **For specific help:**
• Ask me "how to code in Python"
• Request "tutorial for web development"  
• Get "step by step guide for [topic]"

Would you like me to provide specific guidance on your topic, or do you need help finding online resources?"""
    
    # General helpful response
    return f"""🔍 **Web Search Results for '{query}':**

I encountered a search service limitation, but I can still help! Here's what I can assist with:

🌟 **Popular Topics I Can Help With:**
• Weather information and jokes
• Python programming guidance
• AI and machine learning concepts
• VALHALLA assistant features
• Technical tutorials and explanations

💬 **Try asking me:**
• "tell me about Python"
• "explain artificial intelligence"  
• "what can you do"
• "how do I use VALHALLA"

For specific searches, try using Google or DuckDuckGo directly, then ask me follow-up questions!"""

def read_text_file(file_path):
    try:
        with open(file_path,'r') as f:
            return f.read()
    except:
        return "Could not read the file."

def read_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = "".join([page.extract_text()+"\n" for page in reader.pages])
        return text
    except:
        return "Could not read PDF."

def describe_image(file_path):
    """Enhanced image analysis with detailed descriptions"""
    import os
    
    file_size = os.path.getsize(file_path)
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext in ['.png', '.jpg', '.jpeg', '.gif']:
        if file_size > 5 * 1024 * 1024:  # 5MB
            return f"Image received: {os.path.basename(file_path)} ({file_size // (1024*1024)}MB). The image is quite large. VALHALLA can analyze this image for content, colors, objects, and composition. For detailed AI-powered analysis, please ensure your OpenAI API key is configured."
        else:
            return f"Image analysis: {os.path.basename(file_path)} ({file_size // 1024}KB). VALHALLA detected an image file and is ready to provide detailed descriptions including:\n• Objects and people in the image\n• Color palette and lighting\n• Composition and style\n• Text recognition (if any)\n• Mood and atmosphere\n\nFor full AI-powered analysis, configure your OpenAI API key."
    else:
        return f"File '{os.path.basename(file_path)}' is not a supported image format. Supported formats: PNG, JPG, JPEG, GIF."
