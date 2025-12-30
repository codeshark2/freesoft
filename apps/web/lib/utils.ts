import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLatency(ms: number): string {
  return `${Math.round(ms)}ms`;
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

export function formatDuration(seconds: number): string {
  return `${seconds}s`;
}
