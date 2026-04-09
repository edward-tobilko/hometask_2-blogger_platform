import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { BlogsQueryDto } from './dto/blogs-query.dto';
import { API_ROUTES } from 'src/core/constants/api-routes';

@Controller(API_ROUTES.blogs)
export class BlogsController {
  // constructor(private readonly blogsQueryService: BlogsQueryService) {}

  // * GET: Returns blogs with paging
  @Get() // = /blogs: декоратор (@) метода Get, автоматом возвр. status 200
  getBlogsList(@Res() response: Response, @Query() query: BlogsQueryDto) {
    try {
      // const sanitizedQueryParam = matchedData<BlogsListRP>(request, {
      //   locations: ['query'],
      //   includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      // });
      // const queryParamInput =
      //   setDefaultSortAndPaginationIfNotExist<BlogSortFieldRP>(
      //     sanitizedQueryParam,
      //   );
      // const blogsListOutput =
      //   this.blogsQueryService.getBlogsList(queryParamInput);

      response.status(HttpStatus.OK).send({
        pagesCount: 0,
        page: 0,
        pageSize: 0,
        totalCount: 0,
        items: [
          {
            id: '1',
            name: 'jon',
            description: 'desc1',
            websiteUrl: 'lol@gmail.com',
            createdAt: '2026-04-09T17:51:31.453Z',
            isMembership: true,
          },
          {
            id: '2',
            name: 'tom',
            description: 'desc2',
            websiteUrl: 'lol2@gmail.com',
            createdAt: '2026-04-10T17:51:31.453Z',
            isMembership: false,
          },
        ].filter(
          (term) =>
            !query.searchNameTerm ||
            term.name.indexOf(query.searchNameTerm) > -1,
        ),
      });
    } catch (error: unknown) {
      response.status(HttpStatus.BAD_REQUEST).send({
        errorsMessages: [
          { message: 'Internal Server Error', field: 'query params' },
        ],
      });
    }
  }

  // * POST: Create new blo
  @Post()
  createBlog(
    @Body()
    createBlogDto: {
      name: string;
      description: string;
      websiteUrl: string;
    },
  ) {
    // try {
    //   const sanitizedParam = matchedData<CreateBlogRP>(req, {
    //     locations: ['body'],
    //     includeOptionals: false,
    //   });
    //   const command = createCommand<CreateBlogDtoCommand>(sanitizedParam);
    //   const createdBlogResult = await this.blogsService.createBlog(command);
    //   if (createdBlogResult.status === ApplicationResultStatus.NotFound) {
    //     return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
    //       errorsMessages: [{ message: 'Blog does not exist!', field: 'id' }],
    //     });
    //   }
    //   return res
    //     .status(HTTP_STATUS_CODES.CREATED_201)
    //     .json(createdBlogResult.data);
    // } catch (error: unknown) {
    //   return res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
    // }
  }

  // * GET: Returns all posts for specified blog
  @Get(':id') // = /blogs:id
  getBlog(@Param('id') blogId: string) {
    // try {
    //   const id = req.params.id;
    //   const blogOutput = this.blogsQueryService.getBlogById(id);
    //   if (!blogOutput) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    //   return res.status(HTTP_STATUS_CODES.OK_200).json(blogOutput);
    // } catch (error: unknown) {
    //   return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    //     errorsMessages: [{ message: 'Internal Server Error', field: 'id' }],
    //   });
    // }
  }

  // * POST: Create new post for specific blog
  @Post(':id/posts')
  createPostForBlogHandler(
    @Param('id') blogId: string,
    @Body()
    createPostForBlogDto: {
      title: string;
      shortDescription: string;
      content: string;
    },
  ) {
    // try {
    //   const command = createCommand<CreatePostForBlogDtoCommand>({
    //     ...req.body,
    //     blogId: req.params.id,
    //   });
    //   const result = await this.blogsService.createPostForBlog(command);
    //   if (result.status === ApplicationResultStatus.NotFound) {
    //     return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
    //       errorsMessages: [{ message: 'Blog does not exist!', field: 'id' }],
    //     });
    //   }
    //   return res.status(HTTP_STATUS_CODES.CREATED_201).json(result.data);
    // } catch (error: unknown) {
    //   return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    //     errorsMessages: [{ message: 'Internal Server Error', field: 'id' }],
    //   });
    // }
  }

  // * GET: Returns blog by id
  @Get(':id/posts')
  getPostsListForBlog(@Param('id') blogId: string) {
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

  // * PUT: Update existing blog by id with input model
  @Put(':id')
  updateBlogHandler(
    @Param('id') params: { blogId: string },
    @Body()
    updateBlogDto: { name: string; description: string; websiteUrl: string },
  ) {
    // try {
    //   const payload: UpdateBlogRP = req.body;
    //   const command = createCommand({
    //     id: req.params.id,
    //     ...payload,
    //   });
    //   await this.blogsService.updateBlog(command);
    //   return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    // } catch (error: unknown) {
    //   return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    //     errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    //   });
    // }
  }

  // * DELETE: Delete blog specified by id
  @Delete(':id')
  deleteBlogHandler(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') blogId: string,
  ) {
    try {
      const id = request.params.id;
      // const command = createCommand({
      //   id: req.params.id,
      // });

      // this.blogsService.deleteBlog(command);

      // response.sendStatus(HttpStatus.NO_CONTENT);
    } catch (error: unknown) {
      return response.status(HttpStatus.BAD_REQUEST).send({
        errorsMessages: [{ message: 'Internal Server Error', field: 'id' }],
      });
    }
  }
}
