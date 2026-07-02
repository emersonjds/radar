import { z } from "zod";

export const papelSchema = z.enum(["professor", "admin"]);
export type Papel = z.infer<typeof papelSchema>;

export const perfilSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string().email(),
  papel: papelSchema,
  cargo: z.string().optional(),
});

export type Perfil = z.infer<typeof perfilSchema>;
