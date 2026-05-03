export interface CreateUserInterface {
  login: string;
  email: string;
  passwordHash: string;
}

// ? если у нас нету методов -> можно использовать interface вместо class.
