import { injectable } from "inversify";
import { ClientSession, Types as MongooseTypes } from "mongoose";

import { mapToPostListOutput } from "../../application/mappers/map-to-post-list-output.util";
import { PostsListPaginatedOutput } from "../../application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "../../application/query-handlers/get-posts-list.query-handler";
import { GetPostCommentsListQueryHandler } from "../../application/query-handlers/get-post-comments-list.query-handler";
import { PostCommentsListPaginatedOutput } from "../../application/output/post-comments-list-type.output";
import { mapToPostCommentsListOutput } from "../../application/mappers/map-to-post-comments-list-output.mapper";
import { IPostsQueryRepo } from "posts/application/interfaces/posts-query-repo.interface";
import { PostLean, PostModel } from "posts/infrastructure/schemas/post.schema";
import {
  PostCommentsLean,
  PostCommentsModel,
} from "posts/infrastructure/schemas/post-comments.schema";
import {
  CommentLikeLean,
  CommentLikeModel,
} from "comments/infrastructure/schemas/comment-likes.schema";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostMapper } from "posts/domain/mappers/post.mapper";
import { PostLikeLean, PostLikeModel } from "../schemas/post-like.schema";
import { LikeStatus } from "@core/types/like-status.enum";

@injectable()
export class PostsQueryRepository implements IPostsQueryRepo {
  async getPostsList(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    const filter = {};

    const { pageNumber, pageSize, sortDirection, sortBy } = queryParam;

    const items = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean<PostLean[]>()
      .exec();

    const totalCount = await PostModel.countDocuments(filter);

    return mapToPostListOutput(items, {
      page: pageNumber,
      pageSize,
      totalCount,
    });
  }

  async getPostById(postId: string): Promise<PostEntity | null> {
    if (!MongooseTypes.ObjectId.isValid(postId)) return null;

    const postInstanceDoc = await PostModel.findById(postId).exec();
    if (!postInstanceDoc) return null;

    return PostMapper.toDomain(postInstanceDoc);
  }

  async getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler,
    currentUserId?: string // * Опционально - для неавторизованных пользователей
  ): Promise<PostCommentsListPaginatedOutput | null> {
    const { pageNumber, pageSize, sortBy, sortDirection, postId } = queryParam;

    if (!postId) return null;

    if (!MongooseTypes.ObjectId.isValid(postId)) {
      return null;
    }

    const filter = { postId: new MongooseTypes.ObjectId(postId) };

    // * Параллельно получаем post, comments и их кол-во
    const [post, postComments, totalCount] = await Promise.all([
      PostModel.findOne({
        _id: new MongooseTypes.ObjectId(postId),
      })
        .lean<PostLean>()
        .exec(),

      PostCommentsModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<PostCommentsLean[]>()
        .exec(),

      PostCommentsModel.countDocuments(filter).exec(),
    ]);

    if (!post) return null;

    let likes: CommentLikeLean[] | null = null;

    // * Получаем myStatus для ВСЕХ комментариев одним запросом
    if (currentUserId && MongooseTypes.ObjectId.isValid(currentUserId)) {
      const commentIds = postComments.map((comment) => comment._id);

      likes = await CommentLikeModel.find({
        commentId: { $in: commentIds },
        userId: new MongooseTypes.ObjectId(currentUserId),
      })
        .lean<CommentLikeLean[]>()
        .exec();
    }

    const postCommentsOutput = mapToPostCommentsListOutput(
      postComments,
      likes,

      {
        page: pageNumber,
        pageSize,
        totalCount,
      }
    );

    return postCommentsOutput;
  }

  async findPostLike(
    postId: string,
    userId: string,
    session: ClientSession
  ): Promise<PostLikeLean | null> {
    const like = await PostLikeModel.findOne({
      postId: new MongooseTypes.ObjectId(postId), // string -> ObjectId
      userId: new MongooseTypes.ObjectId(userId), // string -> ObjectId
    })
      .session(session)
      .lean<PostLikeLean>()
      .exec();

    console.log("like from query repo:", like);

    return like;
  }

  async getNewestLikes(
    postId: string,
    session: ClientSession
  ): Promise<
    Array<{
      addedAt: Date;
      userId: string;
      login: string;
    }>
  > {
    const likes = await PostLikeModel.find({
      postId: new MongooseTypes.ObjectId(postId),
      likeStatus: LikeStatus.Like, // только лайки
    })
      .sort({ addedAt: -1 }) // от новых к старым
      .limit(3) // 3
      .select({ addedAt: 1, userId: 1, login: 1, _id: 0 })
      .lean<PostLikeLean[]>()
      .session(session)
      .exec();

    return likes.map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId.toString(),
      login: like.login,
    }));
  }
}
