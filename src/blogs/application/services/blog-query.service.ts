import { inject, injectable } from "inversify";

import { BlogListPaginatedOutput } from "../output/blog-list-paginated-type.output";
import { IBlogsQueryService } from "@blogs/application/interfaces/blogs-query-service.interface";
import { DiTypes } from "@core/di/types";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostMapper } from "@posts/infrastructure/mappers/post.mapper";
import { IBlogsQueryRepository } from "../interfaces/blogs-query-repo.interface";
import { PostsListPaginatedOutput } from "@posts/application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "@posts/application/query-handlers/get-posts-list.query-handler";
import { BlogOutput } from "../output/blog-type.output";
import { GetBlogsListQueryHandler } from "../query-handlers/get-blogs-list-type.query-handler";

@injectable()
export class BlogsQueryService implements IBlogsQueryService {
  constructor(
    @inject(DiTypes.IBlogsQueryRepository)
    private blogsQueryRepository: IBlogsQueryRepository
  ) {}

  async getBlogsList(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput> {
    return await this.blogsQueryRepository.findAllBlogs(queryParam);
  }

  async getBlogById(blogId: string): Promise<BlogOutput | null> {
    return await this.blogsQueryRepository.findBlogById(blogId);
  }

  async getPostsListByBlog(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string
  ): Promise<PostsListPaginatedOutput> {
    const { postsEntity, userLikes, totalCount } =
      await this.blogsQueryRepository.findAllPostsForBlog(
        queryParam,
        currentUserId
      );

    const items = postsEntity.map((postEntity) => {
      const myStatus =
        userLikes.get(postEntity.id.toString()) ?? LikeStatus.None;

      return PostMapper.toViewModel(postEntity, myStatus);
    });

    return {
      pagesCount: Math.ceil(totalCount / queryParam.pageSize),
      page: queryParam.pageNumber,
      pageSize: queryParam.pageSize,
      totalCount,

      items,
    };
  }
}

// ? postsEntity - posts list domain entity
