import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
// import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';
import { BlogOrmEntity } from '../schemas/blog-orm.entity';
import { PostOrmEntity } from 'src/modules/bloggers-platform/posts/infrastructure/sql/schemas/post-orm.entity';
import { PostsQuerySqlRepository } from 'src/modules/bloggers-platform/posts/infrastructure/sql/repositories/posts-query-sql.repository';

@Injectable()
export class BlogsQuerySqlRepository {
  constructor(
    @InjectRepository(BlogOrmEntity)
    private readonly blogsQueryRepo: Repository<BlogOrmEntity>,

    @InjectRepository(PostOrmEntity)
    private readonly postOrmRepo: Repository<PostOrmEntity>,

    private readonly postsQueryRepo: PostsQuerySqlRepository,
  ) {}

  async findAll(
    queryParam: BlogsQueryDto,
    userId?: string,
  ): Promise<BlogListPaginatedViewModel> {
    const { searchNameTerm, pageNumber, pageSize } = queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    const [items, totalCount] = await this.blogsQueryRepo.findAndCount({
      where: nameTerm ? { name: ILike(`%${nameTerm}%`) } : {},
      order: queryParam.calculateSort(),
      skip: queryParam.calculateSkip(),
      take: pageSize,
    });

    return BlogListPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,

      items: items.map((blog) => {
        // const isSubscribed = false;

        // let status: SubscriptionStatus;

        // if (!userId) {
        //   status = SubscriptionStatus.None;
        // } else if (isSubscribed) {
        //   status = SubscriptionStatus.Subscribed;
        // } else {
        //   status = SubscriptionStatus.Unsubscribed;
        // }

        return BlogViewModel.mapToViewModel(blog);
      }),
    });
  }

  async findById(
    blogId: string,
    userId?: string,
  ): Promise<BlogViewModel | null> {
    const blog = await this.blogsQueryRepo.findOne({
      where: {
        id: blogId,
      },
    });

    if (!blog) return null;

    // const isSubscribed = false;

    // let status: SubscriptionStatus;

    // if (!userId) {
    //   status = SubscriptionStatus.None;
    // } else if (isSubscribed) {
    //   status = SubscriptionStatus.Subscribed;
    // } else {
    //   status = SubscriptionStatus.Unsubscribed;
    // }

    return BlogViewModel.mapToViewModel(blog);
  }

  async findPostsForBlog(
    blogId: string,
    queryParam: PostsQueryDto,
    userId?: string,
  ): Promise<PostsPaginatedViewModel> {
    return this.postsQueryRepo.findAll(queryParam, userId, blogId);
  }

  // * Extra methods over the basic API
  async countPostsForBlog(blogId: string): Promise<number> {
    return this.postOrmRepo.count({
      where: { blogId },
    });
  }
}
