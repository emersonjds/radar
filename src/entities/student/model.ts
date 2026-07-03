import { z } from "zod";

export const studentSchema = z.object({
  id: z.string(),
  name: z.string(),
  enrollment: z.string(),
  groupId: z.string(),
  active: z.boolean(),
});

export type Student = z.infer<typeof studentSchema>;
