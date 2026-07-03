import { readCollection } from "@/shared/lib/storage/db";
import { schoolEventSchema, type SchoolEvent } from "./model";

export async function fetchSchoolEvents(): Promise<SchoolEvent[]> {
  const rows = await readCollection("schoolEvents");
  return rows.map((row) => schoolEventSchema.parse(row));
}
