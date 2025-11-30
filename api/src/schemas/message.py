from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MessageStatus(str, Enum):
  pending = "pending"
  sent = "sent"
  delivered_partial = "delivered_partial"
  delivered_all = "delivered_all"
  seen_partial = "seen_partial"
  seen_all = "seen_all"


class PayloadCreateMessage(BaseModel):
  model_config = ConfigDict(strict=True)

  id: str = Field(..., description="ID da mensagem")
  chat_id: str = Field(..., description="ID do chat")
  sender_id: str = Field(..., description="ID do usuário que enciou a mensagem")
  content: str = Field(..., description='Conteudo da mensagem' )
  status: MessageStatus = Field(..., description='Status da mensagem')


class ChatNestedSchema(BaseModel):
  model_config = ConfigDict(strict=True)

  id: str = Field(..., description="ID do chat")
  name: str = Field(..., description="Nome do chat")
  created_at: datetime = Field(..., description="Data de criação do chat")
  updated_at: datetime = Field(..., description="Data de atualização do chat")


class SenderNestedSchema(BaseModel):
  model_config = ConfigDict(strict=True)

  id: str = Field(..., description="ID do usuário")
  username: str = Field(..., description="Nome do usuário")
  created_at: datetime = Field(..., description="Data de criação do usuário")
  updated_at: datetime = Field(..., description="Data de atualização do usuário")


class MessageSchema(BaseModel):
  model_config = ConfigDict(strict=True, use_enum_values=True)

  id: str = Field(..., description="ID da mensagem")
  chat_id: str = Field(..., description="ID do chat")
  sender_id: str = Field(..., description="ID do usuário que enviou a mensagem")
  content: str = Field(..., description="Conteúdo da mensagem")
  status: MessageStatus | str = Field(..., description="Status da mensagem")
  created_at: datetime = Field(..., description="Data de criação da mensagem")
  chat: Optional[ChatNestedSchema] = Field(
    default=None, description="Dados do chat relacionado"
  )
  sender: Optional[SenderNestedSchema] = Field(
    default=None, description="Dados do remetente da mensagem"
  )
