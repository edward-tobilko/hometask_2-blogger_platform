import { IsNotEmpty, IsString } from 'class-validator';

export class Login {
  @IsNotEmpty()
  @IsString()
  loginOrEmail!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
