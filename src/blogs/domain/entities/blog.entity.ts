import { randomUUID } from "crypto";

import { FieldsOnly } from "@core/types/fields-only.type";
import { BlogDtoDomain } from "../value-objects/blog-dto.domain";
import { ValidationError } from "@core/errors/application.error";

type BlogProps = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

// * BLL - BlogDomain - бизнес модель
export class BlogEntity {
  private constructor(private dto: FieldsOnly<BlogProps>) {}

  // * Getters
  get id(): string {
    return this.dto.id;
  }
  get name(): string {
    return this.dto.name;
  }
  get description(): string {
    return this.dto.description;
  }
  get websiteUrl(): string {
    return this.dto.websiteUrl;
  }
  get createdAt(): Date {
    return this.dto.createdAt;
  }
  get isMembership(): boolean {
    return this.dto.isMembership;
  }

  // * Factory validation methods
  private static validateName(name: string) {
    if (!name || name.trim().length === 0)
      throw new ValidationError("Name is required", "name", 400);

    if (name.length > 15)
      throw new ValidationError(
        "Name must not exceed 15 characters",
        "name",
        400
      );
  }
  private static validateDescription(description: string) {
    if (!description || description.trim().length === 0)
      throw new ValidationError("Description is required", "description", 400);

    if (description.length > 500)
      throw new ValidationError(
        "Description must not exceed 500 characters",
        "description",
        400
      );
  }
  private static validateWebsiteUrl(websiteUrl: string) {
    if (!websiteUrl || websiteUrl.trim().length === 0)
      throw new ValidationError("Website is required", "websiteUrl", 400);

    if (websiteUrl.length > 100)
      throw new ValidationError(
        "Website must not exceed 100 characters",
        "websiteUrl",
        400
      );

    try {
      new URL(websiteUrl);
    } catch {
      throw new ValidationError("Website URL is invalid", "websiteUrl", 400);
    }
  }

  // * Factory Method pattern
  static reconstitute(props: BlogProps): BlogEntity {
    return new BlogEntity(props);
  }

  static createBlog(dto: BlogDtoDomain): BlogEntity {
    BlogEntity.validateName(dto.name);
    BlogEntity.validateDescription(dto.description);
    BlogEntity.validateWebsiteUrl(dto.websiteUrl);

    const newBlog = new BlogEntity({
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    });

    return newBlog;
  }

  updateBlog(dto: BlogDtoDomain): void {
    BlogEntity.validateName(dto.name);
    BlogEntity.validateDescription(dto.description);
    BlogEntity.validateWebsiteUrl(dto.websiteUrl);

    this.dto.name = dto.name;
    this.dto.description = dto.description;
    this.dto.websiteUrl = dto.websiteUrl;
  }
}

// ? class BlogEntity -> updateBlog() - бизнес-логика уровня домена, а не просто patch-update в репозитории. ( Domain / Entity ).

// ? reconstitute() - метод «восстановления» (rehydration) объекта из БД:
// ? - Используется, когда получаем BlogEntity из, например, Mongo.
// ? - Получаем plain object, а хотим — полноценный экземпляр класса с методами.

// ? - Именно reconstitute возвращает правильный тип WithId<BlogEntity> (то есть документ с _id).

// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
