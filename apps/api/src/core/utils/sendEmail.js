import nodemailer from "nodemailer";

const createTransporter = async () => {
  // ── Development (Ethereal) ────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // ── Production (real SMTP) ────────────────────────────────────────────────
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for port 465, false otherwise
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ email, subject, text, html }) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "Bus Ticketing"}" <${process.env.EMAIL_FROM_ADDRESS || "no-reply@busticket.com"}>`,
    to: email,
    subject,
    text,
    ...(html && { html }),
  };

  const info = await transporter.sendMail(mailOptions);

  // In development, log the Ethereal preview URL so you can inspect the email
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Email preview URL:", nodemailer.getTestMessageUrl(info));
  }
};
