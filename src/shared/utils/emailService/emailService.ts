import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASE_URL || 'http://localhost:3000';

  const logoUrl = `${baseUrl}/icons/logo_png.png`;

  const mailOptions = {
    from: `"Фундація Лятошинського" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Відновлення пароля',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6;">
        
        <!-- Логотип -->
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${logoUrl}" alt="Liatoshynsky Foundation" style="max-width: 150px;" />
        </div>

        <p>Вітаємо!</p>
        <p>Ми отримали запит на відновлення пароля для вашого облікового запису.</p>
        <p>Щоб встановити новий пароль, перейдіть за посиланням:</p>
        
        <!-- Кнопка скидання -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #D4AF37; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Відновити пароль
          </a>
        </div>

        <!-- Текстова лінка для підстраховки -->
        <p style="font-size: 14px; word-break: break-all;">
          Або скопіюйте це посилання та вставте його у рядок браузера:<br>
          <a href="${resetLink}" style="color: #0056b3;">${resetLink}</a>
        </p>

        <p>Посилання дійсне протягом 60 хвилин та може бути використане лише один раз.</p>
        <p>Якщо ви не надсилали цей запит, просто проігноруйте цей лист.</p>
        
        <br />
        <p>З повагою,<br /><strong>Команда Фундації Лятошинського</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
