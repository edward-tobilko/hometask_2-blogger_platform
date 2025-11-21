import { CreatePostDtoDomain } from "../../domain/create-post-dto.domain";
import { UpdatePostDtoDomain } from "../../domain/update-post-dto.domain";

export type CreatePostDtoCommand = CreatePostDtoDomain;
export type UpdatePostDtoCommand = UpdatePostDtoDomain & { id: string };

export type CreatePostForBlogDtoCommand = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string; // adding from params
};

// ? dto (Data Transfer Object) - то, что присылает клиент.
