import { isNullish } from "remeda";
import { z } from "zod";

export const booleanSchema = z
  .string()
  .optional()
  .transform((val) => (isNullish(val) || val === "false" ? false : true));
