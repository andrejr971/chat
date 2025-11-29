from datetime import datetime, timezone
import uuid
from typing import List
from sqlalchemy import desc, func
from sqlmodel import Session, select

from src.infra.database.models import ChatModel, ChatUserLink, ChatWithMembers, UsersModel
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

  def get_chat_members_count(self, session: Session, chat_id: str) -> int:
    statement = select(func.count()).select_from(ChatUserLink).where(ChatUserLink.chat_id == uuid.UUID(chat_id))
    result = session.exec(statement).one()
    return result or 0

  def list_all(self, session: Session) -> List[ChatWithMembers]:
    statement = (
      select(
        ChatModel,
        func.count(ChatUserLink.user_id).label("total_members"),
      )
      .join(
        ChatUserLink,
        ChatUserLink.chat_id == ChatModel.id,
        isouter=True,
      )
      .group_by(ChatModel.id)
      .order_by(desc(ChatModel.updated_at))
    )

    rows = session.exec(statement).all()

    return [
      ChatWithMembers(
        id=chat.id,
        name=chat.name,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        total_members=int(total_members or 0),
      ) for chat, total_members in rows
    ]

  def show(self, session: Session, chat_id: str) -> ChatWithMembers | None:
    chat_uuid = uuid.UUID(chat_id)
    
    statement = (
      select(
        ChatModel,
        func.count(ChatUserLink.user_id).label("members_count"),
      )
      .join(
        ChatUserLink,
        ChatUserLink.chat_id == ChatModel.id,
        isouter=True,
      )
      .where(ChatModel.id == chat_uuid)
      .group_by(ChatModel.id)
    )
    result = session.exec(statement).first()

    if not result:
      return None

    chat, total_members = result
    return ChatWithMembers(
      id=chat.id,
      name=chat.name,
      created_at=chat.created_at,
      updated_at=chat.updated_at,
      total_members=int(total_members or 0),
    )

  def update(
    self,
    session: Session,
    chat_id: str,
    data: PayloadChatSchema
  ) -> ChatModel | None:
    statement = select(ChatModel).where(ChatModel.id == uuid.UUID(chat_id))
    chat = session.exec(statement).first()
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

  def list_all_members_by_chat(self, session: Session, chat_id: str) -> List[UsersModel]:
    statement = (
      select(UsersModel)
      .join(
        ChatUserLink,
        ChatUserLink.user_id == UsersModel.id
      )
      .where(ChatUserLink.chat_id == uuid.UUID(chat_id))
    )
    users = session.exec(statement).all()
    return users

chat_service = ChatService()
