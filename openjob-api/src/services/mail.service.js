/** Layanan pengiriman email notifikasi menggunakan Nodemailer. */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const hasMailConfiguration = [
  process.env.MAIL_HOST,
  process.env.MAIL_PORT,
  process.env.MAIL_USER,
  process.env.MAIL_PASSWORD,
].every(Boolean);

const transporter = hasMailConfiguration
  ? nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    })
  : null;

export const sendApplicationNotificationEmail = async ({
  ownerEmail,
  applicantName,
  applicantEmail,
  applicationDate,
}) => {
  if (!transporter) {
    throw new Error("Konfigurasi email belum lengkap.");
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: ownerEmail,
    subject: "New Job Application Received",
    text: [
      "A new job application has been received.",
      `Applicant name: ${applicantName}`,
      `Applicant email: ${applicantEmail}`,
      `Application date: ${new Date(applicationDate).toISOString()}`,
    ].join("\n"),
  });
};
