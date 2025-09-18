'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import WeightChart from '../../components/WeightChart';
import WeightForm from '../../components/WeightForm';
import { LocalStorageWeightStore } from '../../lib/store/localStorageWeightStore';
import type { WeightEntry } from '../../lib/store/weightStore';
import { parseLocalDate } from '../../lib/time';

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

const compareEntries = (a: WeightEntry, b: WeightEntry) => {
  if (a.readingDate === b.readingDate) {
    if (a.readingTime === b.readingTime) {
      return a.createdAt.localeCompare(b.createdAt);
    }

    if (!a.readingTime) {
      return 1;
    }

    if (!b.readingTime) {
      return -1;
    }

    return a.readingTime.localeCompare(b.readingTime);
  }

  return a.readingDate.localeCompare(b.readingDate);
};

const sortEntries = (entries: WeightEntry[]) => [...entries].sort(compareEntries);

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (demoMode) {
          const store = new LocalStorageWeightStore();
          const data = await store.list();
          if (!cancelled) {
            setEntries(sortEntries(data));
          }
        } else {
          const response = await fetch('/api/weights', { cache: 'no-store' });
          if (!response.ok) {
            throw new Error('Unable to load weights');
          }

          const data = (await response.json()) as WeightEntry[];
          if (!cancelled) {
            setEntries(sortEntries(data));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load weight entries.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEntryCreated = useCallback((entry: WeightEntry) => {
    setEntries((prev) => sortEntries([...prev, entry]));
    setError(null);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setError(null);

      try {
        if (demoMode) {
          const store = new LocalStorageWeightStore();
          await store.remove(id);
          const updated = await store.list();
          setEntries(sortEntries(updated));
        } else {
          const response = await fetch(`/api/weights/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Unable to delete the entry.');
          }

          setEntries((prev) => prev.filter((entry) => entry.id !== id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to delete the entry.');
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const recentEntries = useMemo(() => {
    const ordered = sortEntries(entries);
    return ordered.slice(-5).reverse();
  }, [entries]);

  return (
    <div className="space-y-6">
      <section>
        <WeightForm demoMode={demoMode} onEntryCreated={handleEntryCreated} onError={setError} />
      </section>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Recent entries</h2>
            <p className="text-xs text-slate-400">The five most recent saved weights.</p>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : recentEntries.length === 0 ? (
          <p className="text-sm text-slate-400">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Weight (kg)</th>
                  <th className="px-3 py-2 font-medium">Weight (lb)</th>
                  <th className="px-3 py-2 font-medium">Entered</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentEntries.map((entry) => {
                  const date = parseLocalDate(entry.readingDate);
                  const dateLabel = format(date, 'MMM d, yyyy');
                  const timeLabel = entry.readingTime ?? '—';

                  return (
                    <tr key={entry.id} className="text-slate-200">
                      <td className="px-3 py-2 align-middle">{dateLabel}</td>
                      <td className="px-3 py-2 align-middle">{timeLabel}</td>
                      <td className="px-3 py-2 align-middle font-mono">{entry.kg.toFixed(2)}</td>
                      <td className="px-3 py-2 align-middle font-mono">{entry.lb.toFixed(2)}</td>
                      <td className="px-3 py-2 align-middle">{entry.enteredUnit}</td>
                      <td className="px-3 py-2 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="rounded border border-transparent px-2 py-1 text-xs text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </section>

      <section>
        <WeightChart entries={entries} />
      </section>
    </div>
  );
}
