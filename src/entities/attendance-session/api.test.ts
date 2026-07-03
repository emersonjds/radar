import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { createAttendanceSession, fetchAttendanceSessionsByGroup } from "./api";

describe("session api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("is unique per (group, date) — creating twice does not duplicate", async () => {
    const input = {
      groupId: "group-mat-b",
      date: "2026-07-02",
      teacherId: "profile-ricardo",
    };
    await createAttendanceSession(input);
    await createAttendanceSession(input);
    const sessions = await fetchAttendanceSessionsByGroup("group-mat-b");
    const doDia = sessions.filter((session) => session.date === "2026-07-02");
    expect(doDia).toHaveLength(1);
  });

  it("rejects a malformed date", async () => {
    await expect(
      createAttendanceSession({
        groupId: "group-mat-b",
        date: "02/07/2026",
        teacherId: "profile-ricardo",
      }),
    ).rejects.toThrow();
  });
});
