import { WithId } from "mongodb";

import { PostDbDocument, PostOutput } from "../../types/post.types";

export function mapToPostOutput(post: WithId<PostDbDocument>): PostOutput {
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
