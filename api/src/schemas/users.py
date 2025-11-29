from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field

from src.schemas.chat import ChatSchema

class PayloadUserSchema(BaseModel):
  username: str = Field(..., description="Nome do usuário")

class UserSchema(PayloadUserSchema):
  model_config = ConfigDict(strict=True)

  id: str = Field(..., description="ID do usuário")
  created_at: datetime = Field(..., description="Data de criação do usuário")
  updated_at: datetime = Field(..., description="Data de atualização do usuário")

class UserWithChatsSchema(UserSchema):
  chats: List[ChatSchema] = Field(
    default_factory=list,
    description="Lista de chats do usuário"
  )
