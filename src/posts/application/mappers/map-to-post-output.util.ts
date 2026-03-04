import { PostDocument } from "posts/infrastructure/schemas/post.schema";
import { PostOutput } from "../output/post-type.output";

export function mapToPostOutput(post: PostDocument): PostOutput {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId.toString(),
    blogName: post.blogName,
    createdAt: post.createdAt!.toISOString(),
  };
}
