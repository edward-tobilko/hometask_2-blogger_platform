export class RepositoryNotFoundError extends Error {
  constructor(message: string) {
    super(message);

    this.name = new.target.name;

    Object.setPrototypeOf(this, new.target.prototype); // перехвачиваем ошибки в handler с repo or service
  }
}
