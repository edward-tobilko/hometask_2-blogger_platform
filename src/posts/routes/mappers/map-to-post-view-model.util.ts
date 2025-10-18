import { WithId } from "mongodb";

import { PostDbDocument, PostViewModel } from "../../types/post.types";

export function mapToPostViewModelUtil(
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
