export const emailTemplates = {
  registrationEmail(code: string): string {
    return `<h1>Thanks for your registration.</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`;
  },
};
