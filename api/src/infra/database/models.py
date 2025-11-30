import uuid
from datetime import datetime, timezone
from typing import List
from schemas.message import MessageStatus
from sqlalchemy import table
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
  messages: List["MessageModel"] = Relationship(
    back_populates="chat"
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
  messages: List["MessageModel"] = Relationship(
    back_populates="sender"
  )

class ChatWithMembers(SQLModel, table=False):
  id: uuid.UUID
  name: str
  created_at: datetime
  updated_at: datetime
  total_members: int

class MessageModel(SQLModel, table=True):
  __tablename__ = "messages"

  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  chat_id: uuid.UUID = Field(foreign_key="chats.id", index=True)
  sender_id: uuid.UUID = Field(foreign_key="users.id", index=True)

  content: str
  status: MessageStatus = Field(
    default=MessageStatus.pending,
    sa_column_kwargs={"server_default": MessageStatus.pending.value},
  )

  chat: ChatModel = Relationship(back_populates="messages")
  sender: UsersModel = Relationship(back_populates="messages")

  created_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    nullable=False
  )
