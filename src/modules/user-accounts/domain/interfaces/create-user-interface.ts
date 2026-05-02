export interface CreateUserInterface {
  login: string;
  email: string;
  passwordHash: string;

  // name: {
  //   firstName: string;
  //   lastName: string;
  // };
}

// ? если у нас нету методов -> можно использовать interface вместо class.
