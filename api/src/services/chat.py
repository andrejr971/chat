from datetime import datetime, timezone
import uuid
from typing import List
from sqlalchemy import desc
from sqlmodel import Session, select

from src.infra.database.models import ChatModel, ChatUserLink, UsersModel
from src.schemas.chat import PayloadChatSchema


class ChatService:

  def create(self, session: Session, data: PayloadChatSchema) -> ChatModel:
    chat = ChatModel(
      name=data.name
    )
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat

  def list_all(self, session: Session) -> List[ChatModel]:
    statement = select(ChatModel).order_by(desc(ChatModel.updated_at))
    return list(session.exec(statement).all())

  def show(self, session: Session, chat_id: str) -> ChatModel | None:
    statement = select(ChatModel).where(ChatModel.id == uuid.UUID(chat_id))
    return session.exec(statement).first()

  def update(
    self,
    session: Session,
    chat_id: str,
    data: PayloadChatSchema
  ) -> ChatModel | None:
    chat = self.show(session=session, chat_id=chat_id)
    if chat is None:
      return None

    chat.name = data.name
    chat.updated_at = datetime.now(timezone.utc)
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat
  
  def update_field_updated_at(
    self,
    session: Session,
    chat_id: str
  ):
    chat = self.show(session=session, chat_id=chat_id)
    if chat:
      chat.updated_at = datetime.now(timezone.utc)
      session.add(chat)
      session.commit()
      session.refresh(chat)

  def delete(self, session: Session, chat_id: str) -> None:
    chat = self.show(session=session, chat_id=chat_id)
    if chat:
      session.delete(chat)
      session.commit()

  def add_user(
    self,
    session: Session,
    chat_id: str,
    user_id: str
  ) -> bool:
    chat = self.show(session=session, chat_id=chat_id)
    if chat is None:
      return False

    user = session.exec(
      select(UsersModel).where(UsersModel.id == uuid.UUID(user_id))
    ).first()
    if user is None:
      return False

    link_exists = session.exec(
      select(ChatUserLink).where(
        ChatUserLink.chat_id == chat.id,
        ChatUserLink.user_id == user.id
      )
    ).first()
    if link_exists:
      return True

    session.add(ChatUserLink(chat_id=chat.id, user_id=user.id))
    chat.updated_at = datetime.now(timezone.utc)
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return True

  def remove_user(
    self,
    session: Session,
    chat_id: str,
    user_id: str
  ) -> bool:
    chat = self.show(session=session, chat_id=chat_id)
    if chat is None:
      return False

    link = session.exec(
      select(ChatUserLink).where(
        ChatUserLink.chat_id == uuid.UUID(chat_id),
        ChatUserLink.user_id == uuid.UUID(user_id)
      )
    ).first()
    if link is None:
      return False

    session.delete(link)
    chat.updated_at = datetime.now(timezone.utc)
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return True

chat_service = ChatService()
