from fastapi import FastAPI
from pydantic import BaseModel
from brain import think

app = FastAPI()

class Command(BaseModel):
    command: str

@app.post("/command")
def command_handler(cmd: Command):
    return {"response": think(cmd.command)}
