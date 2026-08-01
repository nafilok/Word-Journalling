from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

class JournalEntryEntity:
    """
    Pure Domain Entity for Journal.
    Free from web framework dependeny or database.
    """
    def __init__(
        self,
        user_id: UUID,
        content: str,
        emoji: Optional[str] = "happy",
        id: Optional[UUID] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.content = content
        self.emoji = emoji or "happy"
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    @property
    def calculate_word_count(self) -> int:
        # Simple logic: Counting words inside the journal
        if not self.content:
            return 0
        return len(self.content.split())


class StreakCalculator:
    """
    Pure Domain Entity untuk menghitung streak beruntun penulisan jurnal.
    Menerima daftar timestamp created_at dan menghasilkan matriks motivasi gamifikasi.
    """
    def __init__(self, timestamps: list[datetime]):
        self.timestamps = timestamps

    def calculate(self, reference_date: Optional[datetime] = None) -> dict:
        if not self.timestamps:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "total_entries": 0,
                "wrote_today": False
            }

        ref_dt = reference_date or datetime.utcnow()
        today = ref_dt.date()
        yesterday = today - timedelta(days=1)

        # Himpunan tanggal unik di mana user telah menulis jurnal (YYYY-MM-DD)
        unique_dates = {dt.date() for dt in self.timestamps if dt}

        wrote_today = today in unique_dates
        wrote_yesterday = yesterday in unique_dates

        # Hitung current_streak
        current_streak = 0
        if wrote_today or wrote_yesterday:
            check_date = today if wrote_today else yesterday
            while check_date in unique_dates:
                current_streak += 1
                check_date -= timedelta(days=1)

        # Hitung longest_streak (rekor terpanjang sepanjang masa)
        sorted_dates = sorted(unique_dates)
        longest_streak = 0
        temp_streak = 0
        prev_date = None

        for d in sorted_dates:
            if prev_date is None or d == prev_date + timedelta(days=1):
                temp_streak += 1
            else:
                temp_streak = 1
            if temp_streak > longest_streak:
                longest_streak = temp_streak
            prev_date = d

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_entries": len(self.timestamps),
            "wrote_today": wrote_today
        }

