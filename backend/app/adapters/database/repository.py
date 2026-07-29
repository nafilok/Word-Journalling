from typing import Optional
from sqlalchemy.orm import Session
from app.adapters.database.models import UserModel, JournalEntryModel
from app.core.entities import JournalEntryEntity

class UserRepository:
    """Repository untuk mengisolasi operasi I/O database tabel 'users'."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_username(self, username: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.username == username).first()

    def get_by_id(self, user_id: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def create(self, username: str, email: str, password_hash: str) -> UserModel:
        user_db = UserModel(
            username=username,
            email=email,
            password_hash=password_hash
        )
        self.db.add(user_db)
        self.db.commit()
        self.db.refresh(user_db)
        return user_db