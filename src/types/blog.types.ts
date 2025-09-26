type BlogTypeModel = {
  id: string | number;
  name: string;
  description: string;
  websiteUrl: string;
};

type BloggerInputDtoTypeModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export { BlogTypeModel, BloggerInputDtoTypeModel };
