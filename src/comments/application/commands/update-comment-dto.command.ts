import { UpdateCommentDtoDomain } from "../../domain/update-comment-dto.domain";

export type UpdateCommentDtoCommand = UpdateCommentDtoDomain & {
  commentId: string;
};
