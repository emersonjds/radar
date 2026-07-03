import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { setAttendanceRecord, fetchAttendanceRecordsBySession } from "./api";

describe("record api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("upserts by (session, student) instead of duplicating", async () => {
    const base = { sessionId: "session-x", studentId: "student-1" };
    await setAttendanceRecord({ ...base, status: "absent" });
    await setAttendanceRecord({ ...base, status: "present" });
    const records = await fetchAttendanceRecordsBySession("session-x");
    const doAluno = records.filter((p) => p.studentId === "student-1");
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].status).toBe("present");
  });
});
