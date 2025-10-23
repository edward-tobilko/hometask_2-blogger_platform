import { BlogPostInputDtoModel } from "../../../blogs/types/blog.types";

export function getPostsForBlogDtoUtil(): BlogPostInputDtoModel {
  return {
    title: "created new title",
    shortDescription: "created new short desc",
    content: "created new content",
  };
}
