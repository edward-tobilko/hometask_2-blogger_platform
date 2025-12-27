import { WithId } from "mongodb";

import { PostOutput } from "../output/post-type.output";
import { PostDB } from "../../../db/types.db";

export function mapToPostOutput(post: WithId<PostDB>): PostOutput {
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
