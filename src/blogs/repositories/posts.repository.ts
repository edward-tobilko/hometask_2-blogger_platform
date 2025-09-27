import { db } from "../../db/mock.db";
import { PostInputDtoTypeModel, PostTypeModel } from "../../types/post.types";

export const postRepository = {
  getAllPosts(): PostTypeModel[] {
    return db.posts;
  },

  getPostById(postId: string): PostTypeModel | null {
    return db.posts.find((post) => String(post.id) === String(postId)) ?? null;
  },

  createNewPost(newPost: PostTypeModel): PostTypeModel {
    db.posts.push(newPost);

    return newPost;
  },

  updatePost(
    postId: string,
    dto: PostInputDtoTypeModel,
    blogName: string
  ): void {
    const post = db.posts.find((post) => post.id === postId);

    if (!post) {
      throw new Error("Post not exist");
    }

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = String(dto.blogId);
    post.blogName = blogName;

    return;
  },

  deletePost(id: string): boolean {
    const findIndexPost = db.posts.findIndex(
      (indexPost) => indexPost.id === id
    );

    if (findIndexPost === -1) return false;

    db.posts.splice(findIndexPost, 1);

    return true;
  },
};
