import { ObjectId } from "mongodb";

import { postCollection } from "../../db/mongo.db";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { PostDomain } from "../domain/post.domain";

export class PostsRepository {
  async getPostDomainById(postId: string): Promise<PostDomain> {
    const result = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!result) {
      throw new RepositoryNotFoundError("Post is not exist!", "postId");
    }

    return PostDomain.reconstitute({
      ...result,
      blogId: result.blogId,
      blogName: result.blogName,
      createdAt: result.createdAt,
    });
  }

  async createPostRepo(newPost: PostDomain): Promise<PostDomain> {
    const insertResult = await postCollection.insertOne(newPost);

    newPost._id = insertResult.insertedId;

    return newPost;
  }

  async updatePostRepo(post: PostDomain): Promise<PostDomain> {
    if (!post._id) {
      throw new RepositoryNotFoundError(
        "Post id is not provided for update",
        "postId"
      );
    }
    const { _id, ...dtoToUpdate } = post;

    const updateResult = await postCollection.updateOne(
      { _id },
      { $set: dtoToUpdate }
    );

    if (updateResult.matchedCount < 1) {
      throw new RepositoryNotFoundError("Post is not exist!", "postId");
    }

    return post;
  }

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
