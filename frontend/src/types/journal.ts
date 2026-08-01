export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface JournalCreatePayload {
  content: string;
}