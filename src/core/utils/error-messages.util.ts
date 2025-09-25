import { ErrorMessagesTypeModel } from "../../types/error-messages.types";

export const errorMessages = (
  errors: ErrorMessagesTypeModel[]
): { errorsMessages: ErrorMessagesTypeModel[] } => {
  return { errorsMessages: errors };
};
