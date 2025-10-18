import { SortDirections } from "../../core/types/sort-directions.enum";

type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

type BlogDbDocument = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

type BlogInputDtoModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

type BlogPostInputDtoModel = {
  title: string;
  shortDescription: string;
  content: string;
};

type BlogsQueryInput = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};

export {
  BlogViewModel,
  BlogInputDtoModel,
  BlogPostInputDtoModel,
  BlogDbDocument,
  BlogsQueryInput,
};
