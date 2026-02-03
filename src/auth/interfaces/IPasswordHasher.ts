export interface IPasswordHasher {
  generateHash(password: string): Promise<string>;

  checkPassword(password: string, hash: string): Promise<boolean>;
}
