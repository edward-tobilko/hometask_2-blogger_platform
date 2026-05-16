import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';

export const ApiCreateUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiResponse({
      status: 201,
      description: 'Returns the newly created user',
      type: UserViewDto,
    }),
  );
};
