import os

def create_file(name):
    open(name, "w").close()
    return f"File {name} created."

def list_files(path="."):
    return ", ".join(os.listdir(path))
