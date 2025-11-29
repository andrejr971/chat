from typing import Generator
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, echo=False)

def init_db():
  SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
  with Session(engine) as session:
    yield session
