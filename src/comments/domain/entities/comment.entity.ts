import { ValidationError } from "@core/errors/application.error";
import { UpdateCommentDtoEntity } from "../value-objects/update-comment-dto.entity";

export class CommentEntity {
  content: string;

  constructor(public props: { content: string }) {
    this.content = props.content;
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
  static reconstitute(props: { content: string }): CommentEntity {
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
