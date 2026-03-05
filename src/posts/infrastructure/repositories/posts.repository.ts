import { injectable } from "inversify";
import { ClientSession, Types } from "mongoose";

import { IPostsRepo } from "posts/application/interfaces/posts-repo.interface";
import { PostModel } from "posts/infrastructure/schemas/post.schema";
import { PostCommentsModel } from "posts/infrastructure/schemas/post-comments.schema";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostMapper } from "posts/domain/mappers/post.mapper";
import { PostCommentEntity } from "posts/domain/entities/post-comment.entity";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostLikeDocument, PostLikeModel } from "../schemas/post-like.schema";

@injectable()
export class PostsRepository implements IPostsRepo {
  async createPost(domainPost: PostEntity): Promise<PostEntity> {
    // * получаем замапенный инстанс дб поста
    const postDb = PostMapper.toDb(domainPost);

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

  async findPostLike(
    postId: string,
    userId: string,
    session: ClientSession
  ): Promise<PostLikeDocument | null> {
    const like = await PostLikeModel.findOne({
      postId: new Types.ObjectId(postId), // string -> ObjectId
      userId: new Types.ObjectId(userId), // string -> ObjectId
    })
      .session(session)
      .exec();

    return like;
  }

  async updateLikeCounters(
    postId: string,
    like: number,
    dislike: number,
    session: ClientSession
  ): Promise<void> {
    await PostModel.updateOne(
      {
        _id: new Types.ObjectId(postId),
      },
      {
        $inc: {
          "extendedLikesInfo.likesCount": like,
          "extendedLikesInfo.dislikesCount": dislike,
        },
      },
      { session }
    ).exec();
  }

  async upsertPostLike(
    domain: {
      postId: string;
      userId: string;
      likeStatus: LikeStatus;
      login: string;
    },
    session: ClientSession
  ): Promise<void> {
    const filter = {
      postId: new Types.ObjectId(domain.postId), // string -> ObjectId
      userId: new Types.ObjectId(domain.userId), // string -> ObjectId
    };

    // if (domain.likeStatus === LikeStatus.None) {
    //   await PostLikeModel.deleteOne(filter, { session }).exec();
    //   return;
    // }

    const update: any = {
      $set: {
        likeStatus: domain.likeStatus,
        login: domain.login,
      },
    };

    // * addedAt обновляем только когда ставим Like
    if (domain.likeStatus === LikeStatus.Like) {
      update.$set.addedAt = new Date();
    }

    const res = await PostLikeModel.updateOne(filter, update, {
      upsert: true,
      session,
    }).exec();

    console.log("res:", res);
  }

  async setNewestLikes(
    postId: string,
    newestLikes: Array<{ addedAt: Date; userId: string; login: string }>,
    session: ClientSession
  ): Promise<void> {
    const filter = {
      _id: new Types.ObjectId(postId),
    };

    const update = {
      $set: {
        "extendedLikesInfo.newestLikes": newestLikes,
      },
    };

    await PostModel.updateOne(filter, update, { session }).exec();
  }
}
