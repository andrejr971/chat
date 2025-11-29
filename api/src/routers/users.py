import logging
from typing import List
from starlette.status import (
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_204_NO_CONTENT,
  HTTP_404_NOT_FOUND,
  HTTP_409_CONFLICT
)
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.infra.database.database import get_session
from src.schemas.chat import ChatSchema
from src.schemas.users import PayloadUserSchema, UserSchema
from src.services.users import users_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
  "/",
  status_code=HTTP_201_CREATED,
  response_model=UserSchema
)
async def create_user(
  data: PayloadUserSchema,
  session: Session = Depends(get_session)
):
  username_in_use = users_service.get_by_username(
    session=session,
    username=data.username
  )
  if username_in_use:
    raise HTTPException(
      status_code=HTTP_409_CONFLICT,
      detail="Username já existe"
    )
  user = users_service.create(
    session=session,
    data=data
  )
  return UserSchema.model_validate_json(user.model_dump_json())

@router.get(
  "/",
  status_code=HTTP_200_OK,
  response_model=List[UserSchema]
)
async def get_all_users(session: Session = Depends(get_session)):
  users = users_service.list_all(session=session)
  return [
    UserSchema.model_validate_json(user.model_dump_json()) for user in users
  ]

@router.get(
  "/{user_id}",
  status_code=HTTP_200_OK,
  response_model=UserSchema
)
async def get_user(
  user_id: str,
  session: Session = Depends(get_session)
):
  user = users_service.show(session=session, user_id=user_id)
  if user is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Usuário não encontrado"
    )
  return UserSchema.model_validate_json(user.model_dump_json())

@router.put(
  "/{user_id}",
  status_code=HTTP_200_OK,
  response_model=UserSchema
)
async def update_user(
  user_id: str,
  data: PayloadUserSchema,
  session: Session = Depends(get_session)
):
  user = users_service.show(session=session, user_id=user_id)
  if user is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Usuário não encontrado"
    )
  username_in_use = users_service.get_by_username(
    session=session,
    username=data.username
  )
  if username_in_use and username_in_use.id != user.id:
    raise HTTPException(
      status_code=HTTP_409_CONFLICT,
      detail="Username já existe"
    )
  updated_user = users_service.update(
    data=data,
    session=session,
    user_id=user_id
  )
  user.username = data.username
  user.updated_at = updated_user.updated_at if updated_user and updated_user.updated_at else user.updated_at
  return UserSchema.model_validate_json(user.model_dump_json())

@router.delete(
  "/{user_id}",
  status_code=HTTP_204_NO_CONTENT,
)
async def delete_user(
  user_id: str,
  session: Session = Depends(get_session)
):
  user = users_service.show(session=session, user_id=user_id)
  if user is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Usuário não encontrado"
    )
  users_service.delete(
    session=session,
    user_id=user_id
  )

@router.get(
  "/{user_id}/chats",
  status_code=HTTP_200_OK,
  response_model=List[ChatSchema]
)
async def get_user_chats(
  user_id: str,
  session: Session = Depends(get_session)
):
  chats = users_service.list_user_chats(
    session=session,
    user_id=user_id
  )
  if chats is None:
    raise HTTPException(
      status_code=HTTP_404_NOT_FOUND,
      detail="Usuário não encontrado"
    )
  return [
    ChatSchema.model_validate_json(chat.model_dump_json()) for chat in chats
  ]
