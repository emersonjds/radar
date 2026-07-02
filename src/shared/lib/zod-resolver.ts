import type { Resolver } from "react-hook-form";
import type { z } from "zod";

// ponytail: hand-rolled instead of @hookform/resolvers — zod.safeParse + a field-error map is
// the whole job, no need for a dependency to wrap it.
export function zodResolver<T extends z.ZodType>(schema: T): Resolver<z.infer<T>> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!errors[key]) {
        errors[key] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}
