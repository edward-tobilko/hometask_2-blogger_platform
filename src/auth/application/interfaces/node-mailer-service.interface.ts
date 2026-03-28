export interface INodeMailerService {
  sendRegistrationConfirmationEmail(
    email: string,
    code: string,
    template: (code: string) => string
  ): Promise<boolean>;

  sendRecoveryPasswordEmail(
    email: string,
    recoveryCode: string,
    template: (recoveryCode: string) => string
  ): Promise<boolean>;
}
