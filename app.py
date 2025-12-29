from flask import Flask, request, jsonify
import openai, os
from datetime import datetime, date
from utils import get_weather, read_text_file, read_pdf, describe_image

openai.api_key = "YOUR_OPENAI_API_KEY"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
reminders = []

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    command = data.get('command','').strip()
    if 'time' in command.lower():
        response_text = f"Current time: {datetime.now().strftime('%H:%M')}."
    elif 'date' in command.lower():
        response_text = f"Today's date: {date.today()}."
    elif 'weather' in command.lower():
        city = command.replace("weather","").strip() or "Toronto"
        response_text = get_weather(city)
    elif 'remind me' in command.lower():
        reminders.append(command)
        response_text = f"Reminder set: {command}"
    else:
        try:
            completion = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role":"system","content":"You are VALHALLA, polite, witty AI like JARVIS."},
                          {"role":"user","content":command}]
            )
            response_text = completion.choices[0].message['content']
        except:
            response_text = "VALHALLA encountered an AI error."
    return jsonify({"response": response_text})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"response":"No file uploaded."})
    file = request.files['file']
    path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(path)
    if file.filename.lower().endswith('.pdf'):
        content = read_pdf(path)
        return jsonify({"response":f"PDF content preview: {content[:500]}..."})
    elif file.filename.lower().endswith(('.png','.jpg','.jpeg')):
        return jsonify({"response":describe_image(path)})
    else:
        content = read_text_file(path)
        return jsonify({"response":f"File content preview: {content[:500]}..."})

if __name__ == '__main__':
    app.run(debug=True)
