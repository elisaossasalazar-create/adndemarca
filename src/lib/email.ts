import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Faltan variables de entorno SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS)"
    );
  }

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER!;
  await transporter.sendMail({ from, to, subject, html });
}
