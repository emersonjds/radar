import { z } from "zod";

export const roleSchema = z.enum(["teacher", "coordinator", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const roleLabels: Record<Role, string> = {
  teacher: "Professor",
  coordinator: "Coordenador",
  admin: "Administrador",
};

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  role: roleSchema,
  jobTitle: z.string().optional(),
  username: z.string(),
  // Demo-only: SHA-256 hex of the password (see shared/lib/auth/password).
  passwordHash: z.string(),
  active: z.boolean(),
});

export type Profile = z.infer<typeof profileSchema>;
