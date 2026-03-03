// * DTO model - response for db
export type CreatePostDtoEntity = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;

  blogName: string;
};

// ? dto (Data Transfer Object) - внутренняя доменная модель, где мы явно сохраняем данные, необходимые для создания сущности Post).
