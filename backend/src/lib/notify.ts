import * as db from "@workspace/db";

type Channel = "email" | "sms";

const CATEGORY_TO_PREF_KEYS: Record<string, string[]> = {
  // client
  appointment: ["appointments"],
  document: ["documents"],
  message: ["messages"],
  reminder: ["appointments"],
  system: ["promos", "appointments"],
  // lawyer
  payment: ["payments"],
  review: ["reviews"],
  hearing: ["hearings"],
};

function categoryPrefIds(type: string): string[] {
  return CATEGORY_TO_PREF_KEYS[type] ?? [type];
}

export async function isChannelEnabled(
  userId: string,
  type: string,
  channel: Channel
): Promise<boolean> {
  const user = (await db.User.findOne({ id: userId }).lean()) as unknown as
    | { notificationPreferences?: Map<string, boolean> | Record<string, boolean> }
    | null;
  if (!user) return true;
  const raw = user.notificationPreferences;
  const map: Map<string, boolean> =
    raw instanceof Map ? raw : new Map(Object.entries((raw as Record<string, boolean>) ?? {}));
  // If no pref stored yet, default to true for most, false for promos per model defaults.
  // Fallback: check compound keys for the categories that map to this type.
  for (const prefId of categoryPrefIds(type)) {
    const key = `${prefId}_${channel}`;
    if (map.has(key)) {
      if (map.get(key) === true) return true;
    }
  }
  // If type maps to multiple prefIds, enabled if any is enabled.
  // If none of the mapped keys exist, treat as enabled (except promos which defaults false but is in DB defaults).
  // To respect defaults, we check map size: if map has prefIds but all false => disabled.
  // If no mapped key exists at all, assume enabled.
  const hasAnyMappedKey = categoryPrefIds(type).some((id) => map.has(`${id}_${channel}`));
  if (!hasAnyMappedKey) return true;
  return false;
}

export async function shouldSendForUser(
  userId: string,
  type: string,
): Promise<{ email: boolean; sms: boolean }> {
  const [email, sms] = await Promise.all([
    isChannelEnabled(userId, type, "email"),
    isChannelEnabled(userId, type, "sms"),
  ]);
  return { email, sms };
}
