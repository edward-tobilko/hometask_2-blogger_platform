export type PostTypeModel = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
};

export type PostInputDtoTypeModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
};
