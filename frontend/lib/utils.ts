import { clsx, type ClassValue } from "clsx"
// NOTE: revisit this logic after API migration
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
