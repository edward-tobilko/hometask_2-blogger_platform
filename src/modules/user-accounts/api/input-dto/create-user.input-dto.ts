import { IsString, Length, Matches } from 'class-validator';

export class CreateUserInputDto {
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

// ? class-validator - использует декораторы (@IsString(), @IsNotEmpty() и т.д.), которые работают через reflect-metadata — они сохраняют метаданные прямо на классе в рантайме. Если бы DTO был interface — после компиляции он исчез бы, и декораторам просто не к чему было бы "прицепиться". NestJS ValidationPipe не смог бы прочитать правила валидации.
