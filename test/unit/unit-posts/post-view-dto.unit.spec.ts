import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostLikeOrmEntity } from 'src/modules/bloggers-platform/posts/infrastructure/sql/schemas/post-like-orm.entity';
import { PostOrmEntity } from 'src/modules/bloggers-platform/posts/infrastructure/sql/schemas/post-orm.entity';

describe('PostViewModel.mapToViewModel', () => {
  const mockPostInstance = {
    id: 'post-uuid-1234',
    title: 'Test title',
    shortDescription: 'Test short desc',
    content: 'Test content',
    blogId: 'blog-uuid-5678',
    blogName: 'Test Blog',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    likesCount: 3,
    dislikesCount: 1,
  } as PostOrmEntity;

  it('should map all basic fields correctly', () => {
    const result = PostViewModel.mapToViewModel(mockPostInstance);

    expect(result.id).toBe('post-uuid-1234');
    expect(result.title).toBe('Test title');
    expect(result.shortDescription).toBe('Test short desc');
    expect(result.content).toBe('Test content');
    expect(result.blogId).toBe('blog-uuid-5678');
    expect(result.blogName).toBe('Test Blog');
    expect(result.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('should default myStatus to LikeStatus.None when not provided', () => {
    const result = PostViewModel.mapToViewModel(mockPostInstance);

    expect(result.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should default newestLikes to empty array when not provided', () => {
    const result = PostViewModel.mapToViewModel(mockPostInstance);

    expect(result.extendedLikesInfo.newestLikes).toEqual([]);
  });

  it('should map likesCount and dislikesCount from post entity', () => {
    const result = PostViewModel.mapToViewModel(mockPostInstance);

    expect(result.extendedLikesInfo.likesCount).toBe(3);
    expect(result.extendedLikesInfo.dislikesCount).toBe(1);
  });

  it('should pass custom myStatus', () => {
    const result = PostViewModel.mapToViewModel(
      mockPostInstance,
      LikeStatus.Like,
    );

    expect(result.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
  });

  it('should map newestLikes with "user.login"', () => {
    const mockLikeInstance = {
      addedAt: new Date('2024-02-01T00:00:00.000Z'),
      userId: 'user-uuid-111',
      user: { login: 'john' },
    } as PostLikeOrmEntity;

    const result = PostViewModel.mapToViewModel(
      mockPostInstance,
      LikeStatus.None,
      [mockLikeInstance],
    );

    expect(result.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(result.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: new Date('2024-02-01T00:00:00.000Z'),
      userId: 'user-uuid-111',
      login: 'john',
    });
  });

  it('should return instance of PostViewModel', () => {
    const result = PostViewModel.mapToViewModel(mockPostInstance);

    expect(result).toBeInstanceOf(PostViewModel);
  });
});
