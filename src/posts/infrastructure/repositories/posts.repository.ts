import { injectable } from "inversify";
import { Types } from "mongoose";

import { IPostsRepo } from "posts/application/interfaces/posts-repo.interface";
import { PostModel } from "posts/infrastructure/schemas/post.schema";
import { PostCommentsModel } from "posts/infrastructure/schemas/post-comments.schema";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostMapper } from "posts/domain/mappers/post.mapper";
import { PostCommentEntity } from "posts/domain/entities/post-comment.entity";

@injectable()
export class PostsRepository implements IPostsRepo {
  async createPost(newPost: PostEntity): Promise<PostEntity> {
    // * получаем замапенный инстанс дб поста
    const postDb = PostMapper.toDb(newPost);

    // * создаем новый объект экземпляра поста
    const postInstanceDoc = new PostModel(postDb);

    await postInstanceDoc.save();

    return PostMapper.toDomain(postInstanceDoc);
  }

  async createPostComment(
    domain: PostCommentEntity
  ): Promise<PostCommentEntity | null> {
    if (
      !Types.ObjectId.isValid(domain.postId) ||
      !Types.ObjectId.isValid(domain.commentatorInfo.userId)
    )
      return null;

    const postCommentInstanceDoc = new PostCommentsModel({
      content: domain.content,
      postId: domain.postId,

      commentatorInfo: domain.commentatorInfo,

      createdAt: domain.createdAt,

      // * likesInfo подтянится с модельки
    });

    await postCommentInstanceDoc.save();

    return PostCommentEntity.reconstitute({
      id: postCommentInstanceDoc._id.toString(),
      content: postCommentInstanceDoc.content,
      postId: postCommentInstanceDoc.postId.toString(),

      createdAt: postCommentInstanceDoc.createdAt,

      commentatorInfo: {
        userId: postCommentInstanceDoc.commentatorInfo.userId.toString(),
        userLogin: postCommentInstanceDoc.commentatorInfo.userLogin,
      },

      likesInfo: {
        likesCount: postCommentInstanceDoc.likesInfo.likesCount,
        dislikesCount: postCommentInstanceDoc.likesInfo.dislikesCount,
      },
    });
  }

  async updatePost(post: PostEntity): Promise<boolean> {
    if (!post.id) return false;

    const postDb = PostMapper.toDb(post);

    // * Обновляем только если blogId совпадает
    const updatedResult = await PostModel.updateOne(
      { _id: postDb._id, blogId: new Types.ObjectId(postDb.blogId) },
      {
        $set: {
          title: postDb.title,
          shortDescription: postDb.shortDescription,
          content: postDb.content,
        },
      }
    ).exec();

    // * Если post не обновлен
    if (updatedResult.matchedCount === 0) {
      // * Дополнительная проверка: существует ли post
      await PostModel.exists({ _id: postDb._id }).exec();

      // * Если поста нет - false
      return false;
    }

    return true;
  }

  async deletePost(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedResult = await PostModel.deleteOne({
      _id: new Types.ObjectId(id),
    }).exec();

    return deletedResult.deletedCount === 1;
  }
}
