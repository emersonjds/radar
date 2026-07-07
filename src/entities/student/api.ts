import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { studentSchema, type Student } from "./model";
import { fetchEnrollmentsByGroup } from "@/entities/enrollment/api";

export async function fetchStudents(): Promise<Student[]> {
  const rows = await readCollection("students");
  return rows.map((row) => studentSchema.parse(row));
}

export async function fetchStudentsByGroup(groupId: string): Promise<Student[]> {
  const [students, enrollments] = await Promise.all([
    fetchStudents(),
    fetchEnrollmentsByGroup(groupId),
  ]);
  const studentIds = new Set(
    enrollments.filter((enrollment) => enrollment.active).map((enrollment) => enrollment.studentId),
  );
  return students.filter((student) => studentIds.has(student.id));
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  const students = await fetchStudents();
  return students.find((student) => student.id === id) ?? null;
}

export interface NewStudentInput {
  name: string;
  birthDate: string;
  guardianName: string;
  guardianPhone: string;
}

export interface StudentUpdate {
  name?: string;
  birthDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  active?: boolean;
}

export async function createStudent(input: NewStudentInput): Promise<Student> {
  const student: Student = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    birthDate: input.birthDate,
    guardianName: input.guardianName.trim(),
    guardianPhone: input.guardianPhone.trim(),
    active: true,
  };
  studentSchema.parse(student);
  await mutateCollection<Student>("students", (rows) => [...rows, student]);
  return student;
}

export async function updateStudent(id: string, patch: StudentUpdate): Promise<void> {
  await mutateCollection<Student>("students", (rows) =>
    rows.map((student) =>
      student.id === id
        ? {
            ...student,
            ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
            ...(patch.birthDate !== undefined ? { birthDate: patch.birthDate } : {}),
            ...(patch.guardianName !== undefined
              ? { guardianName: patch.guardianName.trim() }
              : {}),
            ...(patch.guardianPhone !== undefined
              ? { guardianPhone: patch.guardianPhone.trim() }
              : {}),
            ...(patch.active !== undefined ? { active: patch.active } : {}),
          }
        : student,
    ),
  );
}

export async function deleteStudent(id: string): Promise<void> {
  await mutateCollection<Student>("students", (rows) =>
    rows.filter((student) => student.id !== id),
  );
}
