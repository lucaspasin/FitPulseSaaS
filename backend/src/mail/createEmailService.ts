import nodemailer from 'nodemailer';
import { HttpError } from '../http/HttpError.js';
import { EmailMessage, IEmailService, SendEmailResult } from './IEmailService.js';

function mailFrom(): string {
  if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
  if (process.env.RESEND_API_KEY) return 'FitPulse <beth.t@example.com>';
  return 'FitPulse <noreply@fitpulse.local>';
}

class ResendEmailService implements IEmailService {
  constructor(private readonly apiKey: string) {}

  async send(message: EmailMessage): Promise<SendEmailResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: mailFrom(),
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text
      })
    });

    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    if (!response.ok) {
      const errorValue = (payload as { error?: unknown; message?: unknown }).error;
      const messageValue = (payload as { message?: unknown }).message;
      const detail =
        typeof errorValue === 'string'
          ? errorValue
          : typeof messageValue === 'string'
            ? messageValue
            : typeof errorValue === 'object' && errorValue && 'message' in errorValue
              ? String((errorValue as { message: unknown }).message)
              : `HTTP ${response.status}`;
      throw new HttpError(502, `Falha ao enviar e-mail: ${detail}`);
    }

    return { provider: 'resend' };
  }
}

class NodemailerEmailService implements IEmailService {
  constructor(
    private readonly transporter: nodemailer.Transporter,
    private readonly provider: 'smtp' | 'ethereal'
  ) {}

  async send(message: EmailMessage): Promise<SendEmailResult> {
    const info = await this.transporter.sendMail({
      from: mailFrom(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (this.provider === 'ethereal') {
      console.log(`Ethereal email preview: ${previewUrl || '(unavailable)'}`);
    }

    return {
      provider: this.provider,
      previewUrl: typeof previewUrl === 'string' ? previewUrl : undefined
    };
  }
}

export async function createEmailService(): Promise<IEmailService> {
  if (process.env.RESEND_API_KEY) {
    console.log('Email provider: Resend');
    return new ResendEmailService(process.env.RESEND_API_KEY);
  }

  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '') }
        : undefined
    });
    console.log(`Email provider: SMTP (${process.env.SMTP_HOST}:${port})`);
    return new NodemailerEmailService(transporter, 'smtp');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email is not configured. Set RESEND_API_KEY or SMTP_HOST.');
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  console.log(`Email provider: Ethereal (${testAccount.user}) — messages are captured for preview, not real inboxes`);
  return new NodemailerEmailService(transporter, 'ethereal');
}
