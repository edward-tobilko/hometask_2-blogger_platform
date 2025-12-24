import { ObjectId } from "mongodb";

import { commentsCollection, postCollection } from "../../db/mongo.db";
import { mapToPostListOutput } from "../application/mappers/map-to-post-list-output.util";
import { PostOutput } from "../application/output/post-type.output";
import { PostsListPaginatedOutput } from "../application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "../application/query-handlers/get-posts-list.query-handler";
import { mapToPostOutput } from "../application/mappers/map-to-post-output.util";
import {
  NotFoundError,
  RepositoryNotFoundError,
} from "../../core/errors/application.error";
import { GetPostCommentsListQueryHandler } from "../application/query-handlers/get-post-comments-list.query-handler";
import { PostCommentsListPaginatedOutput } from "../application/output/post-comments-list-type.output";
import { mapToPostCommentsListOutput } from "../application/mappers/map-to-post-comments-list-output.mapper";
import { ApplicationResult } from "../../core/result/application.result";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";

export class PostQueryRepository {
  async getPostsQueryRepo(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    const filter = {};

    const { pageNumber, pageSize, sortDirection, sortBy } = queryParam;

    const items = await postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter);

    return mapToPostListOutput(items, {
      page: pageNumber,
      pageSize,
      totalCount,
    });
  }

  async getPostByIdQueryRepo(postId: string): Promise<PostOutput> {
    const result = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!result) {
      throw new RepositoryNotFoundError("id", "Post is not exist!");
    }

    return mapToPostOutput(result);
  }

  async getPostCommentsQueryRepo(
    queryParam: GetPostCommentsListQueryHandler
  ): Promise<PostCommentsListPaginatedOutput> {
    const { pageNumber, pageSize, sortBy, sortDirection, postId } = queryParam;

    const postObjectId = new ObjectId(postId);

    const filter = { postId: postObjectId };

    const post = await postCollection.findOne({ _id: postObjectId });

    if (!post) {
      throw new NotFoundError("postId", "PostID is not exist", 404);
    }

    const items = commentsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const [postComments, totalCount] = await Promise.all([
      items.toArray(),
      postCollection.countDocuments(filter),
    ]);

    const postCommentsOutput = mapToPostCommentsListOutput(postComments, {
      page: pageNumber,
      pageSize,
      totalCount,
    });

    return postCommentsOutput;
  }
}
