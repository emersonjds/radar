import { readCollection } from "@/shared/lib/storage/db";
import { subjectSchema, type Subject } from "./model";

export async function fetchSubjects(): Promise<Subject[]> {
  const rows = await readCollection("subjects");
  return rows.map((row) => subjectSchema.parse(row));
}
