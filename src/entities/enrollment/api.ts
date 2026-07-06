import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { enrollmentSchema, type Enrollment } from "./model";
import { todayIso } from "@/entities/student/age";

export async function fetchEnrollments(): Promise<Enrollment[]> {
  const rows = await readCollection("enrollments");
  return rows.map((row) => enrollmentSchema.parse(row));
}

export async function fetchEnrollmentsByGroup(groupId: string): Promise<Enrollment[]> {
  const rows = await fetchEnrollments();
  return rows.filter((enrollment) => enrollment.groupId === groupId);
}

export async function fetchEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
  const rows = await fetchEnrollments();
  return rows.filter((enrollment) => enrollment.studentId === studentId);
}

export interface EnrollStudentInput {
  studentId: string;
  groupId: string;
}

export async function enrollStudent(input: EnrollStudentInput): Promise<Enrollment> {
  const existing = (await fetchEnrollments()).find(
    (row) => row.studentId === input.studentId && row.groupId === input.groupId,
  );
  if (existing) {
    if (existing.active) return existing;
    const reactivated: Enrollment = { ...existing, active: true };
    await mutateCollection<Enrollment>("enrollments", (rows) =>
      rows.map((row) => (row.id === existing.id ? reactivated : row)),
    );
    return reactivated;
  }
  const enrollment: Enrollment = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    groupId: input.groupId,
    joinedAt: todayIso(),
    active: true,
  };
  enrollmentSchema.parse(enrollment);
  await mutateCollection<Enrollment>("enrollments", (rows) => [...rows, enrollment]);
  return enrollment;
}

export async function unenrollStudent(input: EnrollStudentInput): Promise<void> {
  await mutateCollection<Enrollment>("enrollments", (rows) =>
    rows.map((row) =>
      row.studentId === input.studentId && row.groupId === input.groupId
        ? { ...row, active: false }
        : row,
    ),
  );
}
