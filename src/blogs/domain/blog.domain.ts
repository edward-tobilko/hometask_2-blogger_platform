import { FieldsOnly } from "../../core/types/fields-only.type";
import { BlogDtoDomain } from "./blog-dto.domain";

// * BLL - BlogDomain - бизнес модель
export class BlogDomain {
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
  }

  // * Factory Method pattern
  static createBlog(dto: BlogDtoDomain) {
    const newBlog = new BlogDomain({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    });

    return newBlog;
  }

  updateBlog(dto: BlogDtoDomain) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

// ? class BlogDomain -> updateBlog() - бизнес-логика уровня домена, а не просто patch-update в репозитории. ( Domain Entity ).
// ? reconstitute() - метод «восстановления» (rehydration) объекта из БД:
// ? - Используется, когда ты получаешь BlogDomain из, например, Mongo.
// ? - Ты получаешь plain object, а хочешь — полноценный экземпляр класса с методами.
// ? - Именно reconstitute возвращает правильный тип WithId<BlogDomain> (то есть документ с _id).
// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
