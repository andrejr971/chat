import uuid
from typing import List
from sqlalchemy import desc
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from schemas.message import MessageStatus, PayloadCreateMessage
from src.infra.database.models import MessageModel


class MessagesService:

  def create(self, session: Session, data: PayloadCreateMessage) -> MessageModel:
    message = MessageModel(
      id=uuid.UUID(data.id) if data.id else uuid.uuid4(),
      chat_id=uuid.UUID(data.chat_id),
      content=data.content,
      sender_id=uuid.UUID(data.sender_id),
      status=data.status
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

  def list_all(self, session: Session, chat_id: str) -> List[MessageModel]:
    statement = (
      select(MessageModel)
      .where(MessageModel.chat_id == uuid.UUID(chat_id))
      .options(
        selectinload(MessageModel.chat),
        selectinload(MessageModel.sender)
      )
      .order_by(desc(MessageModel.created_at))
    )
    return list(session.exec(statement).all())

  def update_status(
    self,
    session: Session,
    message_id: str,
    status: MessageStatus
  ):
    statement = select(MessageModel).where(MessageModel.id == uuid.UUID(message_id))
    message = session.exec(statement).first()
    if message:
      message.status = status
      session.add(message)
      session.commit()
      session.refresh(message)
    

messages_service = MessagesService()
