import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const ApiPasswordRecoverySwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({
      schema: {
        type: 'object',
        title: 'PasswordRecoveryInputModel',
        properties: {
          email: {
            type: 'string',
            pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
            example: 'useremail@company.com',
            description: 'Email of registered user',
          },
        },
      },
    }),

    ApiResponse({
      status: 204,
      description:
        "Even if current email is not registered (for prevent user's email detection)",
    }),
    ApiResponse({
      status: 400,
      description: `If the inputModel has invalid email (for example 222^gmail.com)`,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
};
