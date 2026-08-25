import twilio from "twilio";
import { isChannelEnabled } from "./notify";
import { logger } from "./logger";

let twilioClient: ReturnType<typeof twilio> | null = null;
function getTwilio(): ReturnType<typeof twilio> | null {
  const sid = process.env.TWILIO_ACCOUNT_SID?.replace(/^"(.*)"$/, "$1").trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.replace(/^"(.*)"$/, "$1").trim();
  if (!sid || !token) return null;
  if (!twilioClient) twilioClient = twilio(sid, token);
  return twilioClient;
}

export async function sendSmsIfEnabled(
  userId: string,
  toPhone: string,
  category: string,
  body: string,
): Promise<boolean> {
  const enabled = await isChannelEnabled(userId, category, "sms");
  if (!enabled) {
    logger.info({ userId, category, toPhone }, "sms suppressed by preference");
    return false;
  }
  const client = getTwilio();
  const from = process.env.TWILIO_PHONE_NUMBER?.replace(/^"(.*)"$/, "$1").trim();
  if (!client || !from) {
    logger.info({ userId, category, toPhone, body: body.slice(0, 120) }, "sms would be sent (TWILIO not configured, skipping)");
    return false;
  }
  if (!toPhone) {
    logger.warn({ userId, category }, "sms skipped: no phone");
    return false;
  }
  try {
    await client.messages.create({ from, to: toPhone, body });
    logger.info({ userId, category, toPhone }, "sms sent via twilio");
    return true;
  } catch (err) {
    logger.error({ err, toPhone, category }, "twilio send failed");
    return false;
  }
}
