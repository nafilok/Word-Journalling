'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { JournalEntry, JournalCreatePayload } from '@/types/journal';

export default function JournalDashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
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

  const loadJournalEntries = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Mengambil entri jurnal terpaginasi dari FastAPI
      const data = await apiFetch<JournalEntry[]>('/api/entries?page=1&size=10');
      setEntries(data);
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
      const payload: JournalCreatePayload = { content };
      const newEntry = await apiFetch<JournalEntry>('/api/entries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Update state lokal secara reaktif (prepend)
      setEntries((prev) => [newEntry, ...prev]);
      setContent('');
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📓</span>
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
        
        {/* Kolom Kiri: Input Form & Sentiment Placeholder */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Tulis Jurnal Hari Ini
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bagaimana perasannmu dan cerita harimu hari ini?"
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

          {/* Placeholder Insight & Analytics Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-md">
            <h3 className="text-sm font-medium opacity-90 mb-1">Perkembangan Emosi</h3>
            <p className="text-2xl font-bold">Stabil & Positif (Belum adaptif) </p>
            <p className="text-xs opacity-75 mt-2">
              Modul analitik sentimen akan menghitung tren emotif dari seluruh entri tulisanmu.
            </p>
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
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition hover:shadow-md"
                >
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed text-sm mb-4">
                    {entry.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                    <span>
                      {new Date(entry.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {entry.word_count} kata
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}