import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { BlogsQueryDto } from './dto/blogs-query.dto';
import { API_ROUTES } from 'src/core/constants/api-routes';
import { BlogsQueryService } from '../application/blogs.query-service';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogViewModel } from './dto/view-models/blog.view-model';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { PostsService } from 'src/posts/application/posts.service';
import { BlogIdForPostsParamDto, BlogIdParamDto } from './dto/blog-params.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(
    private readonly blogsQueryService: BlogsQueryService,
    private blogsService: BlogsService,
    private postsService: PostsService,
  ) {}

  // * GET: Returns blogs with paging
  @Get() // = /blogs: декоратор (@) метода Get, автоматом возвр. status 200
  async getBlogsList(@Query() query: BlogsQueryDto) {
    return await this.blogsQueryService.getBlogsList(query);
  }

  // * POST: Create new blog
  @Post()
  async createBlog(
    @Body()
    createBlogDto: CreateBlogDto,
  ) {
    const createdBlogDoc = await this.blogsService.createBlog(createBlogDto);

    return BlogViewModel.mapToViewModel(createdBlogDoc);
  }

  // * GET: Returns all posts for specified blog
  @Get(':blogId/posts')
  getPostsListForBlog(@Param() params: BlogIdForPostsParamDto) {
    // try {
    //   // * Если optionalJwtAccessGuard прошел → userId уже есть
    //   const currentUserId = req.user?.id;
    //   const sanitizedQueryParam = matchedData<PostsListRP>(req, {
    //     locations: ["query"],
    //     includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    //   });
    //   const queryParamInput = {
    //     ...setDefaultSortAndPaginationIfNotExist<PostSortFieldRP>(
    //       sanitizedQueryParam
    //     ),
    //     blogId: req.params.id,
    //   };
    //   const postsListByBlogOutput =
    //     await this.blogsQueryService.getPostsListByBlog(
    //       queryParamInput,
    //       currentUserId // * Передаем userId для вычисления myStatus
    //     );
    //   return res.status(HTTP_STATUS_CODES.OK_200).json(postsListByBlogOutput);
    // } catch (error: unknown) {
    //   return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    //     errorsMessages: [
    //       { message: "Internal Server Error", field: "query params" },
    //     ],
    //   });
    // }
  }

  // * POST: Create new post for specific blog
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Body()
    dto: CreatePostForBlogDto,
  ) {
    return await this.postsService.createPost(params.blogId, dto);
  }

  // * GET: Returns blog by id
  @Get(':id') // = /blogs:id
  async getBlog(@Param() params: BlogIdParamDto) {
    const blogOutput = await this.blogsQueryService.getBlogById(params.id);

    if (!blogOutput)
      throw new NotFoundException(
        `The blog with ID:${params.id} was not found`,
      );

    return blogOutput;
  }

  // * PUT: Update existing blog by id with input model
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param() params: BlogIdParamDto,
    @Body()
    updateBlogDto: UpdateBlogDto,
  ) {
    await this.blogsService.updateBlog(params.id, updateBlogDto);
  }

  // * DELETE: Delete blog specified by id
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param() params: BlogIdParamDto) {
    await this.blogsService.deleteBlog(params.id);
  }
}
