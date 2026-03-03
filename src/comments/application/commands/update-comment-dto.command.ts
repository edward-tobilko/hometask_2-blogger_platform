import { UpdateCommentDtoEntity } from "../../domain/value-objects/update-comment-dto.entity";

export type UpdateCommentDtoCommand = UpdateCommentDtoEntity & {
  commentId: string;
};
