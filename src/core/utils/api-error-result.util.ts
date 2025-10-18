import { FieldError } from "../types/field-error.type";

export const apiErrorResultUtil = (
  errors: FieldError[]
): { errorsMessages: FieldError[] } => {
  return { errorsMessages: errors };
};
