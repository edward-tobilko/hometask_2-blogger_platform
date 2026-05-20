import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import {
  Post,
  PostDocument,
  PostModel,
} from '../../domain/entities/post.entity';
import { LikeStatus } from 'src/core/enums/like-status.enum';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModel,

    private readonly usersExternalQueryRepo: UsersExternalQueryRepository,
  ) {}

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id).exec();
  }

  async save(postDoc: PostDocument): Promise<void> {
    await postDoc.save();
  }

  async delete(id: string): Promise<void> {
    await this.postModel.findByIdAndDelete(id).exec();
  }

  async setLikeStatusForPost(
    postId: string,
    userId: string,
    likes: number,
    dislikes: number,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const userInstance =
      await this.usersExternalQueryRepo.getByIdOrNotFoundFail(userId);

    // * Удалить старую реакцию и обновить счётчики
    await this.postModel
      .updateOne(
        {
          _id: new Types.ObjectId(postId),
        },
        {
          $inc: {
            'extendedLikesInfo.likesCount': likes,
            'extendedLikesInfo.dislikesCount': dislikes,
          },

          $pull: {
            'extendedLikesInfo.userReactions': { userId },
          },
        },
      )
      .exec();

    // * Добавить новую реакцию (только если статус не None)
    if (likeStatus !== LikeStatus.None) {
      await this.postModel
        .updateOne(
          {
            _id: new Types.ObjectId(postId),
          },
          {
            $push: {
              'extendedLikesInfo.userReactions': { userId, status: likeStatus },
            },
          },
        )
        .exec();
    }
  }
}

// ⏺ Две проблемы:

//   1. userInstance получается но нигде не используется (строка 40-41)

//   login нужен для обновления newestLikes, но ты его не передаёшь в $push. Либо используй userInstance.login, либо убери лишний
//   запрос.

//   2. newestLikes не обновляется

//   После изменения userReactions нужно пересчитать newestLikes — 3 последних Like из userReactions. Это нужно делать отдельным шагом
//   после обновления userReactions.

//   Но для этого нужно поле addedAt в userReactions — иначе нельзя определить порядок. Сейчас в $push только { userId, status }.

//   Исправь $push строка 71:
//   'extendedLikesInfo.userReactions': {
//     userId,
//     login: userInstance.login,
//     status: likeStatus,
//     addedAt: new Date(),
//   }

//   После второго updateOne добавь третий запрос — пересчёт newestLikes. Нужно прочитать пост, взять все userReactions со status: Like,
//    отсортировать по addedAt desc, взять первые 3, записать в newestLikes:

//   const post = await this.postModel.findById(postId).lean().exec();
//   const newestLikes = post.extendedLikesInfo.userReactions
//     .filter(r => r.status === LikeStatus.Like)
//     .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
//     .slice(0, 3)
//     .map(r => ({ userId: r.userId, login: r.login, addedAt: r.addedAt }));

//   await this.postModel.updateOne(
//     { _id: new Types.ObjectId(postId) },
//     { $set: { 'extendedLikesInfo.newestLikes': newestLikes } },
//   ).exec();
