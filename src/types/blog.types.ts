type BlogTypeModel = {
  id: string | number;
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
