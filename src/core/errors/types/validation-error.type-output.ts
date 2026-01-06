export type ValidationErrorOutput = {
  message: string;
  field: string;
  statusCode?: number;
};

export type ValidationErrorListOutput = {
  errorsMessages: ValidationErrorOutput[];
};
