export type BloggerTypeModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

export type PostTypeModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};
