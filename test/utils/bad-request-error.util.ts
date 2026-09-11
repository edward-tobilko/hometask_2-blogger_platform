export type BadRequestError = {
  errorsMessages: { message: string; field: string }[];
};
