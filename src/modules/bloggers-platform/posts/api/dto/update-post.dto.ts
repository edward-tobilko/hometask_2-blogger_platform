import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {}

// ? PartialType(CreatePostDto) - делает все поля из CreatePostDto опциональными, но сохраняет декораторы валидации. Это стандартный Nest-паттерн для update-DTO.
