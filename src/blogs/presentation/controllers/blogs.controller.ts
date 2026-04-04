import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { inject, injectable } from "inversify";

import { BlogsListRP } from "../request-payload-types/blogs-list.request-payload-type";
import { BlogSortFieldRP } from "../request-payload-types/blog-sort-field.request-payload-type";
import { setDefaultSortAndPaginationIfNotExist } from "@core/helpers/set-default-sort-pagination.helper";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { DiTypes } from "@core/di/types";
import { PostsListRP } from "@posts/presentation/request-payload-types/posts-list.request-payload-types";
import { PostSortFieldRP } from "@posts/presentation/request-payload-types/post-sort-field.request-payload-types";
import { CreateBlogRP } from "../request-payload-types/create-blog.request-payload-type";
import { createCommand } from "@core/helpers/create-command.helper";
import { CreateBlogDtoCommand } from "@blogs/application/commands/blog-dto-type.commands";
import { CreatePostForBlogRP } from "@posts/presentation/request-payload-types/create-post-for-blog.request-payload-types";
import { CreatePostForBlogDtoCommand } from "@posts/application/commands/create-post-for-blog-dto.command";
import { UpdateBlogRP } from "../request-payload-types/update-blog.request-payload";
import { IBlogsQueryService } from "@blogs/application/interfaces/blogs-query-service.interface";
import { IBlogsService } from "@blogs/application/interfaces/blogs-service.interface";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";

@injectable()
export class BlogsController {
  constructor(
    @inject(DiTypes.IBlogsQueryService)
    private blogsQueryService: IBlogsQueryService,
    @inject(DiTypes.IBlogsService) private blogsService: IBlogsService
  ) {}

  async getBlogsListHandler(
    req: Request<{}, {}, {}, {}>,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const sanitizedQueryParam = matchedData<BlogsListRP>(req, {
        locations: ["query"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      });

      const queryParamInput =
        setDefaultSortAndPaginationIfNotExist<BlogSortFieldRP>(
          sanitizedQueryParam
        );

      const blogsListOutput =
        await this.blogsQueryService.getBlogsList(queryParamInput);

      return res.status(HTTP_STATUS_CODES.OK_200).json(blogsListOutput);
    } catch (error: unknown) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [
          { message: "Internal Server Error", field: "query params" },
        ],
      });
    }
  }

  async getBlogByIdHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id;

      const blogOutput = await this.blogsQueryService.getBlogById(id);

      if (!blogOutput) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

      return res.status(HTTP_STATUS_CODES.OK_200).json(blogOutput);
    } catch (error: unknown) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [{ message: "Internal Server Error", field: "id" }],
      });
    }
  }

  async getPostsListForBlogHandler(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {
      // * Если optionalJwtAccessGuard прошел → userId уже есть
      const currentUserId = req.user?.id;

      const sanitizedQueryParam = matchedData<PostsListRP>(req, {
        locations: ["query"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      });

      const queryParamInput = {
        ...setDefaultSortAndPaginationIfNotExist<PostSortFieldRP>(
          sanitizedQueryParam
        ),

        blogId: req.params.id,
      };

      const postsListByBlogOutput =
        await this.blogsQueryService.getPostsListByBlog(
          queryParamInput,
          currentUserId // * Передаем userId для вычисления myStatus
        );

      return res.status(HTTP_STATUS_CODES.OK_200).json(postsListByBlogOutput);
    } catch (error: unknown) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [
          { message: "Internal Server Error", field: "query params" },
        ],
      });
    }
  }

  async createBlogHandler(
    req: Request<{}, {}, CreateBlogRP, {}>,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const sanitizedParam = matchedData<CreateBlogRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const command = createCommand<CreateBlogDtoCommand>(sanitizedParam);

      const createdBlogResult = await this.blogsService.createBlog(command);

      if (createdBlogResult.status === ApplicationResultStatus.NotFound) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: "Blog does not exist!", field: "id" }],
        });
      }

      return res
        .status(HTTP_STATUS_CODES.CREATED_201)
        .json(createdBlogResult.data);
    } catch (error: unknown) {
      return res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async createPostForBlogHandler(
    req: Request<{ id: string }, {}, CreatePostForBlogRP, {}>,
    res: Response
  ) {
    try {
      const command = createCommand<CreatePostForBlogDtoCommand>({
        ...req.body,

        blogId: req.params.id,
      });

      const result = await this.blogsService.createPostForBlog(command);

      if (result.status === ApplicationResultStatus.NotFound) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: "Blog does not exist!", field: "id" }],
        });
      }

      return res.status(HTTP_STATUS_CODES.CREATED_201).json(result.data);
    } catch (error: unknown) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [{ message: "Internal Server Error", field: "id" }],
      });
    }
  }

  async updateBlogHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const payload: UpdateBlogRP = req.body;

      const command = createCommand({
        id: req.params.id,
        ...payload,
      });

      await this.blogsService.updateBlog(command);

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [{ message: "Internal Server Error", field: "id" }],
      });
    }
  }

  async deleteBlogHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const command = createCommand({
        id: req.params.id,
      });

      await this.blogsService.deleteBlog(command);

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [{ message: "Internal Server Error", field: "id" }],
      });
    }
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
