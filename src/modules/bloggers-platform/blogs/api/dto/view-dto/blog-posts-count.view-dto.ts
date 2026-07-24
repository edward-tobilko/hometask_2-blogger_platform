export class BlogPostsCountViewModel {
  postsCount!: number;

  static mapToViewModel(count: number): BlogPostsCountViewModel {
    const dto = new BlogPostsCountViewModel();

    dto.postsCount = count;

    return dto;
  }
}
