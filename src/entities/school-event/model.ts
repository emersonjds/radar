import { z } from "zod";

export const schoolEventTypeSchema = z.enum(["vacation", "makeup", "event"]);

export const schoolEventSchema = z.object({
  id: z.string(),
  type: schoolEventTypeSchema,
  title: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
});

export type SchoolEventType = z.infer<typeof schoolEventTypeSchema>;
export type SchoolEvent = z.infer<typeof schoolEventSchema>;

/** Expands an inclusive "YYYY-MM-DD" range into each date it covers. */
export function datesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
