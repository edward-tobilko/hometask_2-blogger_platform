import { CreatePostForBlogRequestPayload } from "../../../posts/routes/request-payload-types/create-post-for-blog.request-payload-types";

export function getPostsForBlogDtoUtil(): CreatePostForBlogRequestPayload {
  return {
    title: "created new title",
    shortDescription: "created new short desc",
    content: "created new content",
  };
}
