export type CreateCommentForPostDtoCommand = {
  postId: string; // adding from query params
  content: string;

  //   userId: string;      // с auth (строка)
  //   userLogin: string;   // с auth
};

// ? dto (Data Transfer Object) - то, что присылает клиент.
