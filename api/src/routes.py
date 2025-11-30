from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timezone
from typing import DefaultDict, Dict, Optional, Set
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
  def __init__(self) -> None:
    self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)
    self.message_owner: Dict[str, str] = {}
    self.seen_by: DefaultDict[str, Set[str]] = defaultdict(set)

  async def connect(self, websocket: WebSocket, username: str) -> None:
    await websocket.accept()
    self.active_connections[username].add(websocket)
    logger.info("Usuario conectado: %s", username)

  def disconnect(self, username: str, websocket: Optional[WebSocket] = None) -> None:
    if websocket:
      self.active_connections[username].discard(websocket)
      if not self.active_connections[username]:
        self.active_connections.pop(username, None)
    else:
      self.active_connections.pop(username, None)
    logger.info("Usuario desconectado: %s", username)

  async def broadcast_message(self, payload: dict, skip_username: Optional[str] = None, skip_ws: Optional[WebSocket] = None) -> None:
    dead: Set[tuple[str, WebSocket]] = set()
    for user, connections in self.active_connections.items():
      if user == skip_username:
        continue
      for connection in list(connections):
        if skip_ws and connection is skip_ws:
          continue
        try:
          await connection.send_json(payload)
        except Exception as exc:  # pragma: no cover - defensive cleanup
          logger.warning("Erro ao enviar mensagem para %s: %s", user, exc)
          dead.add((user, connection))
    for user, connection in dead:
      self.disconnect(user, connection)

  async def send_ack(self, username: str, message_id: str, status: str, by: Optional[str] = None) -> None:
    connections = self.active_connections.get(username) or set()
    for connection in list(connections):
      ack_payload = {"type": "ack", "messageId": message_id, "status": status}
      if by:
        ack_payload["by"] = by
      try:
        await connection.send_json(ack_payload)
      except Exception as exc:  # pragma: no cover
        logger.warning("Erro ao enviar ack para %s: %s", username, exc)
        self.disconnect(username, connection)


manager = ConnectionManager()


@router.get("/health")
async def health():
  return {"status": "ok"}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  username = websocket.query_params.get("username")
  if not username:
    await websocket.close(code=1008, reason="username requerido")
    return

  await manager.connect(websocket, username)

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
    manager.disconnect(username, websocket)
    leave_payload = {
      "type": "system",
      "message": {
        "id": str(uuid4()),
        "from": "system",
        "content": f"{username} saiu do chat",
        "timestamp": datetime.now(timezone.utc).isoformat(),
      },
    }
    await manager.broadcast_message(leave_payload, skip_ws=websocket)
  except Exception as exc:  # pragma: no cover - log unexpected exceptions
    logger.error("Erro inesperado no websocket: %s", exc)
    manager.disconnect(username, websocket)
