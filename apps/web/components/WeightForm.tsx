'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LocalStorageWeightStore } from '../lib/store/localStorageWeightStore';
import type { Unit, WeightEntry } from '../lib/store/weightStore';
import { nowLocalNY } from '../lib/time';
import { weightCreateSchema } from '../lib/validation';

type FormValues = z.infer<typeof weightCreateSchema>;

type WeightFormProps = {
  demoMode: boolean;
  // eslint-disable-next-line no-unused-vars
  onEntryCreated(entry: WeightEntry): void;
  // eslint-disable-next-line no-unused-vars
  onError(message: string | null): void;
};

const weightFormSchema = weightCreateSchema.superRefine((data, ctx) => {
  if (data.mode === 'backfill' && data.readingDate) {
    const { readingDate: today } = nowLocalNY();
    if (data.readingDate > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['readingDate'],
        message: 'Backfilled date cannot be in the future.',
      });
    }
  }
});

const unitOptions: Unit[] = ['LB', 'KG'];

export default function WeightForm({ demoMode, onEntryCreated, onError }: WeightFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      mode: 'now',
      unit: 'LB',
      readingDate: '',
      readingTime: null,
    },
  });

  const mode = watch('mode');
  const unit = watch('unit');

  const maxDate = useMemo(() => nowLocalNY().readingDate, []);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      let entry: WeightEntry;

      if (demoMode) {
        const store = new LocalStorageWeightStore();
        const readingInfo =
          values.mode === 'now'
            ? nowLocalNY()
            : {
                readingDate: values.readingDate!,
                readingTime: null,
              };

        entry = await store.add({
          readingDate: readingInfo.readingDate,
          readingTime: readingInfo.readingTime ?? null,
          value: values.value,
          unit: values.unit,
          enteredUnit: values.unit,
        });
      } else {
        const response = await fetch('/api/weights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: values.value,
            unit: values.unit,
            mode: values.mode,
            readingDate: values.mode === 'backfill' ? values.readingDate : undefined,
            readingTime: null,
          }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? 'Unable to save the entry.');
        }

        entry = (await response.json()) as WeightEntry;
      }

      onEntryCreated(entry);
      onError(null);

      reset({
        mode: values.mode,
        unit: values.unit,
        value: undefined,
        readingDate: '',
        readingTime: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save the entry.';
      setSubmitError(message);
      onError(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow">
      <div>
        <label className="block text-sm font-medium text-slate-200" htmlFor="value">
          Weight
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="value"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none"
            {...register('value', { valueAsNumber: true })}
          />
          <div className="flex rounded border border-slate-700 bg-slate-950 p-1 text-xs font-semibold">
            {unitOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setValue('unit', option)}
                className={`rounded px-3 py-1 transition ${
                  unit === option ? 'bg-slate-200 text-slate-900' : 'text-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {errors.value && <p className="mt-1 text-xs text-rose-400">{errors.value.message}</p>}
      </div>

      <div>
        <span className="text-sm font-medium text-slate-200">Mode</span>
        <div className="mt-2 flex items-center gap-2">
          {(
            [
              { value: 'now', label: 'Now' },
              { value: 'backfill', label: 'Backfill' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setValue('mode', option.value);
                if (option.value === 'now') {
                  setValue('readingDate', '');
                }
              }}
              className={`rounded border px-3 py-1 text-sm transition ${
                mode === option.value
                  ? 'border-slate-300 bg-slate-200 text-slate-900'
                  : 'border-slate-700 bg-slate-950 text-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'backfill' && (
        <div>
          <label className="block text-sm font-medium text-slate-200" htmlFor="readingDate">
            Reading date
          </label>
          <input
            id="readingDate"
            type="date"
            max={maxDate}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-slate-400 focus:outline-none"
            {...register('readingDate')}
          />
          {errors.readingDate && <p className="mt-1 text-xs text-rose-400">{errors.readingDate.message}</p>}
        </div>
      )}

      {submitError && <p className="text-sm text-rose-400">{submitError}</p>}

      <button
        type="submit"
        className="w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving…' : 'Add entry'}
      </button>
    </form>
  );
}
