// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';

// import { LikeStatus } from 'src/core/enums/like-status.enum';
// import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
// import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
// import {
//   Comment,
//   CommentLean,
//   CommentModel,
// } from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
// import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
// import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
// import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
// import {
//   Post,
//   PostLean,
//   PostModel,
// } from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';

// @Injectable()
// export class PostsQueryRepository {
//   constructor(
//     @InjectModel(Post.name) private readonly postsModel: PostModel,
//     @InjectModel(Comment.name) private readonly commentsModel: CommentModel,
//   ) {}

//   async findAllPosts(
//     query: PostsQueryDto,
//     userId?: string,
//   ): Promise<PostsPaginatedViewModel> {
//     const [items, totalCount] = await Promise.all([
//       this.postsModel
//         .find({})
//         .sort(query.calculateSort())
//         .skip(query.calculateSkip())
//         .limit(query.pageSize)
//         .lean<PostLean[]>()
//         .exec(),

//       this.postsModel.countDocuments({}),
//     ]);

//     return PostsPaginatedViewModel.mapToView({
//       pagesCount: Math.ceil(totalCount / query.pageSize),
//       page: query.pageNumber,
//       pageSize: query.pageSize,
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

//   async findPostById(
//     id: string,
//     userId?: string,
//   ): Promise<PostViewModel | null> {
//     const existingPost = await this.postsModel
//       .findById(id)
//       .lean<PostLean>()
//       .exec();

//     if (!existingPost) return null;

//     const myStatus = userId
//       ? await this.findUserCurrentLikeStatus(userId, id)
//       : LikeStatus.None;

//     const postOutput = PostViewModel.mapToViewModel(
//       existingPost,
//       myStatus ?? LikeStatus.None,
//     );

//     return postOutput;
//   }

//   async findCommentsByPostId(
//     postId: string,
//     query: PostsQueryDto,
//     userId?: string,
//   ): Promise<CommentsPaginatedViewModel> {
//     const filter = {
//       postId: new Types.ObjectId(postId),
//       isBanned: { $ne: true }, // забаненные комментарии не будут попадать ни в items, ни в totalCount
//     };

//     const [items, totalCount] = await Promise.all([
//       this.commentsModel
//         .find(filter)
//         .sort(query.calculateSort())
//         .skip(query.calculateSkip())
//         .limit(query.pageSize)
//         .lean<CommentLean[]>()
//         .exec(),

//       this.commentsModel.countDocuments(filter).exec(),
//     ]);

//     return CommentsPaginatedViewModel.mapToView({
//       pagesCount: Math.ceil(totalCount / query.pageSize),
//       page: query.pageNumber,
//       pageSize: query.pageSize,
//       totalCount,

//       items: items.map((post) => {
//         const myStatus = userId
//           ? (post.likesInfo.userReactions.find(
//               (reaction) => reaction.userId === userId,
//             )?.status ?? LikeStatus.None)
//           : LikeStatus.None;

//         return CommentViewModel.mapToViewModel(
//           post,
//           myStatus ?? LikeStatus.None,
//         );
//       }),
//     });
//   }

//   async findUserCurrentLikeStatus(
//     userId: string,
//     postId: string,
//   ): Promise<LikeStatus | null> {
//     const postInstance = await this.postsModel
//       .findById(postId)
//       .lean<PostLean>()
//       .exec();

//     const userLikeStatus =
//       postInstance?.extendedLikesInfo?.userReactions?.find(
//         (reaction) => reaction.userId === userId,
//       )?.status ?? LikeStatus.None;

//     return userLikeStatus;
//   }
// }
