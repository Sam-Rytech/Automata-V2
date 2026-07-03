import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const combineClassNames = (inputs: ClassValue[]) => clsx(inputs)
const mergeTailwindClasses = (classes: string) => twMerge(classes)

export function cn(...inputs: ClassValue[]) {
  const combinedClasses = combineClassNames(inputs)
  return mergeTailwindClasses(combinedClasses)
}