import { injectable } from "inversify";
import { ClientSession, Types as MongooseTypes } from "mongoose";

import { GetPostsListQueryHandler } from "../../application/query-handlers/get-posts-list.query-handler";
import { GetPostCommentsListQueryHandler } from "../../application/query-handlers/get-post-comments-list.query-handler";
import { PostCommentsListPaginatedOutput } from "../../application/output/post-comments-list-type.output";
import { IPostsQueryRepo } from "@posts/application/interfaces/posts-query-repo.interface";
import { PostLean, PostModel } from "@posts/infrastructure/schemas/post.schema";
import {
  PostCommentsLean,
  PostCommentsModel,
} from "@posts/infrastructure/schemas/post-comments.schema";
import {
  CommentLikeLean,
  CommentLikeModel,
} from "@comments/infrastructure/schemas/comment-likes.schema";
import { PostEntity } from "@posts/domain/entities/post.entity";
import { PostLikeLean, PostLikeModel } from "../schemas/post-like.schema";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostCommentsMapper } from "../mappers/post-comments.mapper";
import { PostMapper } from "../mappers/post.mapper";

@injectable()
export class PostsQueryRepository implements IPostsQueryRepo {
  async getPostsList(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string // * Опционально - для неавторизованных пользователей
  ): Promise<{
    postsEntity: PostEntity[];
    userLikes: Map<string, LikeStatus>;
    totalCount: number;
  }> {
    const { pageNumber, pageSize, sortDirection, sortBy } = queryParam;

    const filter = {};

    const [postsDocs, totalCount] = await Promise.all([
      PostModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<PostLean[]>()
        .exec(),

      PostModel.countDocuments(filter),
    ]);

    const postsEntity = postsDocs.map((postDoc) =>
      PostMapper.toDomain(postDoc)
    );

    const userLikes = new Map<string, LikeStatus>();

    if (currentUserId && MongooseTypes.ObjectId.isValid(currentUserId)) {
      const postIds = postsDocs.map((postDoc) => postDoc._id);

      const filter = {
        postId: { $in: postIds },
        userId: new MongooseTypes.ObjectId(currentUserId),
      };

      const likes = await PostLikeModel.find(filter)
        .lean<PostLikeLean[]>()
        .exec();

      likes.forEach((like) => {
        userLikes.set(like.postId.toString(), like.likeStatus);
      });
    }

    return { postsEntity, userLikes, totalCount };
  }

  async getPostById(postId: string): Promise<PostEntity | null> {
    if (!MongooseTypes.ObjectId.isValid(postId)) return null;

    const postInstanceDoc = await PostModel.findById(postId)
      .lean<PostLean>()
      .exec();

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

    const entities = postComments.map(PostCommentsMapper.toDomain);

    const userLikes = new Map<string, LikeStatus>();

    (likes ?? []).forEach((like) => {
      userLikes.set(like.commentId.toString(), like.status);
    });

    return PostCommentsMapper.toListViewModel(entities, userLikes, {
      page: pageNumber,
      pageSize,
      totalCount,
    });
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
    const filter = {
      postId: new MongooseTypes.ObjectId(postId),
      likeStatus: LikeStatus.Like,
    };

    const likes = await PostLikeModel.find(filter)
      .sort({ addedAt: -1 }) // от новых к старым
      .limit(3) // 3
      // .select({ addedAt: 1, userId: 1, login: 1, _id: 0 })
      .lean()
      .session(session)
      .exec();

    return likes.map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId.toString(),
      login: like.login,
    }));
  }
}
