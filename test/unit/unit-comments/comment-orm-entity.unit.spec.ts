import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentOrmEntity } from 'src/modules/bloggers-platform/comments/infrastructure/sql/schemas/comment-orm.entity';

describe('CommentOrmEntity.assertOwnedBy', () => {
  const authorId = '4ecae147-54f7-4f69-8c54-c3fb52dc30da';
  const anotherUserId = '47acea1a-e395-4e42-97d4-1b2c3d4e5f60';

  // * Arrange: свежий комментарий автора перед каждым тестом.
  let comment: CommentOrmEntity;

  beforeEach(() => {
    comment = CommentOrmEntity.create(
      'b3a1c2d4-0000-4000-8000-000000000001',
      'This content includes 30 characters',
      authorId,
      'linda',
    );
  });

  it('should not throw if user is the author', () => {
    // * Act + Assert: автор проходит проверку.
    expect(() => comment.assertOwnedBy(authorId)).not.toThrow();
  });

  it('should throw DomainException with Forbidden code if user is not the author', () => {
    let error: unknown;

    try {
      comment.assertOwnedBy(anotherUserId);
    } catch (e) {
      error = e;
    }

    // * Проверяем тип и код — именно код фильтр превращает в HTTP 403.
    expect(error).toBeInstanceOf(DomainException);
    expect((error as DomainException).code).toBe(DomainExceptionCode.Forbidden);
  });
});
