export enum PostSortFieldRP {
  CreatedAt = "createdAt",
  Title = "title",
  ShortDescription = "shortDescription",
  Content = "content",
  BlogName = "blogName",
}

export enum PostCommentsSortFieldRP {
  CreatedAt = "createdAt",

  Id = "id",
  Content = "content",
  CommentatorUserId = "commentatorInfo.userId",
  CommentatorUserLogin = "commentatorInfo.userLogin",
}
