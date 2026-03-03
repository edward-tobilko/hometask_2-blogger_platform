import { Types } from "mongoose";

import { PostDb } from "posts/infrastructure/mongoose/post.schema";
import { CreatePostDtoEntity } from "../value-objects/create-post-dto.entity";
import { UpdatePostDtoEntity } from "../value-objects/update-post-dto.entity";

export class PostEntity {
  private constructor(
    private readonly props: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: Types.ObjectId;

      blogName: string;
    }
  ) {}

  // * Factory Method pattern
  static reconstitute(props: {
    title: string;
    shortDescription: string;
    content: string;
    blogId: Types.ObjectId;

    blogName: string;
  }): PostEntity {
    return new PostEntity(props);
  }

  static createPost(dto: CreatePostDtoEntity): PostEntity {
    const newPostDocument = new PostEntity({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new Types.ObjectId(dto.blogId),

      blogName: dto.blogName,
    });

    return newPostDocument;
  }

  updatePost(dto: UpdatePostDtoEntity) {
    this.props.title = dto.title;
    this.props.shortDescription = dto.shortDescription;
    this.props.content = dto.content;
  }

  toDb(): PostDb {
    return {
      title: this.props.title,
      shortDescription: this.props.shortDescription,
      content: this.props.content,
      blogId: this.props.blogId,

      blogName: this.props.blogName,
    };
  }
}

// ? class PostEntity -> updatePost() - бизнес-логика уровня домена, а не просто patch-update в репозитории. ( Domain - Entity ).
// ? - Используется, когда ты получаешь PostEntity из, например, Mongo.
// ? - Ты получаешь plain object, а хочешь — полноценный экземпляр класса с методами.
// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
