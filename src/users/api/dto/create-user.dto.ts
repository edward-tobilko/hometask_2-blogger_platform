import { IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login!: string;

  @IsString()
  @Length(6, 20)
  password!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  email!: string;
}
