import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { attendanceSessionSchema, type AttendanceSession } from "./model";

export async function fetchAttendanceSessions(): Promise<AttendanceSession[]> {
  const rows = await readCollection("attendanceSessions");
  return rows.map((row) => attendanceSessionSchema.parse(row));
}

export async function fetchAttendanceSessionsByGroup(
  groupId: string,
): Promise<AttendanceSession[]> {
  const sessions = await fetchAttendanceSessions();
  return sessions
    .filter((session) => session.groupId === groupId)
    .sort((sessionA, sessionB) => sessionB.date.localeCompare(sessionA.date));
}

export interface NewAttendanceSession {
  groupId: string;
  date: string;
  teacherId: string;
}

/**
 * Create a class session. A session is unique per (group, date) — creating one
 * that already exists returns the existing record instead of duplicating it.
 * The real uniqueness guard will live in Postgres constraints later.
 */
export async function createAttendanceSession(
  input: NewAttendanceSession,
): Promise<AttendanceSession> {
  const session = attendanceSessionSchema.parse({
    id: `session-${input.groupId}-${input.date}`,
    ...input,
  });
  await mutateCollection<AttendanceSession>("attendanceSessions", (rows) => {
    const exists = rows.some((row) => row.groupId === session.groupId && row.date === session.date);
    return exists ? rows : [...rows, session];
  });
  return session;
}
