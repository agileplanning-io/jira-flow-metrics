import { isNullish } from "remeda";
import { z } from "zod";

const TrueValue = "true";
const FalseValue = "false";

const schema = z
  .string()
  .optional()
  .transform((val) => (isNullish(val) || val === FalseValue ? false : true));

export const boolean = Object.freeze({
  schema,
  True: TrueValue,
  False: FalseValue,
});
