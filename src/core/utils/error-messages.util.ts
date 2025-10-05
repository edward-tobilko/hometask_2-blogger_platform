type ErrorMessagesTypeModel = {
  field: string;
  message: string;
};

export const errorMessages = (
  errors: ErrorMessagesTypeModel[]
): { errorsMessages: ErrorMessagesTypeModel[] } => {
  return { errorsMessages: errors };
};
