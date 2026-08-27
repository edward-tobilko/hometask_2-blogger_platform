import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
// import { LikeStatus } from 'src/core/enums/like-status.enum';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';
import { BlogOrmEntity } from '../schemas/blog-orm.entity';
import { PostOrmEntity } from 'src/modules/bloggers-platform/posts/infrastructure/sql/schemas/post-orm.entity';

@Injectable()
export class BlogsQuerySqlRepository {
  constructor(
    @InjectRepository(BlogOrmEntity)
    private readonly blogsQueryRepo: Repository<BlogOrmEntity>,

    @InjectRepository(PostOrmEntity)
    private readonly postsQueryRepo: Repository<PostOrmEntity>,
  ) {}

  async findBlogs(
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
        const isSubscribed = false;

        let status: SubscriptionStatus;

        if (!userId) {
          status = SubscriptionStatus.None;
        } else if (isSubscribed) {
          status = SubscriptionStatus.Subscribed;
        } else {
          status = SubscriptionStatus.Unsubscribed;
        }

        return BlogViewModel.mapToViewModel(blog, 0, status);
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

    const isSubscribed = false;

    let status: SubscriptionStatus;

    if (!userId) {
      status = SubscriptionStatus.None;
    } else if (isSubscribed) {
      status = SubscriptionStatus.Subscribed;
    } else {
      status = SubscriptionStatus.Unsubscribed;
    }

    return BlogViewModel.mapToViewModel(blog, 0, status);
  }

  async findPostsForBlog(
    blogId: string,
    queryParam: PostsQueryDto,
    userId?: string,
  ): Promise<PostsPaginatedViewModel> {
    const { pageNumber, pageSize } = queryParam;

    // * фильтруем (получаем) все посты этого блога
    const where: any[] = [{ id: blogId }];

    const [items, totalCount] = await this.postsQueryRepo.findAndCount({
      where,
      order: queryParam.calculateSort(),
      skip: queryParam.calculateSkip(),
      take: pageSize,
    });

    return PostsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,

      items: items.map((post) => {
        // const myStatus = userId
        //   ? (post.extendedLikesInfo?.userReactions?.find(
        //       (reaction) => reaction.userId === userId,
        //     )?.status ?? LikeStatus.None)
        //   : LikeStatus.None;

        // return PostViewModel.mapToViewModel(post, myStatus ?? LikeStatus.None);
        return PostViewModel.mapToViewModel(post);
      }),
    });
  }

  //   async countPostsForBlog(blogId: string): Promise<number> {
  //     return this.postModel.countDocuments({
  //       blogId: new Types.ObjectId(blogId),
  //     });
  //   }
}
