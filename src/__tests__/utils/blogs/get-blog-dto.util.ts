import { BlogInputDto } from "../../../blogs/types/blog.types";

export function getBlogDtoUtil(): BlogInputDto {
  return {
    name: "name",
    description: "description",
    websiteUrl: "https://example.com",
  };
}
