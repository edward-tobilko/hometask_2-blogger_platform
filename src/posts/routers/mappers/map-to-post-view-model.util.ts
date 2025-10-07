import { WithId } from "mongodb";

import { PostDb, PostView } from "../../types/post.types";

export function mapToPostViewModelUtil(post: WithId<PostDb>): PostView {
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
