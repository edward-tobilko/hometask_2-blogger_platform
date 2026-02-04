export interface INodeMailerService {
  sendRegistrationConfirmationEmail(
    email: string,
    code: string,
    template: (code: string) => string
  ): Promise<boolean>;
}
