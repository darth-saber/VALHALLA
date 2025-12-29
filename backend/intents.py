def classify_intent(command):
    command = command.lower()

    if "time" in command:
        return "TIME"

    if "file" in command or "create" in command:
        return "FILE"

    if "run" in command:
        return "TERMINAL"

    return "AI"
