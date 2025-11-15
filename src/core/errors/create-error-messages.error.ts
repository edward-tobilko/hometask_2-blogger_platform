import { ValidationError } from "./types/validation-error.type";
import { ValidationErrorListOutput } from "./types/validation-error.type-output";

export const createErrorMessages = (
  errors: ValidationError[]
): ValidationErrorListOutput => {
  return {
    errors: errors.map((error) => {
      return {
        status: error.status, // error status
        detail: error.detail, // error message
        source: { pointer: error.source ?? "" }, // error field
        code: error.code ?? null, // domain error code
      };
    }),
  };
};
