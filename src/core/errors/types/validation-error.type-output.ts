export type ValidationErrorOutput = {
  field: string;
  message: string;
  statusCode?: number;
};

export type ValidationErrorListOutput = {
  errorsMessages: ValidationErrorOutput[];
};
