import { BlogDtoDomain } from "../../../blogs/domain/blog-dto.domain";

export function getBlogDtoUtil(): BlogDtoDomain {
  return {
    name: "Sam",
    description:
      "A curated list of tools and best practices for modern back-end engineers.",
    websiteUrl: "https://back-end.org",
  };
}
