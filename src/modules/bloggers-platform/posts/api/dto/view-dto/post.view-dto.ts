import { ApiProperty } from '@nestjs/swagger';

import { LikeStatus } from 'src/core/enums/like-status.enum';

interface PostViewFields {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string | null;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
}

export class NewestLikeViewModel {
  @ApiProperty()
  addedAt!: Date;

  @ApiProperty({ nullable: true })
  userId!: string;

  @ApiProperty({ nullable: true })
  login!: string;
}

export class ExtendedLikesInfoViewModel {
  @ApiProperty({ description: 'Total likes for parent item' })
  likesCount!: number;

  @ApiProperty({ description: 'Total dislikes for parent item' })
  dislikesCount!: number;

  @ApiProperty({
    enum: LikeStatus,
    description: 'Send None if you want to unlike/undislike',
  })
  myStatus!: LikeStatus;

  @ApiProperty({
    type: [NewestLikeViewModel],
    nullable: true,
    description: 'Last 3 likes (status "Like")',
  })
  newestLikes!: NewestLikeViewModel[];
}

export class PostViewModel {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() shortDescription!: string;
  @ApiProperty() content!: string;
  @ApiProperty() blogId!: string;
  @ApiProperty() blogName!: string | null;
  @ApiProperty() createdAt!: Date;

  @ApiProperty({
    type: ExtendedLikesInfoViewModel,
  })
  extendedLikesInfo!: ExtendedLikesInfoViewModel;

  static mapToViewModel(
    post: PostViewFields,
    myStatus: LikeStatus = LikeStatus.None,
    newestLikes: NewestLikeViewModel[] = [],
  ): PostViewModel {
    const dto = new PostViewModel();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus,

      newestLikes: newestLikes.map((newestLike) => ({
        addedAt: newestLike.addedAt,
        userId: newestLike.userId,
        login: newestLike.login,
      })),
    };

    return dto;
  }
}
