from typing import Optional, List
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

class JournalRepository:
    """Repository untuk mengisolasi query database pada tabel 'entries'."""
    
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, content: str, word_count: int, emoji: str = "happy") -> JournalEntryModel:
        entry_db = JournalEntryModel(
            user_id=user_id,
            content=content,
            emoji=emoji,
            word_count=word_count
        )
        self.db.add(entry_db)
        self.db.commit()
        self.db.refresh(entry_db)
        return entry_db

    def get_user_entries(self, user_id: str, limit: int = 10, offset: int = 0) -> List[JournalEntryModel]:
        """
        Mengambil entri jurnal milik user tertentu dengan Pagination.
        Diurutkan berdasarkan created_at terbaru (Descending).
        """
        return (
            self.db.query(JournalEntryModel)
            .filter(JournalEntryModel.user_id == user_id)
            .order_by(JournalEntryModel.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )        