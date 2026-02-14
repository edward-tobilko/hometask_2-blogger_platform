import { Types } from "mongoose";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { CreatePostDtoDomain } from "./create-post-dto.domain";
import { UpdatePostDtoDomain } from "./update-post-dto.domain";

// * BLL - PostDomain - наша бизнес модель.
export class PostDomain {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
  blogName: string;
  createdAt: Date;

  constructor(dto: FieldsOnly<PostDomain>) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
    this.createdAt = dto.createdAt;
  }

  // * Factory Method pattern
  static createPost(dto: CreatePostDtoDomain) {
    const newPost = new PostDomain({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new Types.ObjectId(dto.blogId),
      blogName: dto.blogName,
      createdAt: new Date(),
    });

    return newPost;
  }

  updatePost(dto: UpdatePostDtoDomain) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}

// ? class PostDomain -> updatePost() - бизнес-логика уровня домена, а не просто patch-update в репозитории. ( Domain Entity ).
// ? - Используется, когда ты получаешь PostDomain из, например, Mongo.
// ? - Ты получаешь plain object, а хочешь — полноценный экземпляр класса с методами.
// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
