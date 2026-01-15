import { ObjectId } from "mongodb";

import { postCommentsCollection, postCollection } from "../../db/mongo.db";
import { PostDomain } from "../domain/post.domain";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { PostCommentDomain } from "../domain/post-comment.domain";
import { PostCommentDB } from "../../db/types.db";

export class PostsRepository {
  // * GET
  async getPostDomainById(postId: string): Promise<PostDomain | null> {
    const result = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!result) return null;

    return PostDomain.reconstitute({
      ...result,
      blogId: result.blogId,
      blogName: result.blogName,
      createdAt: result.createdAt,
    });
  }

  // * CREATE
  async createPostRepo(newPost: PostDomain): Promise<PostDomain> {
    const insertResult = await postCollection.insertOne(newPost);

    newPost._id = insertResult.insertedId;

    return newPost;
  }

  async createPostCommentRepo(
    newPostComment: PostCommentDomain
  ): Promise<ObjectId> {
    const dbDocument: PostCommentDB = {
      _id: new ObjectId(),
      postId: newPostComment.postId,
      content: newPostComment.content,
      commentatorInfo: newPostComment.commentatorInfo,
      createdAt: newPostComment.createdAt,
    };

    const createResult = await postCommentsCollection.insertOne(dbDocument);

    return createResult.insertedId;
  }

  // * UPDATE
  async updatePostRepo(postDomain: PostDomain): Promise<PostDomain> {
    if (!postDomain._id) {
      throw new RepositoryNotFoundError(
        "Post ID is not provided for update",
        "postId"
      );
    }
    const { _id, ...dtoToUpdate } = postDomain;

    const updateResult = await postCollection.updateOne(
      { _id },
      { $set: dtoToUpdate }
    );

    if (updateResult.matchedCount < 1) {
      throw new RepositoryNotFoundError(
        "Post is not found in this blog",
        "postId"
      );
    }

    return postDomain;
  }

  // * DELETE
  async deletePostRepo(id: string): Promise<boolean> {
    const deleteResult = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return deleteResult.deletedCount === 1;
  }
}
