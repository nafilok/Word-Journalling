from fastapi import APIRouter, Depends, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from app.adapters.database.session import get_db
from app.adapters.database.repository import JournalRepository
from app.infrastructure.api.auth import get_current_user, UserResponse
from app.core.entities import JournalEntryEntity, StreakCalculator

router = APIRouter(prefix="/api/entries", tags=["Journal Entries"])

# --- PYDANTIC SCHEMAS (DTO) ---
class JournalEntryCreateRequest(BaseModel):
    content: str
    emoji: Optional[str] = "happy"

class JournalEntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    emoji: Optional[str] = "happy"
    word_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JournalStatsResponse(BaseModel):
    current_streak: int
    longest_streak: int
    total_entries: int
    wrote_today: bool


# --- ENDPOINTS TERPROTEKSI ---
@router.post("", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    request: JournalEntryCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Menyimpan jurnal baru.
    Logika bisnis perhitungan word_count dieksekusi via Pure Domain Entity.
    """
    # 1. Gunakan Pure Domain Entity untuk menghitung word count (Clean Architecture)
    domain_entity = JournalEntryEntity(
        user_id=current_user.id,
        content=request.content,
        emoji=request.emoji
    )
    calculated_words = domain_entity.calculate_word_count

    # 2. Simpan ke database via Repository Pattern
    journal_repo = JournalRepository(db)
    new_entry = journal_repo.create(
        user_id=str(current_user.id),
        content=request.content,
        word_count=calculated_words,
        emoji=domain_entity.emoji
    )
    return new_entry


@router.get("", response_model=List[JournalEntryResponse])
def get_my_entries(
    limit: Optional[int] = Query(default=None, ge=1, description="Jumlah data per halaman"),
    page: int = Query(default=1, ge=1, description="Nomor halaman"),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengambil riwayat jurnal milik pengguna yang sedang login.
    Jika `limit` tidak diberikan, mengembalikan seluruh entri jurnal.
    """
    offset = (page - 1) * limit if limit is not None else None
    journal_repo = JournalRepository(db)
    entries = journal_repo.get_user_entries(
        user_id=str(current_user.id),
        limit=limit,
        offset=offset
    )
    return entries


@router.get("/stats", response_model=JournalStatsResponse)
def get_my_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengambil statistik gamifikasi streak harian milik pengguna yang sedang login.
    """
    journal_repo = JournalRepository(db)
    timestamps = journal_repo.get_user_entry_dates(str(current_user.id))
    calculator = StreakCalculator(timestamps)
    return calculator.calculate()