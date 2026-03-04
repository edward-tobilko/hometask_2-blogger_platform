import { LikeStatus } from "@core/types/like-status.enum";
import { CreatePostDtoEntity } from "../value-objects/create-post-dto.entity";
import { UpdatePostDtoEntity } from "../value-objects/update-post-dto.entity";
import { ValidationError } from "@core/errors/application.error";

export class PostEntity {
  private readonly _id: string | null;

  private _title: string;
  private _shortDescription: string;
  private _content: string;
  private readonly _blogId: string; // invariant: immutable (не изменяемый)

  private _blogName: string;
  private readonly _createdAt: Date;

  private _extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: [
      {
        addedAt: Date;
        userId: string;
        login: string;
      },
    ];
  };

  private constructor(props: {
    id: string | null;

    title: string;
    shortDescription: string;
    content: string;
    blogId: string;

    blogName: string;
    createdAt: Date;

    extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: LikeStatus;
      newestLikes: [
        {
          addedAt: Date;
          userId: string;
          login: string;
        },
      ];
    };
  }) {
    this._id = props.id;
    this._title = props.title;
    this._shortDescription = props.shortDescription;
    this._content = props.content;
    this._blogId = props.blogId;
    this._blogName = props.blogName;
    this._createdAt = props.createdAt;
    this._extendedLikesInfo = props.extendedLikesInfo;
  }

  // * Factory validation methods
  private static validateTitle(title: string) {
    if (!title || title.trim().length === 0)
      throw new ValidationError("Title is required", "title", 400);
    if (title.length > 30)
      throw new ValidationError(
        "Title must not exceed 30 characters",
        "title",
        400
      );
  }

  private static validateShortDescription(shortDescription: string) {
    if (!shortDescription || shortDescription.trim().length === 0)
      throw new ValidationError(
        "Short description is required",
        "description",
        400
      );
    if (shortDescription.length > 100)
      throw new ValidationError(
        "Short description must not exceed 100 characters",
        "description",
        400
      );
  }

  private static validateContent(content: string) {
    if (!content || content.trim().length === 0)
      throw new ValidationError("Content is required", "content", 400);
    if (content.length > 1000)
      throw new ValidationError(
        "Content must not exceed 1000 characters",
        "content",
        400
      );
  }

  // * Factory methods
  static reconstitute(props: {
    id: string;

    title: string;
    shortDescription: string;
    content: string;
    blogId: string;

    blogName: string;
    createdAt: Date;

    extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: LikeStatus;
      newestLikes: [
        {
          addedAt: Date;
          userId: string;
          login: string;
        },
      ];
    };
  }): PostEntity {
    return new PostEntity(props);
  }

  static createPost(dto: CreatePostDtoEntity): PostEntity {
    PostEntity.validateTitle(dto.title);
    PostEntity.validateShortDescription(dto.shortDescription);
    PostEntity.validateContent(dto.content);

    const newPost = new PostEntity({
      id: null, // Будет установлен при сохранении
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,

      blogName: dto.blogName,
      createdAt: new Date(),

      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            addedAt: new Date(),
            userId: "userId",
            login: "login",
          },
        ],
      },
    });

    return newPost;
  }

  async updatePost(dto: UpdatePostDtoEntity): Promise<void> {
    PostEntity.validateTitle(dto.title);
    PostEntity.validateShortDescription(dto.shortDescription);
    PostEntity.validateContent(dto.content);

    this._title = dto.title;
    this._shortDescription = dto.shortDescription;
    this._content = dto.content;
  }

  // * Getters
  get id(): string | null {
    return this._id;
  }
  get title(): string {
    return this._title;
  }
  get shortDescription(): string {
    return this._shortDescription;
  }
  get content(): string {
    return this._content;
  }
  get blogId(): string {
    return this._blogId;
  }
  get blogName(): string {
    return this._blogName;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get extendedLikesInfo() {
    return this._extendedLikesInfo;
  }
}

// ? class PostEntity -> updatePost() - бизнес-логика уровня домена, а не просто patch-update в репозитории = Domain - Entity.
// ? - Используется, когда получаешь PostEntity из, например, Mongo.
// ? - Получаешь plain object, а хочешь — полноценный экземпляр класса с методами.

// ? static - метод для создания сущности, когда экземпляра еще нет. ОН принадлежит не обьекту, а классу.
