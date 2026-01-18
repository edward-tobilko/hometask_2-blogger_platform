import { CreatePostForBlogRP } from "posts/routes/request-payload-types/create-post-for-blog.request-payload-types";

export function getPostsForBlogDtoUtil(): CreatePostForBlogRP {
  return {
    title: "created new title",
    shortDescription: "created new short desc",
    content: "created new content",
  };
}
