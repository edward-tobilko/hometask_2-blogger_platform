import bcrypt from "bcrypt";

const saltRounds = 10;

export const passwordHasher = {
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  },

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
