export type Theme = "light" | "dark" | "system";
export type FontScale = number;

const THEME_KEY = "nyayaconnect.theme";
const FONT_KEY = "nyayaconnect.fontScale";

export function themeStorageKey(userId?: string): string {
  return userId ? `${THEME_KEY}.${userId}` : THEME_KEY;
}

export function fontScaleStorageKey(userId?: string): string {
  return userId ? `${FONT_KEY}.${userId}` : FONT_KEY;
}

export function getSavedTheme(userId?: string): Theme {
  const saved = localStorage.getItem(themeStorageKey(userId));
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export function getSavedFontScale(userId?: string): number {
  const saved = Number(localStorage.getItem(fontScaleStorageKey(userId)));
  return saved === 0.875 || saved === 1 || saved === 1.125 ? saved : 1;
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyAppearance(theme: Theme, fontScale: number, userId?: string): void {
  document.documentElement.setAttribute("data-theme", resolveTheme(theme));
  document.documentElement.style.fontSize = `${16 * fontScale}px`;
  localStorage.setItem(themeStorageKey(userId), theme);
  localStorage.setItem(fontScaleStorageKey(userId), String(fontScale));
}

export function applyTheme(theme: Theme, userId?: string): void {
  applyAppearance(theme, getSavedFontScale(userId), userId);
}

export function applyFontScale(fontScale: number, userId?: string): void {
  document.documentElement.style.fontSize = `${16 * fontScale}px`;
  localStorage.setItem(fontScaleStorageKey(userId), String(fontScale));
}

export function resetAppearance(): void {
  applyAppearance("system", 1, undefined);
}

export function watchSystemTheme(onChange: (theme: Theme) => void): () => void {
  const mql = window.matchMedia("(prefers-color-scheme: light)");
  const handler = () => onChange(getSavedTheme());
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}