import { BlogDtoDomain } from "../../../blogs/domain/blog-dto.domain";

export function getBlogDtoUtil(): BlogDtoDomain {
  return {
    name: "random name",
    description: "random description",
    websiteUrl: "https://random-example.com",
  };
}
