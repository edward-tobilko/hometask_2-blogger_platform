import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends CreateBlogDto {}

// ? PartialType - делает все поля из CreateBlogDto опциональными, но сохраняет декораторы валидации. Это стандартный Nest-паттерн для update-DTO (import { PartialType } from '@nestjs/mapped-types'). Если поля будут не обязательные.
