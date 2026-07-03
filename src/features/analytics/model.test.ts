import { describe, expect, it } from "vitest";
import type { Assessment } from "@/entities/assessment/model";
import type { Grade } from "@/entities/grade/model";
import type { AttendanceRecord } from "@/entities/attendance-record/model";
import {
  studentsAtRisk,
  countAbsences,
  weightedAverage,
  attendanceRate,
  absenteeismTrend,
} from "./model";

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

describe("weightedAverage", () => {
  function avaliacao(id: string, weight: number): Assessment {
    return { id, groupId: "t1", name: id, date: "2026-06-20", weight, teacherId: "p1" };
  }
  function nota(assessmentId: string, value: number | null): Grade {
    return { id: `nota-${assessmentId}-a1`, assessmentId, studentId: "a1", value };
  }
  const avaliacoes = [avaliacao("a1", 2), avaliacao("a2", 1)];

  it("weighs by peso", () => {
    expect(weightedAverage([nota("a1", 8), nota("a2", 5)], avaliacoes)).toBe(7);
  });

  it("skips null and missing notas", () => {
    expect(weightedAverage([nota("a1", 9), nota("a2", null)], avaliacoes)).toBe(9);
  });

  it("returns null with no launched notas", () => {
    expect(weightedAverage([], avaliacoes)).toBeNull();
  });

  it("rounds to one decimal place", () => {
    // (7×2 + 8×1) / 3 = 7.333…
    expect(weightedAverage([nota("a1", 7), nota("a2", 8)], avaliacoes)).toBe(7.3);
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
