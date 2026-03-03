import { UpdatePostDtoEntity } from "../../domain/value-objects/update-post-dto.entity";

export type UpdatePostDtoCommand = UpdatePostDtoEntity & {
  id: string;
};

// ? dto (Data Transfer Object) - то, что присылает клиент.
