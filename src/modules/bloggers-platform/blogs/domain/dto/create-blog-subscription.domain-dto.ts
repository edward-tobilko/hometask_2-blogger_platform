export class CreateBlogSubscriptionDomainDto {
  constructor(
    public readonly blogId: string, // DTO создаётся из HTTP слоя (path param всегда строка)
    public readonly userId: string,
  ) {}
}
