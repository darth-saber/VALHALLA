from intents import classify_intent
from memory import remember
from file_ops import create_file, list_files
from terminal_ops import run_command
from local_ai import local_think
import datetime

def think(command: str):
    remember(command)
    intent = classify_intent(command)

    if intent == "TIME":
        return datetime.datetime.now().strftime("Time is %I:%M %p")

    if intent == "FILE":
        if "create" in command:
            name = command.split("create")[-1].strip()
            return create_file(name)
        return list_files()

    if intent == "TERMINAL":
        return run_command(command.replace("run", ""))

    return local_think(command)
