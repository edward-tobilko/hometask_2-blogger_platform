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
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain-dto';

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

  async create(dto: CreatePostDomainDto, name: string): Promise<PostDocument> {
    const postInstance = this.postModel.createPostInstance({
      ...dto,

      blogName: name, // + опциональное поле с блога
    });

    await this.save(postInstance);

    return postInstance;
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
    // * Получаем данные пользователя (login) с гарда в контроллере.
    const userInstance =
      await this.usersExternalQueryRepo.getByIdOrNotFoundFail(userId);

    // * Удалить старую реакцию и обновить счётчики
    await this.postModel
      .updateOne(
        {
          _id: new Types.ObjectId(postId),
        },

        {
          // * $inc — изменяет счётчики
          $inc: {
            'extendedLikesInfo.likesCount': likes,
            'extendedLikesInfo.dislikesCount': dislikes,
          },

          // * $pull - удаляет из userReactions старую реакцию этого пользователя
          $pull: {
            'extendedLikesInfo.userReactions': { userId },
          },
        },
      )
      .exec();

    // * $push - добавляет новую реакцию (только если статус не "None"). Делается отдельным запросом потому что MongoDB не позволяет $pull и $push на одно и то же поле в одной операции.
    if (likeStatus !== LikeStatus.None) {
      await this.postModel
        .updateOne(
          {
            _id: new Types.ObjectId(postId),
          },
          {
            $push: {
              'extendedLikesInfo.userReactions': {
                userId,
                login: userInstance.login,
                status: likeStatus,
                addedAt: new Date(),
              },
            },
          },
        )
        .exec();
    }

    const postInstance = await this.postModel.findById(postId);

    // * Выводим только лайки (filter) -> сортируем от новых к старым (sort) -> выводим только 3 (slice) -> мапим результат (map).
    const newestLikes = postInstance?.extendedLikesInfo.userReactions
      .filter((reaction) => reaction.status === LikeStatus.Like)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, 3)
      .map((result) => ({
        userId: result.userId,
        login: result.login,
        status: result.status,
        addedAt: result.addedAt,
      }));

    // * Выводим результат обновленных newestLikes
    await this.postModel
      .updateOne(
        {
          _id: new Types.ObjectId(postId),
        },
        {
          $set: {
            'extendedLikesInfo.newestLikes': newestLikes,
          },
        },
      )
      .exec();
  }
}
