import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { RegistrationConfirmInputDto } from '../../../input-dto/registration-confirm.input-dto';
import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';

export const ApiRegistrationConfirmationSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({ type: RegistrationConfirmInputDto }),

    ApiResponse({
      status: 204,
      description: 'Email was verified. Account was activated',
    }),
    ApiResponse({
      status: 400,
      description: `If the confirmation code is incorrect, expired or already been applied`,
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
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
};
