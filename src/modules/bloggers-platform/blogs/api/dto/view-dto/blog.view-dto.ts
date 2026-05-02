import { BlogDocument, BlogLean } from '../../../domain/entities/blog.entity';

export class BlogViewModel {
  id!: string;
  name!: string;
  description!: string;
  websiteUrl!: string;
  createdAt!: Date;
  isMembership!: boolean;

  static mapToViewModel(
    this: void,
    blog: BlogDocument | BlogLean,
  ): BlogViewModel {
    const dto = new BlogViewModel();

    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;

    return dto;
  }
}
