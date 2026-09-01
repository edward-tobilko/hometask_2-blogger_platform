import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { CommentOrmEntity } from 'src/modules/bloggers-platform/comments/infrastructure/sql/schemas/comment-orm.entity';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsQueryRepo: Repository<PostOrmEntity>,

    // TODO: extract to CommentsExternalQueryRepository
    @InjectRepository(CommentOrmEntity)
    private readonly commentsQueryRepo: Repository<CommentOrmEntity>,
  ) {}

  async findAll(
    query: PostsQueryDto,
    userId?: string,
  ): Promise<PostsPaginatedViewModel> {
    const [items, totalCount] = await this.postsQueryRepo.findAndCount({
      order: query.calculateSort(),
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    return PostsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,

      items: items.map((post) => {
        // const myStatus = userId
        //   ? (post.extendedLikesInfo?.userReactions?.find(
        //       (reaction) => reaction.userId === userId,
        //     )?.status ?? LikeStatus.None)
        //   : LikeStatus.None;

        // return PostViewModel.mapToViewModel(post, myStatus ?? LikeStatus.None);
        return PostViewModel.mapToViewModel(post);
      }),
    });
  }

  async findById(id: string, userId?: string): Promise<PostViewModel | null> {
    const existingPost = await this.postsQueryRepo.findOneBy({ id });

    if (!existingPost) return null;

    // const myStatus = userId
    //   ? await this.findUserCurrentLikeStatus(userId, id)
    //   : LikeStatus.None;

    const postOutput = PostViewModel.mapToViewModel(
      existingPost,
      //   myStatus ?? LikeStatus.None,
    );

    return postOutput;
  }

  async findCommentsByPostId(
    postId: string,
    query: PostsQueryDto,
    userId?: string,
  ): Promise<CommentsPaginatedViewModel> {
    const [items, totalCount] = await this.commentsQueryRepo.findAndCount({
      where: { postId, isBanned: false },
      order: query.calculateSort(),
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    return CommentsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,

      items: items.map((comment) => {
        return CommentViewModel.mapToViewModel(comment, LikeStatus.None);
      }),
    });
  }

  //   async findUserCurrentLikeStatus(
  //     userId: string,
  //     postId: string,
  //   ): Promise<LikeStatus | null> {
  //     const postInstance = await this.postsQueryRepo.findOne({
  //       where: { id: postId },
  //     });

  //     const userLikeStatus =
  //       postInstance?.extendedLikesInfo?.userReactions?.find(
  //         (reaction) => reaction.userId === userId,
  //       )?.status ?? LikeStatus.None;

  //     return userLikeStatus;
  //   }
}
