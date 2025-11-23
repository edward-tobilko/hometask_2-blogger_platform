import { FieldsOnly } from "../../core/types/fields-only.type";

export class AuthDomain {
  loginOrEmail: string;
  password: string;

  constructor(dto: FieldsOnly<AuthDomain>) {
    this.loginOrEmail = dto.loginOrEmail;
    this.password = dto.password;
  }
}
