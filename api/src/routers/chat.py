import logging
from typing import List
from starlette.status import (
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_204_NO_CONTENT,
  HTTP_404_NOT_FOUND
)
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.infra.database.database import get_session
from src.schemas.chat import ChatSchema, PayloadChatSchema
from src.services.chat import chat_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
  "/",
  status_code=HTTP_201_CREATED,
  response_model=ChatSchema
)
async def create_chat(
  data: PayloadChatSchema,
  session: Session = Depends(get_session)
):
  chat = chat_service.create(
    session=session,
    data=data
  )
  
  return ChatSchema.model_validate_json(chat.model_dump_json())

@router.get(
  "/",
  status_code=HTTP_200_OK,
  response_model=List[ChatSchema]
)
async def get_all_chats(session: Session = Depends(get_session)):
  chats = chat_service.list_all(session=session)
  return [
    ChatSchema.model_validate_json(chat.model_dump_json()) for chat in chats
  ]

@router.get(
  "/{chat_id}",
  status_code=HTTP_200_OK,
  response_model=ChatSchema
)
async def get_chat(
  chat_id: str,
  session: Session = Depends(get_session)
):
  chat = chat_service.show(session=session, chat_id=chat_id)
  if chat is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Chat não encontrado"
    )
  return ChatSchema.model_validate_json(chat.model_dump_json())

@router.put(
  "/{chat_id}",
  status_code=HTTP_200_OK,
  response_model=ChatSchema
)
async def update_chat(
  chat_id: str,
  data: PayloadChatSchema,
  session: Session = Depends(get_session)
):
  chat = chat_service.show(session=session, chat_id=chat_id)
  if chat is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Chat não encontrado"
    )
  chat_updated = chat_service.update(
    data=data,
    session=session,
    chat_id=chat_id
  )
  chat.name = data.name
  chat.updated_at = chat_updated.updated_at if chat_updated.updated_at else chat.updated_at
  return ChatSchema.model_validate_json(chat.model_dump_json())

@router.delete(
  "/{chat_id}",
  status_code=HTTP_204_NO_CONTENT,
)
async def delete_chat(
  chat_id: str,
  session: Session = Depends(get_session)
):
  chat = chat_service.show(session=session, chat_id=chat_id)
  if chat is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Chat não encontrado"
    )
  chat_service.delete(
    session=session,
    chat_id=chat_id
  )
