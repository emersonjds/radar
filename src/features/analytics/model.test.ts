import { describe, expect, it } from "vitest";
import type { AttendanceRecord } from "@/entities/attendance-record/model";
import { studentsAtRisk, countAbsences, attendanceRate, absenteeismTrend } from "./model";

function presenca(status: AttendanceRecord["status"], id = "x"): AttendanceRecord {
  return { id, sessionId: "c1", studentId: "a1", status };
}

describe("attendanceRate", () => {
  it("counts presente and atrasado as present", () => {
    const rows = [presenca("present"), presenca("late"), presenca("absent")];
    expect(attendanceRate(rows)).toBe(67);
  });

  it("returns 0 with no records", () => {
    expect(attendanceRate([])).toBe(0);
  });

  it("justificado does not count as present", () => {
    expect(attendanceRate([presenca("present"), presenca("excused")])).toBe(50);
  });
});

describe("countAbsences", () => {
  it("counts only ausente", () => {
    const rows = [presenca("absent"), presenca("absent"), presenca("late")];
    expect(countAbsences(rows)).toBe(2);
  });
});

describe("studentsAtRisk", () => {
  it("returns students at/above the threshold, worst first", () => {
    const map = new Map<string, AttendanceRecord[]>([
      ["a1", [presenca("absent"), presenca("absent"), presenca("absent")]],
      ["a2", [presenca("absent"), presenca("present")]],
      ["a3", [presenca("present")]],
    ]);
    const risco = studentsAtRisk(map, 2);
    expect(risco.map((r) => r.studentId)).toEqual(["a1"]);
    expect(risco[0].absences).toBe(3);
  });
});

describe("absenteeismTrend", () => {
  it("computes absence rate per date, chronological", () => {
    const pontos = absenteeismTrend([
      { date: "2026-06-18", status: "absent" },
      { date: "2026-06-18", status: "present" },
      { date: "2026-06-16", status: "present" },
    ]);
    expect(pontos).toEqual([
      { date: "2026-06-16", absenceRate: 0 },
      { date: "2026-06-18", absenceRate: 50 },
    ]);
  });
});
