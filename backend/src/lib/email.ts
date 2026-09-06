import nodemailer from "nodemailer";
import { isChannelEnabled } from "./notify";
import { logger } from "./logger";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function stripQuotes(v?: string): string | undefined {
  return v?.replace(/^"(.*)"$/, "$1").trim();
}

function extractEmail(raw: string): string {
  const m = raw.match(/<([^>]+)>/);
  return m ? m[1].trim() : raw.trim();
}

function getGmailTransporter(): ReturnType<typeof nodemailer.createTransport> | null {
  const gmailUser = stripQuotes(process.env.GMAIL_USER);
  const fromRaw = stripQuotes(process.env.FROM_EMAIL) ?? "";
  const user = gmailUser || (fromRaw ? extractEmail(fromRaw) : "") || "nyayaconnect.help@gmail.com";
  const pass = stripQuotes(process.env.GMAIL_APP_PASSWORD)?.replace(/\s/g, "");
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendEmailIfEnabled(
  userId: string,
  toEmail: string,
  category: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const enabled = await isChannelEnabled(userId, category, "email");
  if (!enabled) {
    logger.info({ userId, category, toEmail }, "email suppressed by preference");
    return false;
  }
  const from = stripQuotes(process.env.FROM_EMAIL) ?? "NyayaConnect <nyayaconnect.help@gmail.com>";
  const client = getGmailTransporter();
  if (!client) {
    logger.info({ userId, category, toEmail, subject }, "email would be sent (GMAIL_APP_PASSWORD not configured, skipping)");
    return false;
  }
  try {
    const replyTo = stripQuotes(process.env.REPLY_TO);
    await client.sendMail({
      from,
      to: toEmail,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    logger.info({ userId, category, toEmail, from }, "email sent via gmail smtp");
    return true;
  } catch (err) {
    logger.error({ err, toEmail, category, from }, "gmail smtp send failed - check GMAIL_APP_PASSWORD and that 2-Step Verification is on");
    return false;
  }
}
