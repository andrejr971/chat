import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
  logger.info(f"Nova tentativa de conexão WebSocket: {chat_id}")
  await websocket.accept()
  await websocket.send_json({"status": "connected", "chatId": chat_id})
  try:
    while True:
      data = await websocket.receive_json()
      logger.info(f"[{chat_id}] Mensagem recebida: {data}")

      await websocket.send_json({
        "chatId": chat_id,
        "received": data,
        "status": "ok"
      })
  except WebSocketDisconnect:
    logger.info(f"WebSocket desconectado: {chat_id}")
