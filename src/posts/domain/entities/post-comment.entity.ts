import { randomUUID } from "crypto";

import { CreatePostCommentDtoEntity } from "../value-objects/create-post-comment-dto.entity";
import { ValidationError } from "@core/errors/application.error";

type PostCommentsProps = {
  id: string;
  content: string;

  postId: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
};

export class PostCommentEntity {
  private constructor(private props: PostCommentsProps) {}

  // * Getters
  get id(): string {
    return this.props.id;
  }

  get content(): string {
    return this.props.content;
  }

  get postId(): string {
    return this.props.postId;
  }

  get commentatorInfo() {
    return this.props.commentatorInfo;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get likesInfo(): {
    likesCount: number;
    dislikesCount: number;
  } {
    return this.props.likesInfo;
  }

  // * Factory validation methods
  private static validateContent(content: string) {
    if (!content || content.trim().length === 0)
      throw new ValidationError("Content is required", "content", 400);
    if (content.length > 300)
      throw new ValidationError(
        "Content must not exceed 300 characters",
        "content",
        400
      );
  }

  // * Fabric methods
  static reconstitute(props: {
    id: string;
    content: string;

    postId: string;

    commentatorInfo: {
      userId: string;
      userLogin: string;
    };

    createdAt: Date;

    likesInfo: {
      likesCount: number;
      dislikesCount: number;
    };
  }): PostCommentEntity {
    return new PostCommentEntity(props);
  }

  static createCommentForPost(
    dto: CreatePostCommentDtoEntity
  ): PostCommentEntity {
    PostCommentEntity.validateContent(dto.content);

    return new PostCommentEntity({
      id: randomUUID(),
      content: dto.content,
      postId: dto.postId,

      commentatorInfo: {
        userId: dto.commentatorInfo.userId,
        userLogin: dto.commentatorInfo.userLogin,
      },

      createdAt: new Date(),

      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }
}

/*
 * Доменная сущность комментария

 * ✅ Что она делает:
 * - Хранит бизнес-правила (кто может редактировать, удалять)
 * - Вычисляет изменения лайков
 * - Валидирует данные
 
 * ❌ Что она НЕ делает:
 * - Не знает о базе данных (это задача Repository)
 * - Не делает HTTP запросы (это задача Controller)
 */
