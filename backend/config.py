"""Local configuration. Loading settings never initializes a Gemini client."""

import os
from pathlib import Path

from dotenv import load_dotenv

backendDir = Path(__file__).resolve().parent
load_dotenv(backendDir / ".env")

databasePath = Path(os.getenv("GAMESMITH_DB_PATH", "gamesmith.db"))
if not databasePath.is_absolute():
    databasePath = backendDir / databasePath
databasePath = databasePath.resolve()

corsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"]

geminiApiKey = os.getenv("GEMINI_API_KEY")

primaryModelName = "gemini-3.8-flash"

fallbackModelName = "gemini-3.5-flash-lite"

retriesPerModel = 3

geminiTimeoutMilliseconds = 30000
