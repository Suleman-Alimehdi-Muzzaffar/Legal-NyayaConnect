import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function openMeetLink(link: string) {
  const win = window.open(link, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = link;
}
