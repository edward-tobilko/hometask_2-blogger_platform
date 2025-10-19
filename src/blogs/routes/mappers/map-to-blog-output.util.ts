import { WithId } from "mongodb";

import { BlogDbDocument, BlogViewModel } from "../../types/blog.types";

export const mapToBlogOutputUtil = (
  blogDb: WithId<BlogDbDocument>
): BlogViewModel => {
  return {
    id: blogDb._id.toString(),
    name: blogDb.name,
    description: blogDb.description,
    websiteUrl: blogDb.websiteUrl,
    createdAt: blogDb.createdAt.toISOString(),
    isMembership: blogDb.isMembership,
  };
};
