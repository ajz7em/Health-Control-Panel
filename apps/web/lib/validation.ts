import { z } from 'zod';

export const unitSchema = z.enum(['KG', 'LB']);
export const modeSchema = z.enum(['now', 'backfill']);

export const weightCreateSchema = z
  .object({
    value: z.coerce.number({ invalid_type_error: 'Enter a valid weight.' }).gt(0, 'Weight must be greater than zero.').lt(1000, 'Weight must be under 1000.'),
    unit: unitSchema,
    mode: modeSchema,
    readingDate: z.string().optional(),
    readingTime: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'now') {
      return;
    }

    if (!data.readingDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['readingDate'],
        message: 'Select a date for backfilled entries.',
      });
    }

    if (data.readingTime !== null && data.readingTime !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['readingTime'],
        message: 'Backfilled entries do not capture a time.',
      });
    }
  });

export const weightEntrySchema = z.object({
  id: z.string(),
  kg: z.number(),
  lb: z.number(),
  readingDate: z.string(),
  readingTime: z.string().nullable().optional(),
  createdAt: z.string(),
  enteredUnit: unitSchema,
});

export const weightEntriesSchema = z.array(weightEntrySchema);

export type WeightCreateInput = z.infer<typeof weightCreateSchema>;
