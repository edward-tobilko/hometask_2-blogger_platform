import { ApiProperty } from '@nestjs/swagger';

export class FieldErrorViewModel {
  @ApiProperty() message!: string;
  @ApiProperty() field!: string;
}

export class ValidationErrorViewModel {
  @ApiProperty({ type: [FieldErrorViewModel] })
  errorsMessages!: FieldErrorViewModel[];
}
