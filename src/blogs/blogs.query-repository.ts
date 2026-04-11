import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BlogListPaginatedViewModel } from './view-models/blogs-paginated.view-model';
import { Blog, BlogDocument, BlogLean } from './schemas/blogs.schema';
import { BlogsQueryDto } from './dto/blogs-query.dto';
import { BlogViewModel } from './view-models/blog.view-model';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async findBlogs(
    queryParam: BlogsQueryDto,
  ): Promise<BlogListPaginatedViewModel> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    const filter = nameTerm
      ? {
          name: { $regex: nameTerm, $options: 'i' },
        }
      : {};

    const [items, totalCount] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })

        .skip((pageNumber - 1) * pageSize)

        .limit(pageSize)
        .lean<BlogLean[]>()
        .exec(), // превращает Mongoose Query в Promise.

      this.blogModel.countDocuments(filter),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,

      items: items.map(
        (blog: BlogLean): BlogViewModel => ({
          id: blog._id.toString(),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt.toISOString(),
          isMembership: blog.isMembership,
        }),
      ),
    };
  }
}

// ? @InjectModel(Blog.name) — специальный декоратор от `@nestjs/mongoose`, который говорит Nest: "вколи сюда модель, зарегистрированную под именем `Blog.name`. Без этого декоратора Nest не знает, какую именно модель ты хочешь.
