import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { ValidationErrorViewModel } from 'src/core/dto/validation-errors-view.dto';
import { RegistrationEmailResendingInputDto } from '../../../input-dto/registration-email-resending.input-dto';

export const ApiRegistrationEmailResendingSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      type: RegistrationEmailResendingInputDto,
      description: 'Data for constructing new user',
    }),

    ApiResponse({
      status: 204,
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),
    ApiResponse({
      status: 400,
      description: `If the inputModel has incorrect values (in particular if the user with the given email or login already exists)`,
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
