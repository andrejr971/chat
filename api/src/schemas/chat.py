from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class PayloadChatSchema(BaseModel):
  name: str = Field(..., description="Nome do chat")
  user_id: str | None = Field(None, description="Id do usuário")
  
class PayloadJoinMemberToChatSchema(BaseModel):
  user_id: str = Field(..., description="Id do usuário")

class ChatSchema(BaseModel):
  model_config = ConfigDict(strict=True)

  id: str = Field(..., description="ID do chat")
  name: str = Field(..., description="Nome do chat")
  created_at: datetime = Field(..., description="Data de criação do chat")
  updated_at: datetime = Field(..., description="Data de atualização do chat")
  total_members: int | None = Field(0, description="Total de membros")
