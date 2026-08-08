import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);

@Injectable()
export class CryptoService {
  constructor() {}

  async generateHash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(SALT_ROUNDS);

    return bcrypt.hash(password, saltRounds);
  }

  compareHash(pass: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pass, hash);
  }
}
