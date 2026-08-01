export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  emoji?: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface JournalCreatePayload {
  content: string;
  emoji?: string;
}

export interface JournalStats {
  current_streak: number;
  longest_streak: number;
  total_entries: number;
  wrote_today: boolean;
}