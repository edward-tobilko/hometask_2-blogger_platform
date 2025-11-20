import { WithId } from "mongodb";

import { postsRepository } from "../repositories/posts.repository";
import { PostDomain } from "../domain/post.domain";

export const postsService = {
  async getAllPosts(queryParam: PostQueryParamInput): Promise<{
    items: WithId<PostDomain>[];
    totalCount: number;
  }> {
    return await postsRepository.getAllPostsRepo(queryParam);
  },

  async getPostById(postId: string): Promise<WithId<PostDomain>> {
    return await postsRepository.getPostByIdRepo(postId);
  },

  async createPost(
    dto: PostInputDtoModel,
    blogName: string
  ): Promise<WithId<PostDomain>> {
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
