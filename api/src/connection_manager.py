from __future__ import annotations

import logging
from collections import defaultdict
from typing import DefaultDict, Dict, List, Optional, Set

from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
  def __init__(self) -> None:
    self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)
    self.message_owner: Dict[str, str] = {}
    self.seen_by: DefaultDict[str, Set[str]] = defaultdict(set)
    self.history: List[dict] = []

  async def connect(self, websocket: WebSocket, username: str) -> bool:
    """Conecta o usuario e retorna True se for a primeira conexao ativa dele."""
    await websocket.accept()
    is_first_connection = not self.active_connections[username]
    self.active_connections[username].add(websocket)
    logger.info("Usuario conectado: %s", username)
    return is_first_connection

  def disconnect(self, username: str, websocket: Optional[WebSocket] = None) -> bool:
    """Desconecta e retorna True se era a ultima conexao ativa do usuario."""
    last_connection = False

    if websocket:
      self.active_connections[username].discard(websocket)

      if not self.active_connections[username]:
        self.active_connections.pop(username, None)
        last_connection = True

    else:
      if username in self.active_connections:
        self.active_connections.pop(username, None)
        last_connection = True

    logger.info("Usuario desconectado: %s", username)
    return last_connection

  async def broadcast_message(self, payload: dict, skip_username: Optional[str] = None, skip_ws: Optional[WebSocket] = None) -> None:
    """Envia um payload para todas as conexoes, com opcoes para pular usuario ou websocket."""
    dead: Set[tuple[str, WebSocket]] = set()

    for user, connections in self.active_connections.items():
      if user == skip_username:
        continue

      for connection in list(connections):
        if skip_ws and connection is skip_ws:
          continue
        try:
          await connection.send_json(payload)
        except Exception as exc: 
          logger.warning("Erro ao enviar mensagem para %s: %s", user, exc)
          dead.add((user, connection))
    for user, connection in dead:
      self.disconnect(user, connection)

  async def send_ack(self, username: str, message_id: str, status: str, by: Optional[str] = None) -> None:
    """Envia ack de status para todas as conexoes do usuario alvo."""
    connections = self.active_connections.get(username) or set()

    for connection in list(connections):
      ack_payload = {"type": "ack", "messageId": message_id, "status": status}

      if by:
        ack_payload["by"] = by

      try:
        await connection.send_json(ack_payload)
      except Exception as exc:
        logger.warning("Erro ao enviar ack para %s: %s", username, exc)
        self.disconnect(username, connection)

  def add_to_history(self, message: dict) -> None:
    """Armazena uma mensagem no historico em memoria."""
    self.history.append(message)

  def get_history(self) -> List[dict]:
    """Retorna uma copia do historico em memoria."""
    return list(self.history)

  async def replay_seen_acks(self, username: str) -> None:
    """Reenvia acks de mensagens ja vistas enquanto o dono estava offline."""
    for message_id, owner in self.message_owner.items():
      if owner != username:
        continue

      seen_users = self.seen_by.get(message_id, set())
      for seen_user in seen_users:
        await self.send_ack(username, message_id, "seen", by=seen_user)


manager = ConnectionManager()
