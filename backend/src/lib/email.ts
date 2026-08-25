import { Resend } from "resend";
import { isChannelEnabled } from "./notify";
import { logger } from "./logger";

let resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.replace(/^"(.*)"$/, "$1").trim();
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
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
  const client = getResend();
  const from = process.env.FROM_EMAIL?.replace(/^"(.*)"$/, "$1").trim() ?? "support@nyayaconnect.in";
  if (!client) {
    logger.info({ userId, category, toEmail, subject }, "email would be sent (RESEND_API_KEY not configured, skipping)");
    return false;
  }
  try {
    const { error } = await client.emails.send({ from, to: toEmail, subject, html });
    if (error) {
      logger.error({ error, toEmail, category }, "resend send failed");
      return false;
    }
    logger.info({ userId, category, toEmail }, "email sent via resend");
    return true;
  } catch (err) {
    logger.error({ err, toEmail, category }, "resend exception");
    return false;
  }
}
