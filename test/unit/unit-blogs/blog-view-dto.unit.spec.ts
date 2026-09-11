import { BlogOrmEntity } from 'src/modules/bloggers-platform/blogs/infrastructure/sql/schemas/blog-orm.entity';
import { BlogViewModel } from '../../../src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';

// * Unit-test — тестирует одну функцию / класс изолированно, без базы данных и HTTP. Структура каждого теста: Arrange (подготовка) -> Act (действие) -> Assert (проверка).

describe('BlogViewModel.mapToViewModel', () => {
  // * Arrange: создаём фейковый документ блога (имитирует то, что вернула бы база данных)
  const mockBlogInstance = {
    id: '1c9a1962-1b66-48ae-93a0-e0584bdf5cdc',
    name: 'Test Blog',
    description: 'Test description',
    websiteUrl: 'https://test.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    isMembership: false,
  } as BlogOrmEntity;

  it('should map all fields correctly', () => {
    // * Act: вызываем функцию которую тестируем
    const result = BlogViewModel.mapToViewModel(mockBlogInstance);

    // * Assert: проверяем что каждое поле смаплено правильно
    expect(result.id).toBe('1c9a1962-1b66-48ae-93a0-e0584bdf5cdc');
    expect(result.name).toBe('Test Blog');
    expect(result.description).toBe('Test description');
    expect(result.websiteUrl).toBe('https://test.com');
    expect(result.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(result.isMembership).toBe(false);
  });

  it('should return instance of BlogViewModel', () => {
    const result = BlogViewModel.mapToViewModel(mockBlogInstance);

    // * Проверяем что вернулся именно экземпляр класса BlogViewModel, а не просто объект
    expect(result).toBeInstanceOf(BlogViewModel);
  });
});

describe('BlogViewModel.extraLogicMapToViewModel', () => {
  const mockBlogInstance = {
    id: '1c9a1962-1b66-48ae-93a0-e0584bdf5cdc',
    name: 'Test Blog',
    description: 'Test description',
    websiteUrl: 'https://test.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    isMembership: false,
  } as BlogOrmEntity;

  it('should map subscribersCount and currentUserSubscriptionStatus', () => {
    const result = BlogViewModel.extraLogicMapToViewModel(
      mockBlogInstance,
      42,
      SubscriptionStatus.Subscribed,
    );

    expect(result.subscribersCount).toBe(42);
    expect(result.currentUserSubscriptionStatus).toBe(
      SubscriptionStatus.Subscribed,
    );
  });

  it('should map base fields correctly', () => {
    const result = BlogViewModel.extraLogicMapToViewModel(
      mockBlogInstance,
      0,
      SubscriptionStatus.None,
    );

    expect(result.id).toBe('1c9a1962-1b66-48ae-93a0-e0584bdf5cdc');
    expect(result.name).toBe('Test Blog');
    expect(result.subscribersCount).toBe(0);
    expect(result.currentUserSubscriptionStatus).toBe(SubscriptionStatus.None);
  });
});
