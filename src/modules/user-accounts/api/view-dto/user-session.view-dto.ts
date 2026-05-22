import { ApiProperty } from '@nestjs/swagger';

export class UserSessionViewDto {
  @ApiProperty()
  email!: string;

  @ApiProperty()
  login!: string;

  @ApiProperty()
  userId!: string;
}
