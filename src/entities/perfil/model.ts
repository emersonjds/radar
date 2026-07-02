import { z } from "zod";

export const perfilSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  email: z.string().email(),
  papel: z.enum(["professor", "admin"]),
});

export type PerfilInput = z.infer<typeof perfilSchema>;
