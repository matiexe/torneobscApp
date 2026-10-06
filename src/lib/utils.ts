import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PLACEHOLDER_NAMES = ['1RO', '4TO', '2DO', '3ERO', 'FINALISTA 1', 'FINALISTA 2'];

export function getTeamLogo(teamName: string | undefined): string {
  if (!teamName) return '/logos/league_logo.png';
  const normalized = teamName.trim().toUpperCase();
  if (PLACEHOLDER_NAMES.includes(normalized) || normalized.startsWith('GANADOR') || normalized.startsWith('1º') || normalized.startsWith('2º') || normalized.startsWith('3º') || normalized.startsWith('4º')) {
    return '/logos/league_logo.png';
  }
  const slug = teamName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9_]/g, '');
  return `/logos/${slug}.png`;
}

