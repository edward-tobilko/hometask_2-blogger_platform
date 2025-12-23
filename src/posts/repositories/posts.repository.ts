import { ObjectId } from "mongodb";

import { commentsCollection, postCollection } from "../../db/mongo.db";
import { PostDomain } from "../domain/post.domain";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { PostCommentDomain } from "../domain/post-comment.domain";

export class PostsRepository {
  // * GET
  async getPostDomainById(postId: string): Promise<PostDomain> {
    const result = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!result) {
      throw new RepositoryNotFoundError("postId", "Post is not exist!");
    }

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
    const result = await commentsCollection.insertOne({
      _id: new ObjectId(),
      postId: newPostComment.postId,
      content: newPostComment.content,
      commentatorInfo: newPostComment.commentatorInfo,
      createdAt: newPostComment.createdAt,
    });

    return result.insertedId;
  }

  // * UPDATE
  async updatePostRepo(post: PostDomain): Promise<PostDomain> {
    if (!post._id) {
      throw new RepositoryNotFoundError(
        "PostID is not provided for update",
        "postId"
      );
    }
    const { _id, ...dtoToUpdate } = post;

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

    return post;
  }

  // * DELETE
  async deletePostRepo(id: string): Promise<void> {
    const deleteResult = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new RepositoryNotFoundError("Post is not exist!", "postId");
    }

    return;
  }
}
