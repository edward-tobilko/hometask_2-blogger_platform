import { CreatePostRequestPayload } from "../../../posts/routes/request-payloads/create-post.request-payload";

export const getPostDtoUtil = (blogId: string) =>
  ({
    title: "test title",
    shortDescription: "test short desc",
    content: "test content",
    blogId,
  }) as CreatePostRequestPayload;
