import { injectable } from "inversify";
import { Types } from "mongoose";

import { IPostsRepository } from "posts/interfaces/IPostsRepository";
import { PostDb, PostDocument, PostModel } from "posts/mongoose/post.schema";
import { UpdatePostDtoCommand } from "posts/application/commands/update-post-dto.command";
import {
  PostCommentsDb,
  PostCommentsDocument,
  PostCommentsModel,
} from "posts/mongoose/post-comments.schema";

@injectable()
export class PostsRepository implements IPostsRepository {
  async createPost(newPost: PostDb): Promise<PostDocument> {
    const postInstanceDoc = new PostModel(newPost);

    await postInstanceDoc.save();

    return postInstanceDoc;
  }

  async createPostComment(
    newPostComment: PostCommentsDb
  ): Promise<PostCommentsDocument> {
    const postCommentInstance = new PostCommentsModel({
      content: newPostComment.content,
      commentatorInfo: newPostComment.commentatorInfo,
      // createdAt: newPostComment.createdAt,

      postId: newPostComment.postId,
    });

    await postCommentInstance.save();

    return postCommentInstance;
  }

  async updatePost(
    dto: UpdatePostDtoCommand
  ): Promise<boolean | "BLOG_MISMATCH"> {
    if (!Types.ObjectId.isValid(dto.id)) return false;
    if (!Types.ObjectId.isValid(dto.blogId)) return false;

    // * Обновляем только если blogId совпадает
    const updatedResult = await PostModel.updateOne(
      { _id: dto.id, blogId: new Types.ObjectId(dto.blogId) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
        },
      }
    ).exec();

    // * Если post не обновлен
    if (updatedResult.matchedCount === 0) {
      // * Дополнительная проверка: существует ли post
      const postExists = await PostModel.exists({ _id: dto.id }).exec();

      // * Если post существует, значит blogId не совпадает
      if (postExists) return "BLOG_MISMATCH";

      // * Если поста нет - false
      return false;
    }

    return true;
  }

  async deletePost(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedResult = await PostModel.deleteOne({
      _id: id,
    });

    return deletedResult.deletedCount === 1;
  }
}
