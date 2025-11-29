import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
  HOST: str = os.getenv("HOST", "0.0.0.0")
  PORT: int = int(os.getenv("PORT", "8000"))
  
  CORS_ORIGINS: List[str] = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:5173"
  ).split(",")
  
  LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

  WS_HEARTBEAT_INTERVAL: int = 30  
  WS_TIMEOUT: int = 60  
  
  APP_NAME: str = "Chat em Tempo Real"
  APP_VERSION: str = "1.0.0"


settings = Settings()
