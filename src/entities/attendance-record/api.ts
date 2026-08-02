import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { attendanceRecordSchema, type AttendanceRecord, type AttendanceStatus } from "./model";

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const rows = await readCollection("attendanceRecords");
  return rows.map((row) => attendanceRecordSchema.parse(row));
}

export async function fetchAttendanceRecordsBySession(
  sessionId: string,
): Promise<AttendanceRecord[]> {
  const records = await fetchAttendanceRecords();
  return records.filter((record) => record.sessionId === sessionId);
}

export async function fetchAttendanceRecordsByStudent(
  studentId: string,
): Promise<AttendanceRecord[]> {
  const records = await fetchAttendanceRecords();
  return records.filter((record) => record.studentId === studentId);
}

/**
 * Set a student's status in a session. Unique per (session, student) — an existing
 * record is updated in place instead of duplicated (server constraint later).
 */
export async function setAttendanceRecord(input: {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
}): Promise<AttendanceRecord> {
  const record = attendanceRecordSchema.parse({
    id: `record-${input.sessionId}-${input.studentId}`,
    ...input,
  });
  await mutateCollection<AttendanceRecord>("attendanceRecords", (rows) => {
    const index = rows.findIndex(
      (row) => row.sessionId === record.sessionId && row.studentId === record.studentId,
    );
    if (index === -1) return [...rows, record];
    const next = [...rows];
    next[index] = record;
    return next;
  });
  return record;
}
