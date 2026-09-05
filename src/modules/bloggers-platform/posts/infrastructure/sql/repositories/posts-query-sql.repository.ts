import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { PostLikeOrmEntity } from '../schemas/post-like-orm.entity';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsQueryRepo: Repository<PostOrmEntity>,

    @InjectRepository(PostLikeOrmEntity)
    private readonly postLikesQueryRepo: Repository<PostLikeOrmEntity>,
  ) {}

  async findAll(
    query: PostsQueryDto,
    userId?: string,
    blogId?: string,
  ): Promise<PostsPaginatedViewModel> {
    const [items, totalCount] = await this.postsQueryRepo.findAndCount({
      where: blogId ? { blogId } : {}, // параметр для делегирования (без дублирования) метода в BlogsQuerySqlRepository
      order: query.calculateSort(),
      skip: query.calculateSkip(),
      take: query.pageSize, // default 10 posts
    });

    // * Batch-load likes for the current page to avoid N+1.
    const likesMap = new Map<string, LikeStatus>(); // строим Map для быстрого поиска

    const postIds = items.map((post) => post.id); // in-memory processing

    if (userId && items.length > 0) {
      // один запрос за всеми лайками текущего юзера
      const userLikes = await this.postLikesQueryRepo.findBy({
        postId: In(postIds),
        userId,
      });

      for (const like of userLikes) {
        likesMap.set(like.postId, like.status); // 1 запрос вместо N — достаём все лайки текущего юзера на посты этой страницы
      }
    }

    const newestLikesMap = await this.findNewestLikesBatchLoad(postIds);

    return PostsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,

      // * Маппим посты синхронно, никаких async / await — всё уже в памяти!
      items: items.map((post) => {
        const myStatus = likesMap.get(post.id) ?? LikeStatus.None;
        const newestLikes = newestLikesMap.get(post.id) ?? [];

        return PostViewModel.mapToViewModel(post, myStatus, newestLikes);
      }),
    });
  }

  async findById(id: string, userId?: string): Promise<PostViewModel | null> {
    const existingPost = await this.postsQueryRepo.findOneBy({ id });

    if (!existingPost) return null;

    const myStatus = userId
      ? await this.findUserCurrentLikeStatus(userId, id)
      : LikeStatus.None;

    const newestLikes = await this.findNewestLikes(id);

    const postOutput = PostViewModel.mapToViewModel(
      existingPost,
      myStatus ?? LikeStatus.None,
      newestLikes,
    );

    return postOutput;
  }

  async findUserCurrentLikeStatus(
    userId: string,
    postId: string,
  ): Promise<LikeStatus | null> {
    const postInstance = await this.postLikesQueryRepo.findOne({
      where: { postId, userId },
    });

    return postInstance?.status ?? LikeStatus.None;
  }

  async findNewestLikes(postId: string): Promise<PostLikeOrmEntity[]> {
    return this.postLikesQueryRepo.find({
      where: { postId, status: LikeStatus.Like },
      relations: { user: true }, // @ManyToOne -> что бы вытащить login
      order: { addedAt: 'DESC' },
      take: 3,
    });
  }

  async findNewestLikesBatchLoad(
    postIds: string[],
  ): Promise<Map<string, PostLikeOrmEntity[]>> {
    const newestLikesMap = new Map<string, PostLikeOrmEntity[]>();

    const allLikes = await this.postLikesQueryRepo.find({
      where: { postId: In(postIds), status: LikeStatus.Like },
      relations: { user: true },
      order: { addedAt: 'DESC' },
    });

    for (const like of allLikes) {
      const existingPostLike = newestLikesMap.get(like.postId) ?? [];

      if (existingPostLike.length < 3) {
        existingPostLike.push(like);
        newestLikesMap.set(like.postId, existingPostLike);
      }
    }

    return newestLikesMap;
  }
}
