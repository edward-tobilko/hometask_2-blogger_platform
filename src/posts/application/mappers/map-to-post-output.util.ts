import { WithId } from "mongodb";

import { PostOutput } from "../output/post-type.output";
import { PostDomain } from "../../domain/post.domain";

export function mapToPostOutput(post: WithId<PostDomain>): PostOutput {
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
