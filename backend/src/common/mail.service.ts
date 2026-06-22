import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendMail(options: { to: string; subject: string; html: string }) {
    console.log(`[MailService] Sending email to ${options.to}: ${options.subject}`);
    return { success: true };
  }

  async sendTrialWelcomeEmail(options: { email: string; firstName: string; trialEndDate: string }) {
    console.log(`[MailService] Trial welcome email to ${options.email}`);
    return { success: true };
  }
}
