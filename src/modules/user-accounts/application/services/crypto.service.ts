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

// ? CryptoService помещаем в application -> services потому, что bcrypt это npm-библиотека, не внешний сервис. Нет сети, нет IO, нет внешних зависимостей которые нужно мокать. Это просто алгоритм. Хэширование пароля — это бизнес-правило ("пароли должны храниться захэшированными"), а не детали инфраструктуры.
