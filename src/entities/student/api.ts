import { readCollection } from "@/shared/lib/storage/db";
import { studentSchema, type Student } from "./model";

export async function fetchStudents(): Promise<Student[]> {
  const rows = await readCollection("students");
  return rows.map((row) => studentSchema.parse(row));
}

export async function fetchStudentsByGroup(groupId: string): Promise<Student[]> {
  const students = await fetchStudents();
  return students.filter((student) => student.groupId === groupId);
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  const students = await fetchStudents();
  return students.find((student) => student.id === id) ?? null;
}
