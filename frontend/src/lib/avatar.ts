export function avatarUrl(avatar?: string | null): string {
  if (!avatar) return "";
  if (avatar.startsWith("data:")) return avatar;
  return `/api/account/avatar/${encodeURIComponent(avatar)}`;
}