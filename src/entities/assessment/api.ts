import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { assessmentSchema, type Assessment } from "./model";

export async function fetchAssessments(): Promise<Assessment[]> {
  const rows = await readCollection("assessments");
  return rows.map((row) => assessmentSchema.parse(row));
}

export async function fetchAssessmentsByGroup(
  groupId: string,
): Promise<Assessment[]> {
  const assessments = await fetchAssessments();
  return assessments
    .filter((assessment) => assessment.groupId === groupId)
    .sort((assessmentA, assessmentB) => assessmentB.date.localeCompare(assessmentA.date));
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface NewAssessment {
  groupId: string;
  name: string;
  date: string;
  weight: number;
  teacherId: string;
}

/**
 * Create an assessment. Unique per (group, name, date) via the deterministic
 * id — creating an existing one returns it instead of duplicating. The real
 * uniqueness guard will live in Postgres constraints later.
 */
export async function createAssessment(input: NewAssessment): Promise<Assessment> {
  const assessment = assessmentSchema.parse({
    id: `assessment-${input.groupId}-${slug(input.name)}-${input.date}`,
    ...input,
  });
  await mutateCollection<Assessment>("assessments", (rows) => {
    const exists = rows.some((row) => row.id === assessment.id);
    return exists ? rows : [...rows, assessment];
  });
  return assessment;
}
