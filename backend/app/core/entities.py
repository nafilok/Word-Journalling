from datetime import datetime
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
        id: Optional[UUID] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.content = content
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    @property
    def calculate_word_count(self) -> int:
        # Simple logic: Counting words inside the journal
        if not self.content:
            return 0
        return len(self.content.split())

