from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.connection_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
  """Endpoint simples de healthcheck."""
  return {"status": "ok"}


@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
  """Gerencia o ciclo completo do websocket de chat para um usuario."""
  first_connection = await manager.connect(websocket, username)

  await manager.replay_seen_acks(username)

  if first_connection:
    join_payload = {
      "type": "system",
      "message": {
        "id": str(uuid4()),
        "from": "system",
        "content": f"{username} entrou no chat",
        "timestamp": datetime.now(timezone.utc).isoformat(),
      },
    }
    await manager.broadcast_message(join_payload, skip_ws=websocket)

  history_payload = {"type": "history", "messages": manager.get_history()}
  await websocket.send_json(history_payload)

  try:
    while True:
      data = await websocket.receive_json()
      event_type = data.get("type")

      if event_type == "message":
        message_id = data.get("id") or str(uuid4())
        content = (data.get("content") or "").strip()

        if not content:
          await websocket.send_json({"type": "error", "message": "Mensagem vazia nao permitida"})
          continue

        timestamp = datetime.now(timezone.utc).isoformat()
        message_payload = {
          "id": message_id,
          "from": username,
          "content": content,
          "timestamp": timestamp,
        }

        manager.message_owner[message_id] = username
        manager.add_to_history(message_payload)

        await manager.send_ack(username, message_id, "received")

        await manager.broadcast_message(
          {"type": "message", "message": message_payload},
          skip_ws=websocket,
        )

        await manager.send_ack(username, message_id, "delivered")

      elif event_type == "seen":
        message_id = data.get("messageId")
        owner = manager.message_owner.get(message_id)

        if not message_id or not owner or owner == username:
          continue

        if username not in manager.seen_by[message_id]:
          manager.seen_by[message_id].add(username)
          await manager.send_ack(owner, message_id, "seen", by=username)

      else:
        await websocket.send_json({"type": "error", "message": "Evento desconhecido"})

  except WebSocketDisconnect:
    last_connection = manager.disconnect(username, websocket)
    if last_connection:
      leave_payload = {
        "type": "system",
        "message": {
          "id": str(uuid4()),
          "from": "system",
          "content": f"{username} saiu do chat",
          "timestamp": datetime.now(timezone.utc).isoformat(),
        },
      }
      await manager.broadcast_message(leave_payload, skip_username=username, skip_ws=websocket)
  except Exception as exc:
    logger.error("Erro inesperado no websocket: %s", exc)
    manager.disconnect(username, websocket)
