import { CreatePostForBlogRequestPayload } from "../../../posts/routes/request-payloads/create-post-for-blog.request-payload";

export function getPostsForBlogDtoUtil(): CreatePostForBlogRequestPayload {
  return {
    title: "created new title",
    shortDescription: "created new short desc",
    content: "created new content",
  };
}
