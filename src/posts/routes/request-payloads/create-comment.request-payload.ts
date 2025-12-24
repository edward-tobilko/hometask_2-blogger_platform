export type CreateCommentRequestPayload = {
  content: string;
};

// ? CreateCommentRequestPayload - то, что клиент прислал (body/query/params). Это то, что валидируешь через express-validator и получаешь через matchedData().
