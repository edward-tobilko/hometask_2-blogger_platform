import { CreatePostCommentRP } from "posts/routes/request-payload-types/create-post-comment.request-payload-types";

export function getCommentForPostDto(): CreatePostCommentRP {
  return {
    content: "This is a test comment with enough characters to pass validation",
  };
}
