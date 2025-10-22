import { PostInputDtoModel } from "../../../posts/types/post.types";

export const getPostDtoUtil = (blogId: string) =>
  ({
    title: "test title",
    shortDescription: "test short desc",
    content: "test content",
    blogId,
  }) as PostInputDtoModel;
