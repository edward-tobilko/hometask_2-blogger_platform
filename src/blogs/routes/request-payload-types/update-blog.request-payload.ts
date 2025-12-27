import { CreateBlogRP } from "./create-blog.request-payload-type";

export type UpdateBlogRP = CreateBlogRP;

// ? если будет patch method - type UpdateBlogRP = Partial<CreateBlogRP>;
