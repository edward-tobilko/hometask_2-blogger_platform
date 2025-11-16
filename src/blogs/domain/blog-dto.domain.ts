// * Dto model
export type BlogDtoDomain = {
  name: string;
  description: string;
  websiteUrl: string;
};

// ? dto (Data Transfer Object) - внутренняя доменная модель, где мы явно сохраняем данные, необходимые для создания сущности Blog).
