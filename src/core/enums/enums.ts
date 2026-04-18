export enum SortDirections {
  ASC = 'asc', // ascending = (1)
  DESC = 'desc', // descending = (-1)
}

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export enum BlogSortFieldRP {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export enum UserSortFieldRP {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}
