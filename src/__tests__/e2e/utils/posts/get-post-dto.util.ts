import { CreatePostRP } from "posts/routes/request-payload-types/create-post.request-payload-types";

export const getPostDtoUtil = (blogId: string) =>
  ({
    title: "test title",
    shortDescription: "test short desc",
    content: "test content",
    blogId,
  }) as CreatePostRP;
