import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infra.database.database import init_db
from src.routers.health import router as health_router
from src.routers.chat import router as chat_router
from src.routers.users import router as users_router
from src.websockets.chat import router as wbesocket_router

from src.config.env import settings

logging.basicConfig(
  level=getattr(logging, 'INFO'),
  format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
  logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION} iniciando...")
  
  logger.info("Criando tabelas do banco de dados...")
  init_db()
  logger.info("Banco de dados inicializado com sucesso!")
  
  logger.info(f"Servidor rodando em {settings.HOST}:{settings.PORT}")

  
  yield

  logger.info("Aplicação encerrada")

def create_app() -> FastAPI:  
  app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema de chat colaborativo em tempo real com WebSocket",
    lifespan=lifespan
  )

  app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.include_router(
    router=health_router,
    prefix="/api"
  )
  app.include_router(
    router=chat_router,
    prefix="/api/chats"
  )
  app.include_router(
    router=users_router,
    prefix="/api/users"
  )
  app.include_router(
    router=wbesocket_router
  )

  return app
