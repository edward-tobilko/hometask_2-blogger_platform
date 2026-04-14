import { BlogDocument } from '../domain/blog.entity';

export class BlogViewModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
  ) {}

  static mapToViewModel(blog: BlogDocument): BlogViewModel {
    return new BlogViewModel(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.isMembership,
    );
  }
}
