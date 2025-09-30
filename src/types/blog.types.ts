type BlogTypeModel = {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
};

type BlogInputDtoTypeModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export { BlogTypeModel, BlogInputDtoTypeModel };
