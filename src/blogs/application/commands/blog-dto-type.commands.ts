import { PostDtoDomain } from "../../../posts/domain/create-post-dto.domain";
import { BlogDtoDomain } from "../../domain/blog-dto.domain";

export type CreateBlogDtoCommand = BlogDtoDomain;
export type UpdateBlogDtoCommand = BlogDtoDomain & { id: string };
export type CreatePostForBlogDtoCommand = PostDtoDomain & { blogId: string };

// ? dto (Data Transfer Object) - то, что присылает клиент.
