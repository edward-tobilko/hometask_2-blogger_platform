export type CreateCommentForPostDtoCommand = {
  postId: string; // adding from query params
  content: string; // adding from body

  userId: string; // adding form auth (string) = extra
  userLogin: string; // adding from auth = extra
};

// ? CreateCommentForPostDtoCommand — готовый пакет данных для бизнес-операции, собранный из: params (postId), body (content), auth (userId, иногда какие-то другие поля). То есть DTO/Command — это уже «все, что нужно для выполнения действия», без Express.
