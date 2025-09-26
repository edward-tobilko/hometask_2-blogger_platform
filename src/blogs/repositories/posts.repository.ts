import { db } from "../../db/mock.db";
import { PostTypeModel } from "../../types/post.types";

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
};
