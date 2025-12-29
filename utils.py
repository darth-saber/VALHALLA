import requests
from PyPDF2 import PdfReader

def get_weather(city="Toronto"):
    api_key = "YOUR_OPENWEATHER_API_KEY"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    res = requests.get(url).json()
    if res.get("main"):
        temp = res["main"]["temp"]
        desc = res["weather"][0]["description"]
        return f"The weather in {city} is {temp}°C with {desc}."
    return "Weather information not available."

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
    return f"Image '{file_path}' received. VALHALLA can describe this image using AI."
