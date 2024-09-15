import { z } from "zod";

const TrueValue = "true";
const FalseValue = "false";

const schema = z.preprocess((val) => {
  if (val === TrueValue) return true;
  if (val === FalseValue) return false;
  return val;
}, z.boolean());

export const boolean = Object.freeze({
  schema,
  True: TrueValue,
  False: FalseValue,
});
