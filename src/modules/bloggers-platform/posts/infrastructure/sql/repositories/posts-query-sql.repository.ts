import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { PostLikeOrmEntity } from '../schemas/post-like-orm.entity';

interface PostAndPostLikeRaw {
  p_id: string;
  p_title: string;
  p_short_description: string;
  p_content: string;
  p_blog_id: string;
  p_created_at: Date;
  p_likes_count: number;
  p_dislikes_count: number;
  p_blog_name: string | null;

  pl_status: LikeStatus | null;
}

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsQueryRepo: Repository<PostOrmEntity>,

    @InjectRepository(PostLikeOrmEntity)
    private readonly postLikesQueryRepo: Repository<PostLikeOrmEntity>,
  ) {}

  static mapRawToViewModel(
    raw: PostAndPostLikeRaw,
    newestLikes: PostLikeOrmEntity[] = [],
  ): PostViewModel {
    const dto = new PostViewModel();

    dto.id = raw.p_id;
    dto.title = raw.p_title;
    dto.shortDescription = raw.p_short_description;
    dto.content = raw.p_content;
    dto.blogId = raw.p_blog_id;
    dto.blogName = raw.p_blog_name;
    dto.createdAt = raw.p_created_at;

    dto.extendedLikesInfo = {
      likesCount: raw.p_likes_count,
      dislikesCount: raw.p_dislikes_count,
      myStatus: raw.pl_status ?? LikeStatus.None,

      newestLikes: newestLikes.map((newestLike) => ({
        addedAt: newestLike.addedAt,
        userId: newestLike.userId,
        login: newestLike.user.login,
      })),
    };

    return dto;
  }

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

    // * Batch-load likes for the current page to avoid N+1 (быстрый поиск по ключу без повторных запросов к БД).
    const likesMap = new Map<string, LikeStatus>(); // строим Map для быстрого поиска

    const postIds = items.map((post) => post.id); // in-memory processing

    if (userId && items.length > 0) {
      // * Один запрос — все лайки текущего юзера для всех постов страницы
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
        const newestLikes = newestLikesMap.get(post.id) ?? []; // поиск по хешу

        return PostViewModel.mapToViewModel(post, myStatus, newestLikes);
      }),
    });
  }

  async findById(id: string, userId?: string): Promise<PostViewModel | null> {
    const builder = this.postsQueryRepo
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.blogId',
        'p.blogName',
        'p.createdAt',
      ])
      .addSelect(['p.likesCount', 'p.dislikesCount'])
      .leftJoin(
        PostLikeOrmEntity,
        'pl',
        'pl.post_id = p.id AND pl.user_id = :userId',
        { userId: userId ?? null },
      )
      .addSelect(['pl.status'])
      .where('p.id = :id', { id });

    const raw = await builder.getRawOne<PostAndPostLikeRaw>();

    if (!raw) return null;

    const newestLikes = await this.findNewestLikes(id);

    const [sql, params] = builder.getQueryAndParameters();
    console.log(sql, params);

    return PostsQuerySqlRepository.mapRawToViewModel(raw, newestLikes);
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
      relations: { user: true }, // snapshot: [{1},{2},{3}]
      order: { addedAt: 'DESC' },
      take: 3,
    });
  }

  async findNewestLikesBatchLoad(
    postIds: string[],
  ): Promise<Map<string, PostLikeOrmEntity[]>> {
    const newestLikesMap = new Map<string, PostLikeOrmEntity[]>();

    const allLikes = await this.postLikesQueryRepo.find({
      where: { postId: In(postIds), status: LikeStatus.Like }, // postId - скалярное значения, просто фильтрация, join не нужен
      relations: { user: true }, // @ManyToOne -> нужен login пользователя из другой таблицы
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
