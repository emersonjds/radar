import { z } from "zod";

export const areaSchema = z.enum(["exatas", "biologicas", "linguagens", "humanas"]);
export type Area = z.infer<typeof areaSchema>;

export const AREAS: Area[] = ["exatas", "biologicas", "linguagens", "humanas"];

export const areaLabels: Record<Area, string> = {
  exatas: "Exatas",
  biologicas: "Biológicas",
  linguagens: "Linguagens",
  humanas: "Humanas",
};

export const subjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  area: areaSchema,
});

export type Subject = z.infer<typeof subjectSchema>;
