export type ErrorMessages = {
  field: string;
  message: string;
};

export const errorMessagesUtil = (
  errors: ErrorMessages[]
): { errorMessages: ErrorMessages[] } => {
  return { errorMessages: errors };
};
