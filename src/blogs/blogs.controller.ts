import { Controller, Get, Query } from '@nestjs/common';

import { BlogsQueryDto } from './dto/blogs-query.dto';
import { API_ROUTES } from 'src/core/constants/api-routes';

@Controller(API_ROUTES.blogs)
export class BlogsController {
  // constructor(private readonly blogsQueryService: BlogsQueryService) {}

  @Get() // декоратор (@) метода Get, автоматом возвр. status 200
  getBlogsList(@Query() query: BlogsQueryDto) {
    // try {
    //   const sanitizedQueryParam = matchedData<BlogsListRP>(request, {
    //     locations: ['query'],
    //     includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    //   });
    //   const queryParamInput =
    //     setDefaultSortAndPaginationIfNotExist<BlogSortFieldRP>(
    //       sanitizedQueryParam,
    //     );
    //   const blogsListOutput =
    //     this.blogsQueryService.getBlogsList(queryParamInput);
    //   return response.status(200).json(blogsListOutput);
    // } catch (error: unknown) {
    //   return response.status(500).json({
    //     errorsMessages: [
    //       { message: 'Internal Server Error', field: 'query params' },
    //     ],
    //   });
    // }
  }
}
