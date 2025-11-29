from datetime import datetime, timezone
import uuid
from typing import List
from sqlalchemy import desc
from sqlmodel import Session, select

from src.infra.database.models import ChatModel, ChatUserLink, UsersModel
from src.schemas.users import PayloadUserSchema


class UsersService:

  def create(self, session: Session, data: PayloadUserSchema) -> UsersModel:
    if self.get_by_username(session=session, username=data.username):
      raise ValueError("Username já existe")

    user = UsersModel(
      username=data.username
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

  def list_all(self, session: Session) -> List[UsersModel]:
    statement = select(UsersModel).order_by(desc(UsersModel.updated_at))
    return list(session.exec(statement).all())

  def show(self, session: Session, user_id: str) -> UsersModel | None:
    statement = select(UsersModel).where(UsersModel.id == uuid.UUID(user_id))
    return session.exec(statement).first()

  def get_by_username(
    self,
    session: Session,
    username: str
  ) -> UsersModel | None:
    statement = select(UsersModel).where(UsersModel.username == username)
    return session.exec(statement).first()

  def update(
    self,
    session: Session,
    user_id: str,
    data: PayloadUserSchema
  ) -> UsersModel | None:
    user = self.show(session=session, user_id=user_id)
    if user is None:
      return None

    if data.username != user.username:
      if self.get_by_username(session=session, username=data.username):
        raise ValueError("Username já existe")

    user.username = data.username
    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

  def delete(self, session: Session, user_id: str) -> None:
    user = self.show(session=session, user_id=user_id)
    if user:
      session.delete(user)
      session.commit()

  def list_user_chats(
    self,
    session: Session,
    user_id: str
  ) -> List[ChatModel] | None:
    if self.show(session=session, user_id=user_id) is None:
      return None

    statement = (
      select(ChatModel)
      .join(ChatUserLink, ChatUserLink.chat_id == ChatModel.id)
      .where(ChatUserLink.user_id == uuid.UUID(user_id))
      .order_by(desc(ChatModel.updated_at))
    )
    return list(session.exec(statement).all())


users_service = UsersService()
