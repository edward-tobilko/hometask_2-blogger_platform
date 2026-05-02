import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  constructor() {}

  async createPasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
  }
}
