import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

export const ApiLoginSwagger = (summary: string) => {
  return applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          loginOrEmail: { type: 'string', example: 'string' },
          password: { type: 'string', example: 'string' },
        },
      },
    }),
    ApiOperation({ summary }),
  );
};
