import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationConfirmInputDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
