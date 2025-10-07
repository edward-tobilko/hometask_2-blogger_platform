import { WithId } from "mongodb";

import { BlogDb, BlogView } from "../../types/blog.types";

export function mapToBlogViewModelUtil(blogDb: WithId<BlogDb>): BlogView {
  return {
    id: blogDb._id.toString(),
    name: blogDb.name,
    description: blogDb.description,
    websiteUrl: blogDb.websiteUrl,
    createdAt: blogDb.createdAt.toISOString(),
    isMembership: blogDb.isMembership,
  };
}
