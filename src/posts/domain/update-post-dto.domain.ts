// * DTO model
export type UpdatePostDtoDomain = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

// ? dto (Data Transfer Object) - внутренняя доменная модель, где мы явно сохраняем данные, необходимые для обновления сущности Post).
