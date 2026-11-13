export class CreateQuestionDomainDto {
  constructor(
    public readonly body: string,
    public readonly correctAnswers: Array<string>,
  ) {}
}
