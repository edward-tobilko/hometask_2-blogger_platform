import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';

export const ApiCreateUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),
    ApiBody({
      type: CreateUserInputDto,
      description: 'Data for constructing new user',
    }),

    ApiResponse({
      status: 201,
      description: 'Returns the newly created user',
      content: {
        'application/json': { schema: { $ref: getSchemaPath(UserViewDto) } },
        'text/plain': { schema: { $ref: getSchemaPath(UserViewDto) } },
        'text/json': { schema: { $ref: getSchemaPath(UserViewDto) } },
      },
    }),
    ApiResponse({
      status: 400,
      description: `If the inputModel has incorrect values.\n\nNote: If the error should be in the BLL, for example, "the email address
   is not unique", do not try to mix this error with input validation errors in the middleware, just return one element in the errors
   array`,
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ValidationErrorViewModel) },
        },
        'text/plain': {
          schema: { $ref: getSchemaPath(ValidationErrorViewModel) },
        },
        'text/json': {
          schema: { $ref: getSchemaPath(ValidationErrorViewModel) },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};
