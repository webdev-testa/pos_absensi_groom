import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace('.0', '')}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000)}k`
  return `Rp ${n}`
}

export function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch { return iso }
}
