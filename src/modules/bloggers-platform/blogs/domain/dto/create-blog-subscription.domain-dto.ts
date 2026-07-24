export class CreateBlogSubscriptionDomainDto {
  constructor(
    public readonly userId: string,
    public readonly blogId: string,
  ) {}
}

// ? readonly — потому что domain DTO не должен меняться после создания.
