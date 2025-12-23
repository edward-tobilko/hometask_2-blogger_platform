import { UpdatePostDtoDomain } from "../../domain/update-post-dto.domain";

export type UpdatePostDtoCommand = UpdatePostDtoDomain & {
  id: string;
};

// ? dto (Data Transfer Object) - то, что присылает клиент.
