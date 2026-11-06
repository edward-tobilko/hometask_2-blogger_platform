import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import {
  PostsQueryDto,
  PostsSortBy,
} from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import {
  NewestLikeViewModel,
  PostViewModel,
} from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { PostLikeOrmEntity } from '../schemas/post-like-orm.entity';
import { UserAccountOrmEntity } from 'src/modules/user-accounts/infrastructure/sql/schemas/user-orm.entity';

interface PostAndPostLikeQBRaw {
  p_id: string;
  p_title: string;
  p_short_description: string;
  p_content: string;
  p_blog_id: string;
  p_created_at: Date;
  p_likes_count: number;
  p_dislikes_count: number;

  b_name: string;

  pl_status: LikeStatus | null;
}

interface NewestLikeRaw {
  post_id: string;
  user_id: string;
  added_at: Date;
  login: string;

  row_number: string; // PostgreSQL возвращает bigint как string
}

// * API sortBy -> колонка в QueryBuilder. blogName живёт в таблице blogs (b), остальное — в posts (p).
const POSTS_SORT_COLUMNS: Record<PostsSortBy, string> = {
  [PostsSortBy.CreatedAt]: 'p.createdAt',
  [PostsSortBy.Title]: 'p.title',
  [PostsSortBy.ShortDescription]: 'p.shortDescription',
  [PostsSortBy.Content]: 'p.content',
  [PostsSortBy.BlogName]: 'b.name',
};

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsQueryRepo: Repository<PostOrmEntity>,

    @InjectRepository(PostLikeOrmEntity)
    private readonly postLikesQueryRepo: Repository<PostLikeOrmEntity>,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  static mapRawToViewModel(
    raw: PostAndPostLikeQBRaw,
    newestLikes: NewestLikeRaw[] = [],
  ): PostViewModel {
    const dto = new PostViewModel();

    dto.id = raw.p_id;
    dto.title = raw.p_title;
    dto.shortDescription = raw.p_short_description;
    dto.content = raw.p_content;
    dto.blogId = raw.p_blog_id;
    dto.blogName = raw.b_name;
    dto.createdAt = raw.p_created_at;

    dto.extendedLikesInfo = {
      likesCount: raw.p_likes_count,
      dislikesCount: raw.p_dislikes_count,
      myStatus: raw.pl_status ?? LikeStatus.None,

      newestLikes: newestLikes.map((newestLike) => ({
        addedAt: newestLike.added_at,
        userId: newestLike.user_id,
        login: newestLike.login,
      })),
    };

    return dto;
  }

  async findAll(
    query: PostsQueryDto,
    userId?: string,
    blogId?: string,
  ): Promise<PostsPaginatedViewModel> {
    const postsQb = this.postsQueryRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.blog', 'b'); // актуальное имя блога -> post.blog.name

    // * Фильтр только для GET /blogs/:blogId/posts; для GET /posts — все посты.
    if (blogId) {
      postsQb.where('p.blogId = :blogId', { blogId });
    }

    const [items, totalCount] = await postsQb
      .orderBy(
        POSTS_SORT_COLUMNS[query.sortBy],
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip(query.calculateSkip())
      .take(query.pageSize) // default 10 posts
      .getManyAndCount();

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

    const newestLikesRaw = await this.dataSource.query<NewestLikeRaw[]>(
      `
        WITH newestLikesBatchLoad AS (
          SELECT pl.post_id, pl.user_id, pl.added_at, u.login,
          ROW_NUMBER() OVER (PARTITION BY pl.post_id ORDER BY pl.added_at DESC) as "row_number"
          FROM post_likes pl
          JOIN user_accounts u ON u.id = pl.user_id
          WHERE pl.post_id = ANY($1::uuid[]) AND pl.status = 'Like'
        )
          
        SELECT * FROM newestLikesBatchLoad WHERE row_number <= 3;
      `,
      [postIds], // $1
    );

    const newestLikesMap = new Map<string, NewestLikeRaw[]>();

    // * Групируем плоский массив в Map
    for (const likeRow of newestLikesRaw) {
      const existingPostLike = newestLikesMap.get(likeRow.post_id) ?? [];

      existingPostLike.push(likeRow);
      newestLikesMap.set(likeRow.post_id, existingPostLike);
    }

    return PostsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,

      // * Маппим посты синхронно, никаких async / await — всё уже в памяти!
      items: items.map((post) => {
        const myStatus = likesMap.get(post.id) ?? LikeStatus.None;

        const newestLikes: NewestLikeViewModel[] =
          newestLikesMap.get(post.id)?.map((newestLikeRow) => ({
            addedAt: newestLikeRow.added_at,
            userId: newestLikeRow.user_id,
            login: newestLikeRow.login,
          })) ?? [];

        return PostViewModel.mapToViewModel(
          { ...post, blogName: post.blog.name }, // имя из JOIN, а не из старой колонки blog_name
          myStatus,
          newestLikes,
        );
      }),
    });
  }

  async findById(id: string, userId?: string): Promise<PostViewModel | null> {
    const builderForPosts = this.postsQueryRepo
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.blogId',
        'p.createdAt',
      ])
      .innerJoin('p.blog', 'b')
      .addSelect('b.name')
      .addSelect(['p.likesCount', 'p.dislikesCount'])
      .leftJoin(
        PostLikeOrmEntity,
        'pl',
        'pl.post_id = p.id AND pl.user_id = :userId',
        { userId: userId ?? null },
      )
      .addSelect(['pl.status'])
      .where('p.id = :id', { id });

    const builderForNewestLikes = this.postLikesQueryRepo
      .createQueryBuilder('pl')
      .select('"pl"."user_id"', 'user_id')
      .addSelect('"pl"."added_at"', 'added_at')
      .addSelect('"u"."login"', 'login')
      .leftJoin(UserAccountOrmEntity, 'u', 'u.id = pl.user_id') // кастомное ON-условие
      .where('pl.post_id = :id', { id })
      .andWhere('pl.status = :status', { status: LikeStatus.Like })
      .orderBy('pl.added_at', 'DESC')
      // .take(3); // only for getMany / getManyAndCount (entity)
      .limit(3); // for getRawMany

    const postsRow = await builderForPosts.getRawOne<PostAndPostLikeQBRaw>();
    const newestLikesRow =
      await builderForNewestLikes.getRawMany<NewestLikeRaw>();

    if (!postsRow) return null;

    return PostsQuerySqlRepository.mapRawToViewModel(postsRow, newestLikesRow);
  }

  // * Extra methods over the basic API
  async countByBlogId(blogId: string): Promise<number> {
    return this.postsQueryRepo.count({
      where: { blogId },
    });
  }
}
