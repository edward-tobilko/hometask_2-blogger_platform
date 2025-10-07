export type ErrorMessages = {
  field: string;
  message: string;
};

export const errorMessagesUtil = (
  errors: ErrorMessages[]
): { errorsMessages: ErrorMessages[] } => {
  return { errorsMessages: errors };
};
