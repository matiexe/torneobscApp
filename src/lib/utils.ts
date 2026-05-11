import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTeamLogo(teamName: string | undefined): string {
  if (!teamName) return '/logos/league_logo.png';
  const slug = teamName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9_]/g, '');
  return `/logos/${slug}.png`;
}
