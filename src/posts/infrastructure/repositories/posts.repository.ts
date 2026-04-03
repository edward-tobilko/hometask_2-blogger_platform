import { injectable } from "inversify";
import { ClientSession, Types } from "mongoose";

import { IPostsRepo, PostLikeView } from "@posts/application/interfaces/posts-repo.interface";
import { PostLean, PostModel } from "@posts/infrastructure/schemas/post.schema";
import { PostCommentsModel } from "@posts/infrastructure/schemas/post-comments.schema";
import { PostEntity } from "@posts/domain/entities/post.entity";
import { PostCommentEntity } from "@posts/domain/entities/post-comment.entity";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostLikeModel } from "../schemas/post-like.schema";
import { PostMapper } from "../mappers/post.mapper";

@injectable()
export class PostsRepository implements IPostsRepo {
  async findById(
    postId: string,
    session?: ClientSession
  ): Promise<PostEntity | null> {
    if (!Types.ObjectId.isValid(postId)) return null;

    const postDocument = await PostModel.findById(postId)
      .session(session ?? null)
      .lean<PostLean>()
      .exec();

    if (!postDocument) return null;

    return PostMapper.toDomain(postDocument);
  }

  async createPost(domainPost: PostEntity): Promise<PostEntity> {
    // * получаем замапенный инстанс дб поста (для динамического смены БД: Mongo -> PostgreSQL)
    const postDb = PostMapper.toDb(domainPost);

    // * создаем новый объект экземпляра поста
    const postInstanceDoc = new PostModel(postDb);

    await postInstanceDoc.save(); // Active Record паттерн

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

    await postCommentInstanceDoc.save(); // Active Record паттерн

    return PostCommentEntity.reconstitute({
      // * ручной маппинг (просто для наглядности)
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
      {
        _id: new Types.ObjectId(post.id),
        blogId: new Types.ObjectId(postDb.blogId),
      },
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
      await PostModel.exists({ _id: new Types.ObjectId(post.id) }).exec();

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
    session?: ClientSession
  ): Promise<PostLikeView | null> {
    const like = await PostLikeModel.findOne({
      postId: new Types.ObjectId(postId), // string -> ObjectId
      userId: new Types.ObjectId(userId), // string -> ObjectId
    })
      .session(session ?? null)
      .exec();

    if (!like) return null;

    return { likeStatus: like.likeStatus, login: like.login };
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

    // * Разная логика для разных статусов
    if (domain.likeStatus === LikeStatus.None) {
      // * Удаляем лайк совсем
      await PostLikeModel.deleteOne(filter, { session }).exec();
      return;
    }

    const update: { $set: Record<string, unknown> } = {
      $set: {
        likeStatus: domain.likeStatus,
        login: domain.login,
      },
    };

    // * addedAt обновляем только когда ставим Like
    if (domain.likeStatus === LikeStatus.Like) {
      update.$set.addedAt = new Date();
    }

    await PostLikeModel.updateOne(filter, update, {
      upsert: true,
      session,
    }).exec();
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
