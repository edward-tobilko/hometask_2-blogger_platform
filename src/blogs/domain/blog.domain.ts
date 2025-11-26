import { ObjectId, WithId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { BlogDtoDomain } from "./blog-dto.domain";

// * BLL - BlogDomain - бизнес модель
export class BlogDomain {
  _id?: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  constructor(dto: FieldsOnly<BlogDomain>) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.createdAt = dto.createdAt;
    this.isMembership = dto.isMembership;

    if (dto._id) {
      this._id = dto._id;
    }
  }

  // * Factory Method pattern
  static createBlog(dto: BlogDtoDomain) {
    const newBlog = new BlogDomain({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: true,
    });

    return newBlog;
  }

  updateBlog(dto: BlogDtoDomain) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  static reconstitute(dto: FieldsOnly<BlogDomain>): WithId<BlogDomain> {
    return new BlogDomain(dto) as WithId<BlogDomain>;
  }
}

// ? class BlogDomain -> updateBlog() - бизнес-логика уровня домена, а не просто patch-update в репозитории. ( Domain Entity ).
// ? reconstitute() - метод «восстановления» (rehydration) объекта из БД:
// ? - Используется, когда ты получаешь BlogDomain из, например, Mongo.
// ? - Ты получаешь plain object, а хочешь — полноценный экземпляр класса с методами.
// ? - Именно reconstitute возвращает правильный тип WithId<BlogDomain> (то есть документ с _id).
// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
