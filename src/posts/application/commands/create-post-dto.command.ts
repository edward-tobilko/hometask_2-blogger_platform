export type CreatePostDtoCommand = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

// ? dto (Data Transfer Object) - то, что присылает клиент.
