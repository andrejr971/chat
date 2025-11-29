from fastapi import APIRouter


router = APIRouter()


@router.get('/health')
async def health_live():
  return { 
    "status": "ok",
  }