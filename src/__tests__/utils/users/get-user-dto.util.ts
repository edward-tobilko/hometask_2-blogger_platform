import { UserDtoDomain } from "users/domain/user-dto.domain";

export function getUserDto(): UserDtoDomain {
  return {
    login: "TekMr6PvRu",
    password: "qwerty123",
    email: "example1@example.dev",
  };
}
