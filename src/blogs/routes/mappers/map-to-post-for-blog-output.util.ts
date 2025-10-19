import { WithId } from "mongodb";

import { PostDbDocument, PostViewModel } from "../../../posts/types/post.types";

export function mapToPostForBlogOutputUtil(
  post: WithId<PostDbDocument>
): PostViewModel {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId.toString(),
    blogName: post.blogName,
    createdAt: post.createdAt.toISOString(),
  };
}
