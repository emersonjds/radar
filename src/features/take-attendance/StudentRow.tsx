import type { Student } from "@/entities/student/model";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import AvatarText from "@tailadmin/components/ui/avatar/AvatarText";

// `short` follows the Brazilian class-register convention: P/A/F/J.
export const STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
  short: string;
  active: string;
}> = [
  { value: "present", label: "Presente", short: "P", active: "bg-success-500 text-white" },
  { value: "late", label: "Atrasado", short: "A", active: "bg-warning-500 text-white" },
  { value: "absent", label: "Ausente", short: "F", active: "bg-error-500 text-white" },
  { value: "excused", label: "Justificado", short: "J", active: "bg-brand-500 text-white" },
];

export interface StudentRowProps {
  aluno: Student;
  status: AttendanceStatus | undefined;
  onSelectStatus: (status: AttendanceStatus) => void;
}

export function StudentRow({ aluno, status, onSelectStatus }: StudentRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 ${
        status === "absent" ? "opacity-70" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <AvatarText name={aluno.name} />
        <span className="truncate font-medium text-gray-800">{aluno.name}</span>
      </div>

      <div
        className="flex shrink-0 gap-1.5"
        role="group"
        aria-label={`Status de presença de ${aluno.name}`}
      >
        {STATUS_OPTIONS.map((opcao) => {
          const ativo = status === opcao.value;
          return (
            <button
              key={opcao.value}
              type="button"
              aria-pressed={ativo}
              aria-label={opcao.label}
              title={opcao.label}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                ativo ? opcao.active : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => onSelectStatus(opcao.value)}
            >
              {opcao.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
