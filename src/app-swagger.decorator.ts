import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { RootPageResponse } from './app.service';

export const ApiAppSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiExtraModels(RootPageResponse),

    ApiResponse({
      status: 200,
      description: 'Returns API metadata',
      type: RootPageResponse,
    }),
  );
};
