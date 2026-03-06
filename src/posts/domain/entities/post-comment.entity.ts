import { CreatePostCommentDtoEntity } from "../value-objects/create-post-comment-dto.entity";
import { ValidationError } from "@core/errors/application.error";
import { Types } from "mongoose";

export class PostCommentEntity {
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

  constructor(
    public props: {
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
    }
  ) {
    this.id = props.id;
    this.content = props.content;
    this.postId = props.postId;
    this.commentatorInfo = props.commentatorInfo;
    this.createdAt = props.createdAt;
    this.likesInfo = props.likesInfo;
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
      id: new Types.ObjectId().toString(),
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
