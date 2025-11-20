import { PostDtoDomain } from "../../domain/create-post-dto.domain";

export type CreatePostDtoCommand = PostDtoDomain;
export type UpdatePostDtoCommand = PostDtoDomain & { id: string };

// ? dto (Data Transfer Object) - то, что присылает клиент.
