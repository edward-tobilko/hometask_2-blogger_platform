import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationConfirmInputDto {
  @ApiProperty({ description: 'Code that be sent via Email inside link' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
