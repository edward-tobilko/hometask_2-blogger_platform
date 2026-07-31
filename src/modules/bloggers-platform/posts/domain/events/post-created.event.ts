export class PostCreatedEvent {
  constructor(
    public readonly blogId: string,
    public readonly blogName: string,
    public readonly postTitle: string,
  ) {}
}
