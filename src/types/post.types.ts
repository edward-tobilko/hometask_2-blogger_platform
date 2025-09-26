export type PostTypeModel = {
  id: string | number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

export type PostInputDtoTypeModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
