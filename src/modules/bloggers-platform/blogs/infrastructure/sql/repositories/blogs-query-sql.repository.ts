import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';

import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';
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

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly postsQueryRepo: PostsQuerySqlRepository,
  ) {}

  async findAll(
    queryParam: BlogsQueryDto,
    userId?: string,
  ): Promise<BlogListPaginatedViewModel> {
    const { searchNameTerm, pageNumber, pageSize } = queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    const baseQb = this.blogsQueryRepo
      .createQueryBuilder('blog')
      .addSelect(
        '(SELECT COUNT(*) FROM blog_subscriptions bs WHERE bs.blog_id = blog.id)',
        'subscribersCount',
      )
      .addSelect(
        "CASE WHEN :userId::uuid IS NULL THEN 'None' WHEN EXISTS(SELECT 1 FROM blog_subscriptions bs WHERE bs.blog_id = blog.id AND bs.user_id = :userId::uuid) THEN 'Subscribed' ELSE 'Unsubscribed' END",
        'currentUserSubscriptionStatus',
      )
      .setParameter('userId', userId ?? null)
      .where(nameTerm ? { name: ILike(`%${nameTerm}%`) } : {})
      .orderBy(
        `blog.${queryParam.sortBy}`,
        queryParam.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );

    const totalCount = await baseQb.getCount(); // считает без LIMIT / OFFSET

    const { entities, raw } = await baseQb
      .skip(queryParam.calculateSkip())
      .take(pageSize)
      .getRawAndEntities<{
        subscribersCount: string;
        currentUserSubscriptionStatus: SubscriptionStatus;
      }>();

    return BlogListPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,

      items: entities.map((blog, index) => {
        return BlogViewModel.extraLogicMapToViewModel(
          blog,
          Number(raw[index].subscribersCount),
          raw[index].currentUserSubscriptionStatus,
        );
      }),
    });
  }

  async findById(
    blogId: string,
    userId?: string,
  ): Promise<BlogViewModel | null> {
    const result = await this.dataSource.query<
      (BlogOrmEntity & {
        subscribersCount: string;
        currentUserSubscriptionStatus: SubscriptionStatus;
      })[]
    >(
      `SELECT b.id, b.name, b.description, b.website_url as "websiteUrl", b.is_membership as "isMembership", b.created_at as "createdAt",
        (SELECT COUNT(*) FROM blog_subscriptions bs WHERE bs.blog_id = b.id) AS "subscribersCount",
        CASE
          WHEN $2::uuid IS NULL THEN 'None'
          WHEN EXISTS (
            SELECT 1 FROM blog_subscriptions bs
            WHERE bs.blog_id = b.id AND bs.user_id = $2::uuid
          ) THEN 'Subscribed'
          ELSE 'Unsubscribed'
        END AS "currentUserSubscriptionStatus"
      FROM blogs b
    WHERE b.id = $1`,
      [blogId, userId ?? null],
    );

    if (!result[0]) return null;

    return BlogViewModel.extraLogicMapToViewModel(
      result[0],
      Number(result[0].subscribersCount),
      result[0].currentUserSubscriptionStatus,
    );
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
