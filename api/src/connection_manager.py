from __future__ import annotations

import logging
from collections import defaultdict
from typing import DefaultDict, Dict, Optional, Set

from fastapi import WebSocket

logger = logging.getLogger(__name__)

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