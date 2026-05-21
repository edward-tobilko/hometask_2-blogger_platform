import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class UsersQueryInputDto extends QueryDto {
  @IsOptional()
  @IsEnum(UsersSortBy)
  sortBy: UsersSortBy = UsersSortBy.CreatedAt;

  @ApiProperty({
    description:
      'Search term for user Login: Login should contains this term in any position',
    default: null,
  })
  @IsOptional()
  @IsString()
  searchLoginTerm: string | null = null;

  @ApiProperty({
    description:
      'Search term for user Email: Email should contains this term in any position',
    default: null,
  })
  @IsOptional()
  @IsString()
  searchEmailTerm: string | null = null;
}
