from collections import defaultdict
from fastapi import WebSocket

class ConnectionManager:
  def __init__(self) -> None:
    self.chats: dict[str, list[WebSocket]] = {}
    self.participants: dict[str, set[str]] = {}

    self.delivered_by: dict[str, set[str]] = defaultdict(set)
    self.seen_by: dict[str, set[str]] = defaultdict(set)

  async def connect(self, chat_id: str, websocket: WebSocket) -> None:
    if chat_id not in self.chats:
      self.chats[chat_id] = []
    self.chats[chat_id].append(websocket)

  def disconnect(self, chat_id: str, websocket: WebSocket) -> None:
    if chat_id in self.chats and websocket in self.chats[chat_id]:
      self.chats[chat_id].remove(websocket)
      if not self.chats[chat_id]:
        del self.chats[chat_id]

  async def broadcast(self, chat_id: str, data: dict) -> None:
    for ws in self.chats.get(chat_id, []):
      await ws.send_json(data)

  def mark_ack(self, chat_id: str, message_id: str, user_id: str, status: str):
    if status == "delivered":
      self.delivered_by[message_id].add(user_id)

    if status == "seen":
      self.seen_by[message_id].add(user_id)

  def get_counts(self, chat_id: str, message_id: str):
    delivered_count = len(self.delivered_by.get(message_id, set()))
    seen_count = len(self.seen_by.get(message_id, set()))
    total_participants = len(self.participants.get(chat_id, set()))

    return delivered_count, seen_count, total_participants

manager = ConnectionManager()
