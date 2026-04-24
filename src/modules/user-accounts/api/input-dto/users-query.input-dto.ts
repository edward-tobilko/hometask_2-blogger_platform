import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';
import { UserSortFieldRP } from 'src/core/enums/enums';

export class UsersQueryInputDto extends QueryDto {
  @IsOptional()
  @IsEnum(UserSortFieldRP)
  @ApiProperty({
    default: 'createdAt',
  })
  sortBy = UserSortFieldRP.CreatedAt;

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
