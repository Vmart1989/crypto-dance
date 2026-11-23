import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.mail.ovh.net";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!user || !password || !from || !Number.isInteger(port)) {
    throw new Error("Email verification is not configured");
  }

  return { host, port, user, password, from };
}

export async function sendVerificationEmail({ email, token }) {
  if (process.env.NODE_ENV !== "production") return;

  const { host, port, user, password, from } = getSmtpConfig();
  const appUrl = (process.env.APP_URL || "https://cryptodance.app").replace(
    /\/$/,
    ""
  );
  const verifyUrl = new URL("/api/auth/verify-email", appUrl);
  verifyUrl.searchParams.set("token", token);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    tls: { minVersion: "TLSv1.2" },
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your CryptoDance account",
      text: `Verify your CryptoDance account: ${verifyUrl.toString()}\n\nThis link expires in 24 hours.`,
      html: `<p>Welcome to CryptoDance.</p><p><a href="${verifyUrl.toString()}">Verify your account</a></p><p>This link expires in 24 hours.</p>`,
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "UNKNOWN";
    console.error(`OVH SMTP verification email failed (${code})`);
    throw new Error("Verification email could not be sent");
  } finally {
    transporter.close();
  }
}
