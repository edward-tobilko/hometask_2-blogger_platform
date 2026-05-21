import { ApiProperty } from '@nestjs/swagger';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostDocument, PostLean } from '../../../domain/entities/post.entity';

// * Создаем отдельные классы во избежания вложенности аннонимных обьектов в аннонимных обьектах (это нужно если мы исп. swagger doc, так как он не умеет обрабатывать вложенные анонимные типы):

// ! newestLikes: Array<{ ← анонимный объект внутри анонимного объекта
// ! addedAt: string;
// ! userId: string;
// ! login: string;
// ! }>

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
  @ApiProperty() blogName!: string;
  @ApiProperty() createdAt!: Date;

  @ApiProperty({
    type: ExtendedLikesInfoViewModel,
  })
  extendedLikesInfo!: ExtendedLikesInfoViewModel;

  static mapToViewModel(
    post: PostDocument | PostLean,
    myStatus: LikeStatus = LikeStatus.None,
  ): PostViewModel {
    const dto = new PostViewModel();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt; // отдаем ту дату, которая в entity

    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus,

      newestLikes: post.extendedLikesInfo.newestLikes.map((like) => ({
        addedAt: like.addedAt,
        userId: like.userId.toString(),
        login: like.login,
      })),
    };

    return dto;
  }
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
