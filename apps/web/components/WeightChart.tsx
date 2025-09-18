'use client';

import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Unit, WeightEntry } from '../lib/store/weightStore';
import { parseLocalDate } from '../lib/time';

const unitOptions: Unit[] = ['LB', 'KG'];

type ChartPoint = {
  id: string;
  timestamp: number;
  readingDate: string;
  readingTime: string | null;
  value: number;
};

type WeightChartProps = {
  entries: WeightEntry[];
};

const sortEntries = (entries: WeightEntry[]) =>
  [...entries].sort((a, b) => {
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
  });

const buildChartData = (entries: WeightEntry[], unit: Unit): ChartPoint[] => {
  const jitterPerDay = new Map<string, number>();

  return sortEntries(entries).map((entry) => {
    const baseDate = parseLocalDate(entry.readingDate);
    let timestamp = baseDate.getTime();

    if (entry.readingTime) {
      const [hours, minutes] = entry.readingTime.split(':').map(Number);
      timestamp += hours * 60 * 60 * 1000 + minutes * 60 * 1000;
    } else {
      const count = jitterPerDay.get(entry.readingDate) ?? 0;
      jitterPerDay.set(entry.readingDate, count + 1);
      timestamp += count * 5 * 60 * 1000;
    }

    return {
      id: entry.id,
      timestamp,
      readingDate: entry.readingDate,
      readingTime: entry.readingTime ?? null,
      value: unit === 'LB' ? entry.lb : entry.kg,
    };
  });
};

const ChartTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  label?: number;
  unit: Unit;
}) => {
  if (!active || !payload || payload.length === 0 || label === undefined) {
    return null;
  }

  const point = payload[0].payload;
  const date = format(new Date(label), 'PPP');

  return (
    <div className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow">
      <div className="font-semibold">{date}</div>
      {point.readingTime && <div className="text-slate-300">{point.readingTime}</div>}
      <div className="mt-2 text-sm font-semibold">
        {point.value.toFixed(2)} {unit}
      </div>
    </div>
  );
};

export default function WeightChart({ entries }: WeightChartProps) {
  const [unit, setUnit] = useState<Unit>('LB');

  const data = useMemo(() => buildChartData(entries, unit), [entries, unit]);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
        No data yet — add your first weight above.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Weight trend</h2>
          <p className="text-xs text-slate-400">Toggle units without mutating stored data.</p>
        </div>
        <div className="flex rounded border border-slate-700 bg-slate-950 p-1 text-xs font-semibold">
          {unitOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setUnit(option)}
              className={`rounded px-3 py-1 transition ${
                unit === option ? 'bg-slate-200 text-slate-900' : 'text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis
              dataKey="timestamp"
              type="number"
              stroke="#94a3b8"
              domain={['auto', 'auto']}
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
            />
            <YAxis
              stroke="#94a3b8"
              width={60}
              tickFormatter={(value: number) => value.toFixed(2)}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
