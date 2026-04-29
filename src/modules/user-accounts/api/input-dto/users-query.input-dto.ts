import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';

enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class UsersQueryInputDto extends QueryDto {
  @IsOptional()
  @IsEnum(UsersSortBy)
  @ApiProperty({
    default: 'createdAt',
  })
  sortBy = UsersSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'Search term for user Login: Login should contains this term in any position',
    default: null,
  })
  searchLoginTerm: string | null = null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'Search term for user Email: Email should contains this term in any position',
    default: null,
  })
  searchEmailTerm: string | null = null;
}
