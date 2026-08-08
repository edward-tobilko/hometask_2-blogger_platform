export class CreateBlogSubscriptionDomainDto {
  constructor(
    public readonly userId: string,
    public readonly blogId: string, // DTO создаётся из HTTP слоя (path param всегда строка)
  ) {}
}

// ? readonly — потому что domain DTO не должен меняться после создания.
