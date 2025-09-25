type BloggerTypeModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

type BloggerInputDtoTypeModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export { BloggerTypeModel, BloggerInputDtoTypeModel };
