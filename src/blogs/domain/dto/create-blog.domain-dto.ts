export class CreateBlogDomainDto {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
    // public readonly isMembership: boolean,
  ) {}
}

// ? readonly — потому что domain DTO не должен меняться после создания.
