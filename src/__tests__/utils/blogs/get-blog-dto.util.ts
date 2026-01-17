import { CreateBlogRP } from "blogs/routes/request-payload-types/create-blog.request-payload-type";

export function getBlogDtoUtil(): CreateBlogRP {
  return {
    name: "Sam",
    description:
      "A curated list of tools and best practices for modern back-end engineers.",
    websiteUrl: "https://back-end.org",
  };
}
