import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import { LikeStatus } from 'src/core/enums/like-status.enum';
// import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { CreatePostDomainDto } from '../../../domain/dto/create-post.domain-dto';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsRepo: Repository<PostOrmEntity>,

    // private readonly usersExternalQueryRepo: UsersExternalQueryRepository,
  ) {}

  async findById(id: string): Promise<PostOrmEntity | null> {
    return this.postsRepo.findOne({ where: { id } });
  }

  async save(post: PostOrmEntity): Promise<PostOrmEntity> {
    return this.postsRepo.save(post);
  }

  async create(dto: CreatePostDomainDto, name: string): Promise<PostOrmEntity> {
    const postInstance = this.postsRepo.create({
      ...dto,

      blogName: name, // + опциональное поле с блога
    });

    return this.save(postInstance);
  }

  async delete(id: string): Promise<void> {
    await this.postsRepo.delete(id);
  }

  //   async setLikeStatusForPost(
  //     postId: string,
  //     userId: string,
  //     likes: number,
  //     dislikes: number,
  //     likeStatus: LikeStatus,
  //   ): Promise<void> {
  //     // * Получаем данные пользователя (login) с гарда в контроллере.
  //     const userInstance =
  //       await this.usersExternalQueryRepo.getByIdOrNotFoundFail(userId);

  //     // * Удалить старую реакцию и обновить счётчики
  //     await this.postModel
  //       .updateOne(
  //         {
  //           _id: new Types.ObjectId(postId),
  //         },

  //         {
  //           // * $inc — изменяет счётчики
  //           $inc: {
  //             'extendedLikesInfo.likesCount': likes,
  //             'extendedLikesInfo.dislikesCount': dislikes,
  //           },

  //           // * $pull - удаляет из userReactions старую реакцию этого пользователя
  //           $pull: {
  //             'extendedLikesInfo.userReactions': { userId },
  //           },
  //         },
  //       )
  //       .exec();

  //     // * $push - добавляет новую реакцию (только если статус не "None"). Делается отдельным запросом потому что MongoDB не позволяет $pull и $push на одно и то же поле в одной операции.
  //     if (likeStatus !== LikeStatus.None) {
  //       await this.postModel
  //         .updateOne(
  //           {
  //             _id: new Types.ObjectId(postId),
  //           },
  //           {
  //             $push: {
  //               'extendedLikesInfo.userReactions': {
  //                 userId,
  //                 login: userInstance.login,
  //                 status: likeStatus,
  //                 addedAt: new Date(),
  //               },
  //             },
  //           },
  //         )
  //         .exec();
  //     }

  //     const postInstance = await this.postModel.findById(postId);

  //     // * Выводим только лайки (filter) -> сортируем от новых к старым (sort) -> выводим только 3 (slice) -> мапим результат (map).
  //     const newestLikes = postInstance?.extendedLikesInfo.userReactions
  //       .filter((reaction) => reaction.status === LikeStatus.Like)
  //       .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
  //       .slice(0, 3)
  //       .map((result) => ({
  //         userId: result.userId,
  //         login: result.login,
  //         status: result.status,
  //         addedAt: result.addedAt,
  //       }));

  //     // * Выводим результат обновленных newestLikes
  //     await this.postModel
  //       .updateOne(
  //         {
  //           _id: new Types.ObjectId(postId),
  //         },
  //         {
  //           $set: {
  //             'extendedLikesInfo.newestLikes': newestLikes,
  //           },
  //         },
  //       )
  //       .exec();
  //   }
}
