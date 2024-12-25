import { z } from "zod";
import { cycleTimePolicySchema } from "./schema";

export const savedPolicy = z.object({
  id: z.string(),
  name: z.string(),
  policy: cycleTimePolicySchema,
  isDefault: z.boolean(),
});

export const draftPolicy = savedPolicy.omit({ id: true });

export type SavedPolicy = z.infer<typeof savedPolicy>;
export type DraftPolicy = z.infer<typeof draftPolicy>;
