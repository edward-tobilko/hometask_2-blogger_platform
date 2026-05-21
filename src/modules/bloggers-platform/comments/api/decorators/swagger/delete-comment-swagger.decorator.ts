import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiDeleteCommentSwagger = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),

    ApiBearerAuth(),

    ApiResponse({ status: 204, description: 'No Content' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'If try delete the comment that is not your own',
    }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
