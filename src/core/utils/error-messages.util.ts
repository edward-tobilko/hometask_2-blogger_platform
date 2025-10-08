export type ErrorMessages = {
  message: string;
  field: string;
};

export const errorMessagesUtil = (
  errors: ErrorMessages[]
): { errorsMessages: ErrorMessages[] } => {
  return { errorsMessages: errors };
};
