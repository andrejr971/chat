import json
import logging
import traceback
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session

from schemas.message import MessageStatus, PayloadCreateMessage
from src.infra.database.database import get_db_session
from src.websockets.utils.manager import manager
from src.websockets.utils.handle_ack import handle_ack
from src.services.chat import chat_service
from src.services.message import messages_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(
  websocket: WebSocket,
  chat_id: str
):
  logger.info(f"Nova tentativa de conexão WebSocket: {chat_id}")
  await websocket.accept()

  session: Session = get_db_session()
  chat = chat_service.show(session, chat_id)

  if chat is None:
    await websocket.send_json({"status": "error", "message": "Chat não encontrado"})
    session.close()
    await websocket.close()
    return

  await manager.connect(chat_id, websocket)
  try:
    while True:
      data = await websocket.receive_text()
      message = json.loads(data)

      msg_type = message.get("type")
      payload = message.get("payload", {})

      if msg_type == "join":
        await manager.broadcast(chat_id, {
          "type": "user:join",
          "payload": {
            "user_id": payload.get("user_id"),
            "username": payload.get("username"),
          },
        })

      elif msg_type == "message":
        logger.info("Mensagem recebida em %s: %s", chat_id, payload)
        messages_service.create(
          session=session,
          data=PayloadCreateMessage(
            id=payload["id"],
            chat_id=chat_id,
            content=payload["content"],
            sender_id=payload["senderId"],
            status=MessageStatus.sent,
          )
        )        
        payload["status"] = "sent"
        await manager.broadcast(chat_id, {
          "type": "message",
          "payload": payload,
        })

        await manager.broadcast(chat_id, {
          "type": "status",
          "payload": {
            "message_id": payload["id"],
            "delivered_count": 0,
            "seen_count": 0,
            "total_participants": len(manager.chats.get(chat_id, [])),
          }
        })

      elif msg_type == "ack":
        await handle_ack(
          chat_id=chat_id,
          payload=payload,
          session=session
        )
        
      elif msg_type == "typing":
        await manager.broadcast(chat_id, {
          "type": "typing",
          "payload": payload
        })

  except WebSocketDisconnect:
    manager.disconnect(chat_id, websocket)
    traceback.print_exc()
  finally:
    session.close()
