from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes import router


def create_app() -> FastAPI:
  app = FastAPI(
    title="Realtime Chat",
    version="1.0.0",
    description="Chat colaborativo em tempo real via WebSocket sem banco de dados.",
  )

  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.include_router(router)

  return app
