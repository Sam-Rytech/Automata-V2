import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn
 * @param {*} ...inputs: ClassValue[]
 * @returns {*}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
