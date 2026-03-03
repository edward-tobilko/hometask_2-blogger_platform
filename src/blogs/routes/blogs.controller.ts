import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "console";
import { inject, injectable } from "inversify";
import { Types as MongooseTypes } from "mongoose";

import { BlogsListRP } from "./request-payload-types/blogs-list.request-payload-type";
import { BlogSortFieldRP } from "./request-payload-types/blog-sort-field.request-payload-type";
import { setDefaultSortAndPaginationIfNotExist } from "@core/helpers/set-default-sort-pagination.helper";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { Types } from "@core/di/types";
import { RepositoryNotFoundError } from "@core/errors/application.error";
import { PostsListRP } from "posts/presentation/request-payload-types/posts-list.request-payload-types";
import { PostSortFieldRP } from "posts/presentation/request-payload-types/post-sort-field.request-payload-types";
import { CreateBlogRP } from "./request-payload-types/create-blog.request-payload-type";
import { createCommand } from "@core/helpers/create-command.helper";
import { CreateBlogDtoCommand } from "blogs/application/commands/blog-dto-type.commands";
import { CreatePostForBlogRP } from "posts/presentation/request-payload-types/create-post-for-blog.request-payload-types";
import { CreatePostForBlogDtoCommand } from "posts/application/commands/create-post-for-blog-dto.command";
import { UpdateBlogRP } from "./request-payload-types/update-blog.request-payload";
import { IBlogsQueryService } from "blogs/interfaces/IBlogsQueryService";
import { IBlogsService } from "blogs/interfaces/IBlogsService";

@injectable()
export class BlogsController {
  constructor(
    @inject(Types.IBlogsQueryService)
    private blogsQueryService: IBlogsQueryService,
    @inject(Types.IBlogsService) private blogsService: IBlogsService
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

      log(
        `Blogs page ${blogsListOutput.page}/${blogsListOutput.pagesCount} - items: ${blogsListOutput.items.length} - total: ${blogsListOutput.totalCount}`
      );

      res.status(HTTP_STATUS_CODES.OK_200).json(blogsListOutput);
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

      res.status(HTTP_STATUS_CODES.OK_200).json(blogOutput);
    } catch (error: unknown) {
      if (error instanceof RepositoryNotFoundError) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория findBlogByIdQueryRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
        });
      }

      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [{ message: "Internal Server Error", field: "id" }],
      });
    }
  }

  async getPostsListForBlogHandler(
    req: Request<{ id: string }, {}, PostsListRP, {}>,
    res: Response
  ) {
    try {
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
        await this.blogsQueryService.getPostsListByBlog(queryParamInput);

      res.status(HTTP_STATUS_CODES.OK_200).json(postsListByBlogOutput);
    } catch (error: unknown) {
      if (error instanceof RepositoryNotFoundError) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория findAllPostsForBlogQueryRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
        });
      }

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

      const createdBlogOutput = await this.blogsService.createBlog(command);

      res.status(HTTP_STATUS_CODES.CREATED_201).json(createdBlogOutput.data);
    } catch (error: unknown) {
      return res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
    }
  }

  async createPostForBlogHandler(
    req: Request<{ id: string }, {}, CreatePostForBlogRP, {}>,
    res: Response
  ) {
    try {
      console.log("HANDLER PARAMS:", req.params.id); // if id = 1 -> error

      if (!MongooseTypes.ObjectId.isValid(req.params.id)) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST_400).json({
          errorsMessages: [
            { message: "Incorrect format of ObjectId", field: "id" },
          ],
        });
      }

      const command = createCommand<CreatePostForBlogDtoCommand>({
        ...req.body,

        blogId: req.params.id,
      });

      const createdPostForBlogOutput =
        await this.blogsService.createPostForBlog(command);

      res
        .status(HTTP_STATUS_CODES.CREATED_201)
        .json(createdPostForBlogOutput.data);
    } catch (error: unknown) {
      if (error instanceof RepositoryNotFoundError) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: (error as Error).message, field: "id" }],
        });
      }

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

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      if (error instanceof RepositoryNotFoundError) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория saveBlogRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
        });
      }

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

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      if (error instanceof RepositoryNotFoundError) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
          errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория deleteBlogRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
        });
      }

      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [{ message: "Internal Server Error", field: "id" }],
      });
    }
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
