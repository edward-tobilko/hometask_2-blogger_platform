import { PostLean } from "posts/infrastructure/schemas/post.schema";
import { PostOutput } from "../output/post-type.output";
import { LikeStatus } from "@core/types/like-status.enum";

export function mapToPostOutput(
  postDomain: PostLean,
  myStatus: LikeStatus
): PostOutput {
  return {
    id: postDomain._id.toString(),
    title: postDomain.title,
    shortDescription: postDomain.shortDescription,
    content: postDomain.content,
    blogId: postDomain.blogId.toString(),
    blogName: postDomain.blogName,
    createdAt: postDomain.createdAt.toISOString(),

    extendedLikesInfo: {
      likesCount: postDomain.extendedLikesInfo.likesCount,
      dislikesCount: postDomain.extendedLikesInfo.dislikesCount,
      myStatus,

      newestLikes: postDomain.extendedLikesInfo.newestLikes.map(
        (newestLike) => ({
          addedAt: newestLike.addedAt.toISOString(),
          userId: newestLike.userId,
          login: newestLike.login,
        })
      ),
    },
  };
}
