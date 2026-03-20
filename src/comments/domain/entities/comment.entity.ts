import { ValidationError } from "@core/errors/application.error";
import { UpdateCommentDtoEntity } from "../value-objects/update-comment-dto.entity";

export class CommentEntity {
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
  }): CommentEntity {
    return new CommentEntity(props);
  }

  updateComment(dto: UpdateCommentDtoEntity) {
    CommentEntity.validateContent(dto.content);

    this.content = dto.content;
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
