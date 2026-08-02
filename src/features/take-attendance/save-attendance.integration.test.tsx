import { beforeEach, describe, expect, it } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookWithQuery } from "@/test/react-query";
import {
  useCreateAttendanceSession,
  useAttendanceSessionsByGroup,
} from "@/entities/attendance-session/queries";
import {
  useSetAttendanceRecord,
  useAttendanceRecordsBySession,
} from "@/entities/attendance-record/queries";

describe("salvar chamada (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a session, upserts presence status, and never duplicates", async () => {
    const sessionId = "chamada-turma-mat-b-2026-07-02";

    const { result: criar } = renderHookWithQuery(() => useCreateAttendanceSession());
    await act(async () => {
      await criar.current.mutateAsync({
        groupId: "turma-mat-b",
        date: "2026-07-02",
        teacherId: "perfil-ricardo",
      });
      await criar.current.mutateAsync({
        groupId: "turma-mat-b",
        date: "2026-07-02",
        teacherId: "perfil-ricardo",
      });
    });

    const { result: definir } = renderHookWithQuery(() => useSetAttendanceRecord());
    await act(async () => {
      await definir.current.mutateAsync({
        sessionId,
        studentId: "aluno-1",
        status: "absent",
      });
      await definir.current.mutateAsync({
        sessionId,
        studentId: "aluno-1",
        status: "present",
      });
    });

    const { result: chamadas } = renderHookWithQuery(() =>
      useAttendanceSessionsByGroup("turma-mat-b"),
    );
    await waitFor(() => expect(chamadas.current.isSuccess).toBe(true));
    const doDia = (chamadas.current.data ?? []).filter((chamada) => chamada.date === "2026-07-02");
    expect(doDia).toHaveLength(1);

    const { result: presencas } = renderHookWithQuery(() =>
      useAttendanceRecordsBySession(sessionId),
    );
    await waitFor(() => expect(presencas.current.isSuccess).toBe(true));
    const doAluno = (presencas.current.data ?? []).filter(
      (presenca) => presenca.studentId === "aluno-1",
    );
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].status).toBe("present");
  });
});
