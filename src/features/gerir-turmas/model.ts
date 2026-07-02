import { z } from "zod";
import { turmaSchema } from "@/entities/turma/model";

export const turmaFormSchema = turmaSchema.omit({ id: true });

export type TurmaFormValues = z.infer<typeof turmaFormSchema>;
