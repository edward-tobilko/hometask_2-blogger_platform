import { BlogInputDtoModel } from "../../../blogs/types/blog.types";

export function getBlogDtoUtil(): BlogInputDtoModel {
  return {
    name: "random name",
    description: "random description",
    websiteUrl: "https://random-example.com",
  };
}
