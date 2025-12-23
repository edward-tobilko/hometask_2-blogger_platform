export type CreatePostForBlogDtoCommand = {
  title: string;
  shortDescription: string;
  content: string;

  blogId: string; // adding from query params
};

// ? dto (Data Transfer Object) - то, что присылает клиент.
