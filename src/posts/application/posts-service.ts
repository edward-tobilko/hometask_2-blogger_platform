import { WithId } from "mongodb";

import { postsRepository } from "../repositories/posts.repository";
import {
  PostDbDocument,
  PostInputDtoModel,
  PostQueryParamInput,
} from "../types/post.types";

export const postsService = {
  async getAllPosts(queryParam: PostQueryParamInput): Promise<{
    items: WithId<PostDbDocument>[];
    totalCount: number;
  }> {
    return await postsRepository.getAllPostsRepo(queryParam);
  },

  async getPostById(postId: string): Promise<WithId<PostDbDocument>> {
    return await postsRepository.getPostByIdRepo(postId);
  },

  async createPost(
    dto: PostInputDtoModel,
    blogName: string
  ): Promise<WithId<PostDbDocument>> {
    return await postsRepository.createPostRepo(dto, blogName);
  },

  async updatePost(
    postId: string,
    dto: PostInputDtoModel,
    blogName: string
  ): Promise<void> {
    return await postsRepository.updatePostRepo(postId, dto, blogName);
  },

  async deletePost(id: string): Promise<void> {
    return await postsRepository.deletePostRepo(id);
  },
};
