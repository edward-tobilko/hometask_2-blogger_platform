// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';

// import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
// import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
// import {
//   Post,
//   PostLean,
//   PostModel,
// } from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
// import {
//   Blog,
//   BlogLean,
//   BlogModelType,
// } from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
// import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
// import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
// import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
// import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
// import { LikeStatus } from 'src/core/enums/like-status.enum';
// import { BlogSubscriptionLean } from '../../../domain/entities/blog-subscription.entity';
// import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';
// import { SortDirections } from 'src/core/enums/sort-directions.enum';

// type BlogAggregated = BlogLean & {
//   subscribersCount: number;
//   currentUserSubscription: BlogSubscriptionLean[];
// };

// @Injectable()
// export class BlogsQueryRepository {
//   constructor(
//     @InjectModel(Blog.name)
//     private readonly blogModel: BlogModelType,

//     @InjectModel(Post.name) private readonly postModel: PostModel,
//   ) {}

//   async findBlogs(
//     queryParam: BlogsQueryDto,
//     userId?: string,
//   ): Promise<BlogListPaginatedViewModel> {
//     const { searchNameTerm, pageNumber, pageSize } = queryParam;

//     const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

//     const filter = nameTerm
//       ? {
//           name: { $regex: nameTerm, $options: 'i' },
//         }
//       : {};

//     const [items, totalCount] = await Promise.all([
//       // * Вариант 1 (упрощенный)
//       // this.blogModel
//       //   .find(filter)
//       //   .sort(queryParam.calculateSort())
//       //   .skip(queryParam.calculateSkip())
//       //   .limit(pageSize)
//       //   .lean<BlogLean[]>()
//       //   .exec(), // превращает Mongoose Query в Promise.

//       // * Вариант 2 (MongoDB aggregation $lookup — один запрос, который джойнит коллекцию blog-subscriptions прямо в Mongoose)
//       // Используем Aggregation pipeline вместо .find() — это конвейер, каждый $stage получает результат предыдущего и передаёт следующему: $match → $sort → $skip → $limit → $lookup → $addFields.
//       this.blogModel.aggregate<BlogAggregated>([
//         { $match: filter }, // фильтрует блоги по имени (то же что раньше find(filter))
//         {
//           $sort: {
//             [queryParam.sortBy]:
//               queryParam.sortDirection === SortDirections.ASC ? 1 : -1,
//           },
//         },
//         { $skip: queryParam.calculateSkip() },
//         { $limit: pageSize },

//         {
//           // $lookup - это LEFT JOIN из SQL: кладёт все подписки блога в массив subscriptions
//           $lookup: {
//             from: 'blog-subscription', // название коллекции
//             localField: '_id', // поле в Blog (ObjectId)
//             foreignField: 'blogId', // поле в BlogSubscription (ObjectId)
//             as: 'subscriptions',
//           },
//         },

//         {
//           // $addFields - добавляет вычисляемые поля
//           $addFields: {
//             subscribersCount: { $size: '$subscriptions' }, // длина массива subscriptions (количество подписчиков)
//             currentUserSubscription: userId // фильтрует subscriptions чтобы найти подписку текущего юзераx
//               ? {
//                   // $filter - подписка конкретного юзера (или пустой массив если не авторизован): ищет элемент где sub.userId === userId
//                   $filter: {
//                     input: '$subscriptions',
//                     as: 'sub',
//                     cond: {
//                       $eq: ['$$sub.userId', userId],
//                     },
//                   },
//                 }
//               : [],
//           },
//         },
//       ]),

//       this.blogModel.countDocuments(filter),
//     ]);

//     return BlogListPaginatedViewModel.mapToView({
//       pagesCount: Math.ceil(totalCount / pageSize),
//       page: pageNumber,
//       pageSize,
//       totalCount,

//       items: items.map((blog) => {
//         const isSubscribed = blog.currentUserSubscription.length > 0;

//         let status: SubscriptionStatus;

//         if (!userId) {
//           status = SubscriptionStatus.None;
//         } else if (isSubscribed) {
//           status = SubscriptionStatus.Subscribed;
//         } else {
//           status = SubscriptionStatus.Unsubscribed;
//         }

//         return BlogViewModel.mapToViewModel(
//           blog,
//           blog.subscribersCount,
//           status,
//         );
//       }),
//     });
//   }

//   async findBlogById(
//     blogId: string,
//     userId?: string,
//   ): Promise<BlogViewModel | null> {
//     // * Вариант 1 (упрощенный)
//     // const blogLean = await this.blogModel
//     //   .findById(blogId)
//     //   .lean<BlogLean>()
//     //   .exec();

//     // * Вариант 2 (MongoDB aggregation $lookup — один запрос, который джойнит коллекцию blog-subscriptions прямо в Mongoose)
//     const [blog] = await this.blogModel.aggregate<BlogAggregated>([
//       { $match: { _id: new Types.ObjectId(blogId) } },
//       {
//         $lookup: {
//           from: 'blog-subscription',
//           localField: '_id',
//           foreignField: 'blogId',
//           as: 'subscriptions',
//         },
//       },
//       {
//         $addFields: {
//           subscribersCount: { $size: '$subscriptions' },
//           currentUserSubscription: userId
//             ? {
//                 $filter: {
//                   input: '$subscriptions',
//                   as: 'sub',
//                   cond: { $eq: ['$$sub.userId', userId] },
//                 },
//               }
//             : [],
//         },
//       },
//     ]);

//     if (!blog) return null;

//     const isSubscribed = blog.currentUserSubscription.length > 0;

//     let status: SubscriptionStatus;

//     if (!userId) {
//       status = SubscriptionStatus.None;
//     } else if (isSubscribed) {
//       status = SubscriptionStatus.Subscribed;
//     } else {
//       status = SubscriptionStatus.Unsubscribed;
//     }

//     return BlogViewModel.mapToViewModel(blog, blog.subscribersCount, status);
//   }

//   async findPostsForBlog(
//     blogId: string,
//     query: PostsQueryDto,
//     userId?: string,
//   ): Promise<PostsPaginatedViewModel> {
//     const { pageNumber, pageSize } = query;

//     // * фильтруем (получаем) все посты этого блога
//     const filter = { blogId: new Types.ObjectId(blogId) };

//     const [items, totalCount] = await Promise.all([
//       this.postModel
//         .find(filter)
//         .sort(query.calculateSort())
//         .skip(query.calculateSkip())
//         .limit(pageSize)
//         .lean<PostLean[]>()
//         .exec(), // превращает Mongoose Query в Promise.

//       this.postModel.countDocuments(filter),
//     ]);

//     return PostsPaginatedViewModel.mapToView({
//       pagesCount: Math.ceil(totalCount / pageSize),
//       page: pageNumber,
//       pageSize,
//       totalCount,

//       items: items.map((post) => {
//         const myStatus = userId
//           ? (post.extendedLikesInfo?.userReactions?.find(
//               (reaction) => reaction.userId === userId,
//             )?.status ?? LikeStatus.None)
//           : LikeStatus.None;

//         return PostViewModel.mapToViewModel(post, myStatus ?? LikeStatus.None);
//       }),
//     });
//   }

//   async countPostsForBlog(blogId: string): Promise<number> {
//     return this.postModel.countDocuments({
//       blogId: new Types.ObjectId(blogId),
//     });
//   }
// }

// // ? @InjectModel(Blog.name) — специальный декоратор от `@nestjs/mongoose`, который говорит Nest: "вколи сюда модель, зарегистрированную под именем `Blog.name`. Без этого декоратора Nest не знает, какую именно модель ты хочешь.
