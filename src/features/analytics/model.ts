import {
  PRESENT_STATUSES,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/entities/attendance-record/model";

export function attendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const present = records.filter((record) => PRESENT_STATUSES.includes(record.status)).length;
  return Math.round((present / records.length) * 100);
}

export function countAbsences(records: AttendanceRecord[]): number {
  return records.filter((record) => record.status === "absent").length;
}

export interface StudentAtRisk {
  studentId: string;
  absences: number;
  attendance: number;
}

export function studentsAtRisk(
  recordsByStudent: Map<string, AttendanceRecord[]>,
  absenceThreshold: number,
): StudentAtRisk[] {
  const atRisk: StudentAtRisk[] = [];
  for (const [studentId, records] of recordsByStudent) {
    const absences = countAbsences(records);
    if (absences >= absenceThreshold) {
      atRisk.push({ studentId, absences, attendance: attendanceRate(records) });
    }
  }
  return atRisk.sort((studentA, studentB) => studentB.absences - studentA.absences);
}

export interface AbsenteeismPoint {
  date: string;
  absenceRate: number;
}

export function absenteeismTrend(
  records: { date: string; status: AttendanceStatus }[],
): AbsenteeismPoint[] {
  const byDate = new Map<string, { total: number; absent: number }>();
  for (const record of records) {
    const bucket = byDate.get(record.date) ?? { total: 0, absent: 0 };
    bucket.total += 1;
    if (record.status === "absent") bucket.absent += 1;
    byDate.set(record.date, bucket);
  }
  return [...byDate.entries()]
    .map(([date, { total, absent }]) => ({
      date,
      absenceRate: total === 0 ? 0 : Math.round((absent / total) * 100),
    }))
    .sort((pointA, pointB) => pointA.date.localeCompare(pointB.date));
}
