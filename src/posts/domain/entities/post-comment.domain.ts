import { CreatePostCommentDtoEntity } from "../value-objects/create-post-comment-dto.entity";
import { UpdateCommentDtoEntity } from "../../../comments/domain/value-objects/update-comment-dto.entity";
import { PostCommentsDocument } from "posts/infrastructure/mongoose/post-comments.schema";

export class PostCommentEntity {
  // * Храним ссылку на Mongoose документ (НЕ дублируем поля!)
  private constructor(private readonly document: PostCommentsDocument) {}

  // * ФАБРИЧНЫЕ МЕТОДЫ (как создать entity)
  static reconstituteFromDocument(
    doc: PostCommentsDocument
  ): PostCommentEntity {
    return new PostCommentEntity(doc);
  }

  static createCommentForPost(
    dto: CreatePostCommentDtoEntity
  ): PostCommentEntity {
    const document = {
      content: dto.content,
      postId: dto.postId,

      commentatorInfo: {
        userId: dto.commentatorInfo.userId,
        userLogin: dto.commentatorInfo.userLogin,
      },

      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    } as PostCommentsDocument;

    return new PostCommentEntity(document);
  }

  // * БИЗНЕС-ЛОГИКА (методы домена)
  updateComment(dto: UpdateCommentDtoEntity) {
    this.document.content = dto.content;
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
