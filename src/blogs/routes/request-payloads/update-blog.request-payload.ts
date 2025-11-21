import { CreateBlogRequestPayload } from "./create-blog.request-payload";

export type UpdateBlogRequestPayload = CreateBlogRequestPayload;

// ? если будет patch method - type UpdateBlogRequestPayload = Partial<CreateBlogRequestPayload>;
