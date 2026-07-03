import { z } from "zod";

export const roleSchema = z.enum(["teacher", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: roleSchema,
  jobTitle: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
