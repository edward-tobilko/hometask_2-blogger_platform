import "express";

declare global {
  declare namespace Express {
    export interface Request {
      user: IdType | undefined;
    }
  }
}

export {};

// ? import "express" - express говорит TS, какой модуль мы расширяем.
// ? declare global - делает тип доступным везде.
// ? файл становится модулем и TS не ругается.
