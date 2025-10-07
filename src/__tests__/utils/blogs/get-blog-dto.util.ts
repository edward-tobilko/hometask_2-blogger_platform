import { BlogInputDto } from "../../../blogs/types/blog.types";

export function getBlogDtoUtil(): BlogInputDto {
  return {
    name: "random name",
    description: "random description",
    websiteUrl: "https://example.com",
  };
}
