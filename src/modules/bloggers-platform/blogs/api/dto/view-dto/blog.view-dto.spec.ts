import { Types } from 'mongoose';

import { BlogViewModel } from './blog.view-dto';

// * Юнит-тест — тестирует одну функцию/класс изолированно, без базы данных и HTTP.
// * Структура каждого теста: Arrange (подготовка) → Act (действие) → Assert (проверка).
describe('BlogViewModel.mapToViewModel', () => {
  // * Arrange: создаём фейковый документ блога (имитирует то, что вернула бы база данных)
  const mockBlogDocument = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Blog',
    description: 'Test description',
    websiteUrl: 'https://test.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    isMembership: false,
  };

  it('should map all fields correctly', () => {
    // * Act: вызываем функцию которую тестируем
    const result = BlogViewModel.mapToViewModel(mockBlogDocument as any);

    // * Assert: проверяем что каждое поле смаплено правильно
    expect(result.id).toBe('507f1f77bcf86cd799439011');    // _id → id (строка)
    expect(result.name).toBe('Test Blog');
    expect(result.description).toBe('Test description');
    expect(result.websiteUrl).toBe('https://test.com');
    expect(result.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(result.isMembership).toBe(false);
  });

  it('should return instance of BlogViewModel', () => {
    const result = BlogViewModel.mapToViewModel(mockBlogDocument as any);

    // * Проверяем что вернулся именно экземпляр класса BlogViewModel, а не просто объект
    expect(result).toBeInstanceOf(BlogViewModel);
  });

  it('should convert _id ObjectId to string', () => {
    const result = BlogViewModel.mapToViewModel(mockBlogDocument as any);

    // * _id в Mongoose — это объект Types.ObjectId, а не строка.
    // * mapToViewModel должен вызвать .toString() чтобы вернуть строку.
    expect(typeof result.id).toBe('string');
  });
});
