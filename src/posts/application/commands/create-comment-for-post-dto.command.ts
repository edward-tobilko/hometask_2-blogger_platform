export type CreateCommentForPostDtoCommand = {
  content: string; // adding from body
  postId: string; // adding from query params

  commentatorInfo: {
    userId: string; // adding form auth (string) = extra
    userLogin: string; // adding from auth = extra
  };

  createdAt: Date;
};

// ? CreateCommentForPostDtoCommand — готовый пакет данных для бизнес-операции, собранный из: params (postId), body (content), auth (userId, иногда какие-то другие поля). То есть DTO/Command — это уже «все, что нужно для выполнения действия», без Express.
