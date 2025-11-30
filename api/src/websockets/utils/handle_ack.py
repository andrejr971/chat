from schemas.message import MessageStatus
from sqlmodel import Session

from src.websockets.utils.manager import manager
from src.services.message import messages_service


async def handle_ack(chat_id: str, payload: dict, session: Session):
    message_id = payload["message_id"]
    user_id = payload["user_id"]
    status = payload["status"]  

    manager.mark_ack(chat_id, message_id, user_id, status)

    delivered_count, seen_count, total_participants = manager.get_counts(chat_id, message_id)

    new_status = compute_message_status(
      delivered_count=delivered_count,
      seen_count=seen_count,
      total_participants=total_participants,
    )

    messages_service.update_status(
      message_id=message_id,
      session=session,
      status=new_status
    )

    await manager.broadcast(chat_id, {
      "type": "status",
      "payload": {
        "message_id": message_id,
        "delivered_count": delivered_count,
        "seen_count": seen_count,
        "total_participants": total_participants,
        "status": new_status.value,
      },
    })

def compute_message_status(
    delivered_count: int,
    seen_count: int,
    total_participants: int,
) -> MessageStatus:
    if total_participants <= 0:
        return MessageStatus.sent 

    if seen_count >= total_participants:
        return MessageStatus.seen_all
    if seen_count > 0:
        return MessageStatus.seen_partial

    if delivered_count >= total_participants:
        return MessageStatus.delivered_all
    if delivered_count > 0:
        return MessageStatus.delivered_partial

    return MessageStatus.sent
