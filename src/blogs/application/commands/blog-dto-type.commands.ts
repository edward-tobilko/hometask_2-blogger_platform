import { BlogDtoDomain } from "../../domain/value-objects/blog-dto.domain";

export type CreateBlogDtoCommand = BlogDtoDomain;
export type UpdateBlogDtoCommand = BlogDtoDomain & { id: string };

// ? dto (Data Transfer Object) - то, что присылает клиент.
