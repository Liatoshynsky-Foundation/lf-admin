import nodemailer from 'nodemailer';

import { sendPasswordResetEmail } from './emailService';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  })
}));

describe('emailService', () => {
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const transport = nodemailer.createTransport();
    mockSendMail = transport.sendMail as jest.Mock;

    process.env.SMTP_USER = 'test@example.com';
    process.env.NEXT_PUBLIC_CLIENT_BASE_URL = 'https://test-url.com';
  });

  afterEach(() => {
    delete process.env.SMTP_USER;
    delete process.env.NEXT_PUBLIC_CLIENT_BASE_URL;
  });

  it('should send an email with the correct parameters', async () => {
    const to = 'admin@example.com';
    const resetLink = 'https://test-url.com/reset-password?token=123';

    await sendPasswordResetEmail(to, resetLink);

    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const mailOptions = mockSendMail.mock.calls[0][0];

    expect(mailOptions.from).toBe('"Фундація Лятошинського" <test@example.com>');
    expect(mailOptions.to).toBe(to);
    expect(mailOptions.subject).toBe('Відновлення пароля');
    expect(mailOptions.html).toContain(resetLink);
    expect(mailOptions.html).toContain('https://test-url.com/icons/logo_png.png');
  });

  it('should use localhost fallback if NEXT_PUBLIC_CLIENT_BASE_URL is not provided', async () => {
    delete process.env.NEXT_PUBLIC_CLIENT_BASE_URL;

    const to = 'admin@example.com';
    const resetLink = 'http://localhost:3000/reset-password?token=123';

    await sendPasswordResetEmail(to, resetLink);

    const mailOptions = mockSendMail.mock.calls[0][0];

    expect(mailOptions.html).toContain('http://localhost:3000/icons/logo_png.png');
  });
});
