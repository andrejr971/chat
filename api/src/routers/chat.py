import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette.status import (
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_204_NO_CONTENT,
  HTTP_404_NOT_FOUND
)

from src.schemas.users import UserSchema
from src.schemas.chat import ChatSchema, PayloadChatSchema, PayloadJoinMemberToChatSchema
from src.schemas.message import (
  MessageSchema,
  ChatNestedSchema,
  SenderNestedSchema
)
from src.infra.database.database import get_session
from src.services.chat import chat_service
from src.services.users import users_service
from src.services.message import messages_service

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
  if (data.user_id):
    chat_service.add_user(session=session, chat_id=str(chat.id), user_id=data.user_id)
  return ChatSchema.model_validate_json(chat.model_dump_json())

@router.get(
  "/",
  status_code=HTTP_200_OK,
  response_model=List[ChatSchema]
)
async def get_all_chats(
  session: Session = Depends(get_session)
):
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

@router.get(
  "/{chat_id}/members",
  status_code=HTTP_200_OK,
  response_model=List[UserSchema]
)
async def get_members_by_chat(
  chat_id: str,
  session: Session = Depends(get_session)
):
  chat = chat_service.show(session=session, chat_id=chat_id)
  if chat is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Chat não encontrado"
    )

  members = chat_service.list_all_members_by_chat(
    session=session,
    chat_id=chat_id
  )

  return [
    UserSchema.model_validate_json(user.model_dump_json()) for user in members
  ]

@router.post(
  "/{chat_id}/join-member",
  status_code=HTTP_204_NO_CONTENT
)
async def join_member(
  chat_id: str,
  data: PayloadJoinMemberToChatSchema,
  session: Session = Depends(get_session)
):
  chat = chat_service.show(session=session, chat_id=chat_id)
  if chat is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Chat não encontrado"
    )

  user = users_service.show(session=session, user_id=data.user_id)
  if user is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Usuário não encontrado"
    )

  chat_service.add_user(session=session, chat_id=chat_id, user_id=data.user_id)


@router.get(
  "/{chat_id}/messages",
  response_model=List[MessageSchema]
)
def list_chat_messages(
  chat_id: str,
  session: Session = Depends(get_session),
):
  messages = messages_service.list_all(
    session=session,
    chat_id=chat_id
  )
  return [
    MessageSchema(
      id=str(message.id),
      chat_id=str(message.chat_id),
      sender_id=str(message.sender_id),
      content=message.content,
      status=message.status.value if hasattr(message.status, "value") else str(message.status),
      created_at=message.created_at,
      chat=ChatNestedSchema(
        id=str(message.chat.id),
        name=message.chat.name,
        created_at=message.chat.created_at,
        updated_at=message.chat.updated_at,
      ) if message.chat else None,
      sender=SenderNestedSchema(
        id=str(message.sender.id),
        username=message.sender.username,
        created_at=message.sender.created_at,
        updated_at=message.sender.updated_at,
      ) if message.sender else None,
    )
    for message in messages
  ]
