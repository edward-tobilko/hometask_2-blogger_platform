import { ApiProperty } from '@nestjs/swagger';

export class FieldErrorViewModel {
  @ApiProperty({
    nullable: true,
    description: 'Message with error explanation for certain field',
  })
  message!: string;

  @ApiProperty({
    nullable: true,
    description: 'What field/property of input model has error',
  })
  field!: string;
}

export class ValidationErrorViewModel {
  @ApiProperty({ type: [FieldErrorViewModel], nullable: true })
  errorsMessages!: FieldErrorViewModel[];
}
