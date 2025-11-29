from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class PayloadChatSchema(BaseModel):
  name: str = Field(..., description="Nome do chat")

class ChatSchema(PayloadChatSchema):
  model_config = ConfigDict(strict=True)

  id: str = Field(..., description="ID do chat")
  created_at: datetime = Field(..., description="Data de criação do chat")
  updated_at: datetime = Field(..., description="Data de atualização do chat")
