import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dtos/query.dto';
import { UserSortFieldRP } from 'src/core/enums/enums';

export class UsersQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(UserSortFieldRP)
  sortBy: UserSortFieldRP = UserSortFieldRP.CreatedAt;

  @IsOptional()
  @IsString()
  searchLoginTerm?: string;

  @IsOptional()
  @IsString()
  searchEmailTerm?: string;
}
