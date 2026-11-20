export class UpdateQuestionDomainDto {
  constructor(
    public readonly body: string,
    public readonly correctAnswers: Array<string>,
  ) {}
}
