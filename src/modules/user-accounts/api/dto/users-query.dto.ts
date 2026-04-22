import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';
import { UserSortFieldRP } from 'src/core/enums/enums';

export class UsersQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(UserSortFieldRP)
  sortBy = UserSortFieldRP.CreatedAt;

  @IsOptional()
  @IsString()
  searchLoginTerm: string | null = null;

  @IsOptional()
  @IsString()
  searchEmailTerm: string | null = null;
}
