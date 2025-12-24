import { ObjectId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { CreatePostCommentDtoDomain } from "./create-post-comment-dto.domain";

export class PostCommentDomain {
  _id?: ObjectId;
  content: string;
  postId: ObjectId;

  commentatorInfo: {
    userId: ObjectId;
    userLogin: string;
  };

  createdAt: Date;

  constructor(dto: FieldsOnly<PostCommentDomain>) {
    this.content = dto.content;
    this.postId = dto.postId;
    this.commentatorInfo = dto.commentatorInfo;
    this.createdAt = dto.createdAt;

    if (dto._id) this._id = dto._id;
  }

  static createCommentForPost(
    dto: CreatePostCommentDtoDomain
  ): PostCommentDomain {
    return new PostCommentDomain({
      postId: dto.postId,
      content: dto.content,

      commentatorInfo: {
        userId: dto.commentatorInfo.userId,
        userLogin: dto.commentatorInfo.userLogin,
      },

      createdAt: new Date(),
    });
  }
}

// ? PostCommentDomain — бизнес-объект (комментарий), который: хранит инварианты / правила (если ты их добавишь), отвечает за «правильное создание» сущности (createCommentForPost), ничего не знает о HTTP / Express / DB.
