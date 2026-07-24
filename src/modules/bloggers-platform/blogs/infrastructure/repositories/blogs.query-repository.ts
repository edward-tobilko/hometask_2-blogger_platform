import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import {
  Post,
  PostLean,
  PostModel,
} from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
import {
  Blog,
  BlogLean,
  BlogModelType,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { LikeStatus } from 'src/core/enums/like-status.enum';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    @InjectModel(Post.name) private readonly postModel: PostModel,
  ) {}

  async findBlogs(
    queryParam: BlogsQueryDto,
  ): Promise<BlogListPaginatedViewModel> {
    const { searchNameTerm, pageNumber, pageSize } = queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    const filter = nameTerm
      ? {
          name: { $regex: nameTerm, $options: 'i' },
        }
      : {};

    const [items, totalCount] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort(queryParam.calculateSort())
        .skip(queryParam.calculateSkip())
        .limit(pageSize)
        .lean<BlogLean[]>()
        .exec(), // превращает Mongoose Query в Promise.

      this.blogModel.countDocuments(filter),
    ]);

    return BlogListPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,

      items: items.map((blog) => BlogViewModel.mapToViewModel(blog)),
    });
  }

  async findBlogById(blogId: string): Promise<BlogViewModel | null> {
    const blogLean = await this.blogModel
      .findById(blogId)
      .lean<BlogLean>()
      .exec();

    if (!blogLean) return null;

    return BlogViewModel.mapToViewModel(blogLean);
  }

  async findPostsForBlog(
    blogId: string,
    query: PostsQueryDto,
    userId?: string,
  ): Promise<PostsPaginatedViewModel> {
    const { pageNumber, pageSize } = query;

    // * фильтруем (получаем) все посты этого блога
    const filter = { blogId: new Types.ObjectId(blogId) };

    const [items, totalCount] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(query.calculateSort())
        .skip(query.calculateSkip())
        .limit(pageSize)
        .lean<PostLean[]>()
        .exec(), // превращает Mongoose Query в Promise.

      this.postModel.countDocuments(filter),
    ]);

    return PostsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,

      items: items.map((post) => {
        const myStatus = userId
          ? (post.extendedLikesInfo?.userReactions?.find(
              (reaction) => reaction.userId === userId,
            )?.status ?? LikeStatus.None)
          : LikeStatus.None;

        return PostViewModel.mapToViewModel(post, myStatus ?? LikeStatus.None);
      }),
    });
  }

  async countPostsForBlog(blogId: string): Promise<number> {
    return this.postModel.countDocuments({
      blogId: new Types.ObjectId(blogId),
    });
  }
}

// ? @InjectModel(Blog.name) — специальный декоратор от `@nestjs/mongoose`, который говорит Nest: "вколи сюда модель, зарегистрированную под именем `Blog.name`. Без этого декоратора Nest не знает, какую именно модель ты хочешь.
