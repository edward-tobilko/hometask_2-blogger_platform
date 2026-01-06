import { ValidationErrorType } from "./types/validation-error.type";
import { ValidationErrorListOutput } from "./types/validation-error.type-output";

export const createErrorMessages = (
  errors: ValidationErrorType[]
): ValidationErrorListOutput => {
  return {
    errorsMessages: errors.map((error) => {
      return {
        message: error.message,
        field: error.field,
        statusCode: error.statusCode,
      };
    }),
  };
};
