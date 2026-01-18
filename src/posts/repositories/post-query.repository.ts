import { ObjectId } from "mongodb";

import { postCommentsCollection, postCollection } from "../../db/mongo.db";
import { mapToPostListOutput } from "../application/mappers/map-to-post-list-output.util";
import { PostOutput } from "../application/output/post-type.output";
import { PostsListPaginatedOutput } from "../application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "../application/query-handlers/get-posts-list.query-handler";
import { mapToPostOutput } from "../application/mappers/map-to-post-output.util";
import { GetPostCommentsListQueryHandler } from "../application/query-handlers/get-post-comments-list.query-handler";
import { PostCommentsListPaginatedOutput } from "../application/output/post-comments-list-type.output";
import { mapToPostCommentsListOutput } from "../application/mappers/map-to-post-comments-list-output.mapper";

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

  async getPostByIdQueryRepo(postId: string): Promise<PostOutput | null> {
    const dbDocument = await postCollection.findOne({
      _id: new ObjectId(postId),
    });

    if (!dbDocument) return null;

    return mapToPostOutput(dbDocument);
  }

  async getPostCommentsQueryRepo(
    queryParam: GetPostCommentsListQueryHandler
  ): Promise<PostCommentsListPaginatedOutput | null> {
    const { pageNumber, pageSize, sortBy, sortDirection, postId } = queryParam;

    const postObjectId = new ObjectId(postId);

    const filter = { postId: postObjectId };

    const post = await postCollection.findOne({ _id: postObjectId });

    if (!post) return null;

    const items = postCommentsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const [postComments, totalCount] = await Promise.all([
      items.toArray(),
      postCommentsCollection.countDocuments(filter),
    ]);

    const postCommentsOutput = mapToPostCommentsListOutput(postComments, {
      page: pageNumber,
      pageSize,
      totalCount,
    });

    return postCommentsOutput;
  }
}
