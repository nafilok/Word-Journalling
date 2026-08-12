'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { JournalEntry, JournalCreatePayload, JournalStats } from '@/types/journal';

type EmojiType = 'happy' | 'neutral' | 'sad';

const EMOJI_OPTIONS = [
  { id: 'happy', emoji: '😊', label: 'Senang', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', activeColor: 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105' },
  { id: 'neutral', emoji: '😐', label: 'Biasa', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', activeColor: 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105' },
  { id: 'sad', emoji: '😢', label: 'Sedih', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', activeColor: 'bg-rose-600 text-white border-rose-700 shadow-sm scale-105' },
] as const;

export default function JournalDashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [content, setContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType>('happy');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Protected Route Guard & Initial Data Fetching
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    loadJournalEntries();
  }, [router]);

  const fetchStats = async () => {
    try {
      const statsData = await apiFetch<JournalStats>('/api/entries/stats');
      setStats(statsData);
    } catch {
      // Silently ignore stats error fallback
    }
  };

  const loadJournalEntries = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Mengambil entri jurnal & statistik streak secara bersamaan
      const [entriesData, statsData] = await Promise.all([
        apiFetch<JournalEntry[]>('/api/entries'),
        apiFetch<JournalStats>('/api/entries/stats').catch(() => null),
      ]);
      setEntries(entriesData);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError(err.message || 'Gagal memuat data jurnal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Entry Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: JournalCreatePayload = { content, emoji: selectedEmoji };
      const newEntry = await apiFetch<JournalEntry>('/api/entries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Update state lokal secara reaktif (prepend) & re-fetch streak stats
      setEntries((prev) => [newEntry, ...prev]);
      setContent('');
      setSelectedEmoji('happy');
      fetchStats();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan jurnal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Helper badge metadata
  const getEmojiBadge = (emojiKey?: string) => {
    switch (emojiKey) {
      case 'happy':
        return { emoji: '😊', label: 'Senang', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'sad':
        return { emoji: '😢', label: 'Sedih', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'neutral':
      default:
        return { emoji: '😐', label: 'Biasa', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  // Mood Statistics
  const happyCount = entries.filter((e) => e.emoji === 'happy').length;
  const neutralCount = entries.filter((e) => e.emoji === 'neutral').length;
  const sadCount = entries.filter((e) => e.emoji === 'sad').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/icon.svg" alt="Journal Icon" className="w-8 h-8 rounded-lg shadow-sm" />
            <h1 className="text-xl font-bold text-slate-800">Word Journaling</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-red-600 transition"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Input Form & Emoji Selection */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Tulis Jurnal Hari Ini
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emoji Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Reaksi Emosi Hari Ini
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EMOJI_OPTIONS.map((opt) => {
                    const isSelected = selectedEmoji === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedEmoji(opt.id as EmojiType)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                          isSelected ? opt.activeColor : opt.color
                        }`}
                      >
                        <span className="text-2xl mb-0.5">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bagaimana perasaanmu dan cerita harimu hari ini?"
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal'}
              </button>
            </form>
          </div>

          {/* Gamification & Daily Streak Card */}
          <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-6 rounded-xl text-white shadow-lg border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-8xl pointer-events-none select-none">
              🔥
            </div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  🔥 Streak Harian Menulis
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-amber-300">
                    {stats?.current_streak || 0}
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    Hari Beruntun
                  </span>
                </div>
              </div>

              <div className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-400/40 font-semibold flex items-center gap-1">
                <span>🏆 Rekor:</span>
                <span className="font-bold">{stats?.longest_streak || 0} Hari</span>
              </div>
            </div>

            {/* Today status indicator */}
            <div className="mt-3 pt-3 border-t border-white/10">
              {stats?.wrote_today ? (
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-500/30">
                  <span className="text-base">✅</span>
                  <span>Hebat! Kamu sudah mencatat perkembanganmu hari ini.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-200 font-medium bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
                  <span className="text-base">⚡</span>
                  <span>Tulis jurnal harimu sekarang untuk menjaga streak-mu!</span>
                </div>
              )}
            </div>

            {/* Sub summary: Mood count & Total entries */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs opacity-90">
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-lg">
                <span>😊 {happyCount}</span>
                <span>😐 {neutralCount}</span>
                <span>😢 {sadCount}</span>
              </div>
              <span className="font-mono text-indigo-200 text-xs">
                Total: {stats?.total_entries || entries.length} Jurnal
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Feed Riwayat Jurnal */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Riwayat Catatan
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Memuat catatan jurnal...
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center border border-slate-200 text-slate-500 text-sm">
              Belum ada jurnal tersimpan. Mulai tulis cerita harimu!
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const badge = getEmojiBadge(entry.emoji);
                return (
                  <div
                    key={entry.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition hover:shadow-md"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.badgeClass}`}>
                        <span>{badge.emoji}</span>
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-slate-800 whitespace-pre-line leading-relaxed text-sm mb-4">
                      {entry.content}
                    </p>

                    <div className="flex justify-end items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {entry.word_count} kata
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}