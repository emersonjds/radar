import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
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

export interface NewStudentInput {
  name: string;
  groupId: string;
}

export interface StudentUpdate {
  name?: string;
  groupId?: string;
  active?: boolean;
}

// ponytail: sequential demo enrollment (EDU-2026-N), auto-assigned so the user
// never types a matrícula. The backend will own id/enrollment generation later.
function nextEnrollment(students: Student[]): string {
  const highest = students.reduce((max, student) => {
    const seq = Number(student.enrollment.split("-").pop());
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 999);
  return `EDU-2026-${highest + 1}`;
}

export async function createStudent(input: NewStudentInput): Promise<Student> {
  const students = await fetchStudents();
  const enrollment = nextEnrollment(students);
  const student: Student = {
    id: `aluno-${enrollment}`,
    name: input.name.trim(),
    enrollment,
    groupId: input.groupId,
    active: true,
  };
  studentSchema.parse(student);
  await mutateCollection<Student>("students", (rows) => [...rows, student]);
  return student;
}

export async function updateStudent(id: string, patch: StudentUpdate): Promise<void> {
  await mutateCollection<Student>("students", (rows) =>
    rows.map((student) => (student.id === id ? { ...student, ...patch } : student)),
  );
}

export async function deleteStudent(id: string): Promise<void> {
  await mutateCollection<Student>("students", (rows) => rows.filter((student) => student.id !== id));
}
