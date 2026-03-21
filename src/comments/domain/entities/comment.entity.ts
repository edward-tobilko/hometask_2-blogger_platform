import {
  ForbiddenError,
  ValidationError,
} from "@core/errors/application.error";

type CommentProps = {
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

export class CommentEntity {
  private constructor(private props: CommentProps) {}

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

  get likesInfo() {
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
  }): CommentEntity {
    return new CommentEntity(props);
  }

  // * Fabric methods
  updateComment(content: string) {
    CommentEntity.validateContent(content);

    this.props.content = content;
  }

  canBeDeletedBy(userId: string): void {
    if (this.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        "You can't delete someone else's comment",
        "userId"
      ); // 403
    }
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
