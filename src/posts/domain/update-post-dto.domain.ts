// * DTO model
export type UpdatePostDtoDomain = {
  title: string;
  shortDescription: string;
  content: string;
};

// ? dto (Data Transfer Object) - внутренняя доменная модель, где мы явно сохраняем данные, необходимые для обновления сущности Post).
