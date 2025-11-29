import uuid
from datetime import datetime, timezone
from typing import List
from sqlmodel import SQLModel, Field, Relationship

class ChatUserLink(SQLModel, table=True):
  __tablename__ = "users_chats"

  user_id: uuid.UUID = Field(
    foreign_key="users.id",
    primary_key=True
  )
  chat_id: uuid.UUID = Field(
    foreign_key="chats.id",
    primary_key=True
  )
  created_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    nullable=False
  )

class ChatModel(SQLModel, table=True):
  __tablename__ = "chats"

  id: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    primary_key=True
  )
  name: str = Field(max_length=50)
  created_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    nullable=False
  )
  updated_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    nullable=False
  )
  users: List["UsersModel"] = Relationship(
    back_populates="chats",
    link_model=ChatUserLink
  )

class UsersModel(SQLModel, table=True):
  __tablename__ = "users"

  id: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    primary_key=True
  )
  username: str = Field(unique=True, max_length=50)
  created_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    nullable=False
  )
  updated_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    nullable=False
  )
  chats: List[ChatModel] = Relationship(
    back_populates="users",
    link_model=ChatUserLink
  )
