export class UserPasswordRecoveryEvent {
  constructor(
    public readonly email: string, // поле нельзя изменить после создания объекта. Попытка event.email = 'other' — ошибка компиляции
    public recoveryCode: string, // поле можно перезаписать в любой момент
  ) {}
}
