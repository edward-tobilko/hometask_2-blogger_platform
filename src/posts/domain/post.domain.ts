import { ObjectId, WithId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { CreatePostDtoDomain } from "./create-post-dto.domain";
import { UpdatePostDtoDomain } from "./update-post-dto.domain";

// * BLL - PostDomain - наша бизнес модель.
export class PostDomain {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;

  constructor(dto: FieldsOnly<PostDomain>) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
    this.createdAt = dto.createdAt;

    if (dto._id) {
      this._id = dto._id;
    }
  }

  // * Factory Method pattern
  static createPost(dto: CreatePostDtoDomain) {
    const newPost = new PostDomain({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(dto.blogId),
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

  static reconstitute(dto: FieldsOnly<PostDomain>): WithId<PostDomain> {
    return new PostDomain(dto) as WithId<PostDomain>;
  }
}

// ? class PostDomain -> updatePost() - бизнес-логика уровня домена, а не просто patch-update в репозитории. ( Domain Entity ).
// ? reconstitute() - метод «восстановления» (rehydration) объекта из БД:
// ? - Используется, когда ты получаешь PostDomain из, например, Mongo.
// ? - Ты получаешь plain object, а хочешь — полноценный экземпляр класса с методами.
// ? - Именно reconstitute возвращает правильный тип WithId<PostDomain> (то есть документ с _id).
// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
