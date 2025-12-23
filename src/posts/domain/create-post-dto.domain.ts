import { ObjectId } from "mongodb";

// * DTO model - response for db
export type CreatePostDtoDomain = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId | string;

  blogName: string;
};

// ? dto (Data Transfer Object) - внутренняя доменная модель, где мы явно сохраняем данные, необходимые для создания сущности Post).
