import nodemailer from "nodemailer";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanDisplayName(value) {
  const name = typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim() : "";
  return name || "there";
}

function createVerificationEmail({ name, verifyUrl, logoUrl, websiteUrl }) {
  const displayName = cleanDisplayName(name);
  const safeName = escapeHtml(displayName);
  const safeVerifyUrl = escapeHtml(verifyUrl);
  const safeLogoUrl = escapeHtml(logoUrl);
  const safeWebsiteUrl = escapeHtml(websiteUrl);

  return {
    subject: "Confirm your CryptoDance email address",
    text: [
      `Hi ${displayName},`,
      "",
      "Welcome to CryptoDance. Confirm your email address to activate your account and start practising with the crypto trading simulator.",
      "",
      "Verify your email:",
      verifyUrl,
      "",
      "This secure link expires in 24 hours. If you did not create a CryptoDance account, you can safely ignore this email.",
      "",
      "CryptoDance",
      "Practice crypto trading without real financial exposure.",
      websiteUrl,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirm your CryptoDance email address</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f3ff;color:#19152b;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Confirm your email to activate your CryptoDance account. This link expires in 24 hours.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f5f3ff;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e6e0ff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="height:6px;background-color:#6d28d9;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:30px 36px 18px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:12px;">
                      <img src="${safeLogoUrl}" width="46" height="46" alt="CryptoDance" style="display:block;width:46px;height:46px;border:0;border-radius:12px;">
                    </td>
                    <td style="vertical-align:middle;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-0.5px;color:#19152b;">Crypto<span style="color:#6d28d9;">Dance</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 36px 36px;">
                <p style="margin:0 0 12px;font-size:16px;line-height:25px;color:#504a68;">Hi ${safeName},</p>
                <h1 style="margin:0 0 16px;font-size:30px;line-height:38px;letter-spacing:-0.8px;color:#19152b;">Confirm your email address</h1>
                <p style="margin:0 0 26px;font-size:16px;line-height:25px;color:#504a68;">Welcome to CryptoDance. Confirm your email to activate your account and start practising with the crypto trading simulator.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px;">
                  <tr>
                    <td bgcolor="#6d28d9" style="border-radius:10px;">
                      <a href="${safeVerifyUrl}" style="display:inline-block;padding:14px 24px;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">Verify email address</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f7f5ff;border:1px solid #e8e3ff;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;font-size:14px;line-height:21px;color:#5d5673;">
                      <strong style="color:#302a46;">This link expires in 24 hours.</strong><br>
                      If you did not create a CryptoDance account, you can safely ignore this email.
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 8px;font-size:13px;line-height:20px;color:#756e89;">If the button does not work, copy and paste this address into your browser:</p>
                <p style="margin:0;font-size:13px;line-height:20px;word-break:break-all;"><a href="${safeVerifyUrl}" style="color:#6d28d9;text-decoration:underline;">${safeVerifyUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 36px;background-color:#faf9ff;border-top:1px solid #ece8f8;font-size:12px;line-height:19px;color:#756e89;">
                CryptoDance is an educational trading simulator. No real crypto assets are purchased.<br>
                <a href="${safeWebsiteUrl}" style="color:#6d28d9;text-decoration:none;">${safeWebsiteUrl}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

function createRegistrationNotification({ name, email, registeredAt, adminUrl, logoUrl }) {
  const displayName = cleanDisplayName(name);
  const safeName = escapeHtml(displayName);
  const safeEmail = escapeHtml(email);
  const safeAdminUrl = escapeHtml(adminUrl);
  const safeLogoUrl = escapeHtml(logoUrl);
  const formattedAt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(registeredAt);

  return {
    subject: "New CryptoDance user registration",
    text: [
      "A new user registered on CryptoDance.",
      "",
      `Name: ${displayName}`,
      `Email: ${email}`,
      `Registered: ${formattedAt} (Europe/Paris)`,
      "",
      `Review users: ${adminUrl}`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New CryptoDance user registration</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f3ff;color:#19152b;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f5f3ff;">
      <tr>
        <td align="center" style="padding:30px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background-color:#ffffff;border:1px solid #e6e0ff;border-radius:18px;overflow:hidden;">
            <tr><td style="height:6px;background-color:#6d28d9;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:28px 32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:11px;"><img src="${safeLogoUrl}" width="42" height="42" alt="CryptoDance" style="display:block;width:42px;height:42px;border:0;border-radius:11px;"></td>
                    <td style="vertical-align:middle;font-size:20px;line-height:26px;font-weight:700;color:#19152b;">Crypto<span style="color:#6d28d9;">Dance</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 32px 34px;">
                <p style="margin:0 0 8px;font-size:13px;line-height:20px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:#6d28d9;">New registration</p>
                <h1 style="margin:0 0 20px;font-size:26px;line-height:34px;letter-spacing:-0.6px;color:#19152b;">A new user joined CryptoDance</h1>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f8f7ff;border:1px solid #e9e5fb;border-radius:12px;">
                  <tr><td style="padding:18px 20px 8px;font-size:12px;line-height:18px;font-weight:700;text-transform:uppercase;color:#817991;">Name</td></tr>
                  <tr><td style="padding:0 20px 14px;font-size:16px;line-height:24px;color:#2f2944;">${safeName}</td></tr>
                  <tr><td style="padding:0 20px 8px;font-size:12px;line-height:18px;font-weight:700;text-transform:uppercase;color:#817991;">Email</td></tr>
                  <tr><td style="padding:0 20px 14px;font-size:16px;line-height:24px;color:#2f2944;word-break:break-all;">${safeEmail}</td></tr>
                  <tr><td style="padding:0 20px 8px;font-size:12px;line-height:18px;font-weight:700;text-transform:uppercase;color:#817991;">Registered</td></tr>
                  <tr><td style="padding:0 20px 18px;font-size:16px;line-height:24px;color:#2f2944;">${escapeHtml(formattedAt)} <span style="color:#817991;">(Europe/Paris)</span></td></tr>
                </table>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                  <tr><td bgcolor="#6d28d9" style="border-radius:10px;"><a href="${safeAdminUrl}" style="display:inline-block;padding:13px 21px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">Review users</a></td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

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

function createSmtpTransporter({ host, port, user, password }) {
  return nodemailer.createTransport({
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
}

export async function sendVerificationEmail({ email, name, token }) {
  if (process.env.NODE_ENV !== "production") return;

  const { host, port, user, password, from } = getSmtpConfig();
  const appUrl = (process.env.APP_URL || "https://www.cryptodance.app").replace(
    /\/$/,
    ""
  );
  const verifyUrl = new URL("/api/auth/verify-email", appUrl);
  verifyUrl.searchParams.set("token", token);
  const logoUrl = new URL("/logo.png", appUrl).toString();
  const message = createVerificationEmail({
    name,
    verifyUrl: verifyUrl.toString(),
    logoUrl,
    websiteUrl: appUrl,
  });

  const transporter = createSmtpTransporter({ host, port, user, password });

  try {
    await transporter.sendMail({
      from,
      to: email,
      replyTo: user,
      subject: message.subject,
      text: message.text,
      html: message.html,
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

export async function sendPasswordResetEmail({ email, token, path }) {
  const config = getSmtpConfig();
  const appUrl = process.env.APP_URL || "https://www.cryptodance.app";
  const resetUrl = new URL(path, appUrl);
  resetUrl.hash = new URLSearchParams({ token }).toString();
  const link = escapeHtml(resetUrl.toString());
  const logo = escapeHtml(new URL("/logo.png", appUrl).toString());
  const transporter = createSmtpTransporter(config);
  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: "Reset your CryptoDance password",
      text: `Reset your CryptoDance password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request it, you can ignore this email.`,
      html: `<div style="max-width:520px;margin:24px auto;padding:28px;border:1px solid #e4d9fa;border-radius:16px;font-family:Arial,sans-serif;color:#201632">
        <img src="${logo}" width="44" height="44" alt="CryptoDance">
        <h1 style="font-size:24px">Reset your password</h1>
        <p>Use the link below to choose a new password for your CryptoDance account.</p>
        <p><a href="${link}" style="display:inline-block;background:#6d28d9;color:#fff;border-radius:8px;padding:12px 18px;text-decoration:none">Reset password</a></p>
        <p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>
      </div>`,
    });
  } finally {
    transporter.close();
  }
}

export async function sendNewUserNotification({ email, name, registeredAt }) {
  if (process.env.NODE_ENV !== "production") return;

  const { host, port, user, password, from } = getSmtpConfig();
  const recipient = process.env.REGISTRATION_NOTIFICATION_EMAIL || user;
  const appUrl = (process.env.APP_URL || "https://www.cryptodance.app").replace(
    /\/$/,
    ""
  );
  const message = createRegistrationNotification({
    name,
    email,
    registeredAt,
    adminUrl: new URL("/admin/users", appUrl).toString(),
    logoUrl: new URL("/logo.png", appUrl).toString(),
  });
  const transporter = createSmtpTransporter({ host, port, user, password });

  try {
    await transporter.sendMail({
      from,
      to: recipient,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "UNKNOWN";
    console.error(`New user notification email failed (${code})`);
    throw new Error("New user notification could not be sent");
  } finally {
    transporter.close();
  }
}
